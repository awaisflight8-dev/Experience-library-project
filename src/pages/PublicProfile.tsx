import React, { useEffect, useState } from 'react';
import { signOut } from 'firebase/auth';
import { auth, db } from '../lib/firebase';
import { collection, query, where, getDocs, orderBy, limit, Timestamp } from 'firebase/firestore';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { ArrowLeft, MapPin, Clock, Calendar, CheckCircle, BookOpen, Quote, Target, LogOut } from 'lucide-react';
import { useAuth, UserProfile } from '../contexts/AuthContext';
import ExpandableStoryCard from '../components/ExpandableStoryCard';

export default function PublicProfile() {
  const { user } = useAuth();
  const { username } = useParams<{ username: string }>();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [stories, setStories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    if (!username) return;

    const fetchProfileState = async () => {
      setLoading(true);
      try {
        const usersRef = collection(db, 'users');
        const q = query(usersRef, where('username', '==', username), limit(1));
        const querySnapshot = await getDocs(q);
        
        if (querySnapshot.empty) {
          setProfile(null);
          setLoading(false);
          return;
        }

        const userData = querySnapshot.docs[0].data() as UserProfile;
        setProfile(userData);

        // Fetch their stories
        const storiesRef = collection(db, 'stories');
        const storiesQuery = query(
          storiesRef, 
          where('authorId', '==', userData.uid),
          orderBy('createdAt', 'desc')
        );
        const storiesSnap = await getDocs(storiesQuery);
        setStories(storiesSnap.docs.map(d => ({ id: d.id, ...d.data() })));
      } catch (err) {
        console.error('Error fetching profile', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProfileState();
  }, [username]);

  const getActiveStatus = (lastActiveAt?: Timestamp, isOnline?: boolean) => {
    if (isOnline) return { text: 'Active now', color: 'bg-green-500' };
    if (!lastActiveAt) return { text: 'Offline', color: 'bg-gray-300' };
    
    // Check if within last 5 mins
    const diffMins = (new Date().getTime() - lastActiveAt.toDate().getTime()) / 60000;
    if (diffMins < 5) return { text: 'Active now', color: 'bg-green-500' };
    
    let timeText = '';
    if (diffMins < 60) timeText = `Active ${Math.floor(diffMins)}m ago`;
    else if (diffMins < 1440) timeText = `Active ${Math.floor(diffMins / 60)}h ago`;
    else timeText = `Active ${Math.floor(diffMins / 1440)}d ago`;

    return { text: timeText, color: 'bg-gray-300' };
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F0F2F5] flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-gray-300 border-t-black animate-spin" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-[#F0F2F5] flex flex-col items-center justify-center p-4">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Profile not found</h1>
        <button onClick={() => navigate('/home')} className="text-[#0866FF] font-medium hover:underline">
          Return to Home
        </button>
      </div>
    );
  }

  const activeStatus = getActiveStatus(profile.lastActiveAt, profile.isOnline);

  const handleBack = () => {
    if (window.history.length > 2) {
      navigate(-1);
    } else {
      navigate('/home');
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.3 }}
      className="min-h-screen bg-[#F0F2F5] pb-24 font-sans text-[#050505]"
    >
      {/* Header */}
      <nav className="fixed top-0 w-full z-50 bg-white shadow-sm h-14 flex items-center px-4">
        <div className="max-w-[800px] w-full mx-auto flex items-center justify-between">
          <div className="flex items-center">
            <button onClick={handleBack} className="p-2 hover:bg-[#F0F2F5] rounded-full transition-colors mr-2">
              <ArrowLeft className="w-5 h-5" />
            </button>
            <span className="font-bold text-[17px]">{profile.username}</span>
          </div>
          
          {user?.uid === profile.uid && (
            <div className="flex items-center gap-2">
              <button 
                onClick={() => navigate('/edit-profile')}
                className="flex items-center gap-2 px-3 py-1.5 bg-[#E4E6EB] hover:bg-[#D8DADF] rounded-lg transition-colors text-[14px] font-semibold text-gray-700"
              >
                Edit Profile
              </button>
              <button 
                onClick={async () => {
                  await signOut(auth);
                  navigate('/');
                }}
                className="flex items-center gap-2 px-3 py-1.5 bg-[#E4E6EB] hover:bg-[#D8DADF] rounded-lg transition-colors text-[14px] font-semibold text-gray-700"
              >
                <LogOut className="w-4 h-4" />
                Sign Out
              </button>
            </div>
          )}
        </div>
      </nav>

      <main className="max-w-[800px] mx-auto pt-20 px-4">
        {/* Profile Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden mb-6">
          <div className="h-32 bg-gray-900 relative">
             <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_20%_20%,_#ffffff_10%,_transparent_20%)] bg-[length:40px_40px]" />
          </div>
          <div className="px-6 pb-6 relative">
            <div className="flex justify-between items-end -mt-16 mb-4">
              <div className="relative">
                <div className="w-32 h-32 rounded-full border-4 border-white bg-[#E4E6EB] flex items-center justify-center overflow-hidden z-10 relative">
                  {profile.profileImage || profile.profilePhoto ? (
                    <img src={profile.profileImage || profile.profilePhoto!} alt={profile.username} className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-4xl font-bold text-gray-400">{profile.username?.charAt(0).toUpperCase()}</span>
                  )}
                </div>
                <div className={`absolute bottom-2 right-2 w-5 h-5 rounded-full border-[3px] border-white z-20 ${activeStatus.color}`} title={activeStatus.text} />
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                  {profile.username}
                  <CheckCircle className="w-5 h-5 text-[#0866FF]" />
                </h1>
                <p className="text-[15px] text-[#65676B]">{profile.passionField || "Exploring"}</p>
                <p className="text-[13px] text-[#65676B] mt-1">{activeStatus.text}</p>
              </div>

              {profile.bio && (
                <div className="text-[15px] leading-[1.4] text-gray-800 whitespace-pre-wrap">
                  {profile.bio}
                </div>
              )}

              <div className="flex flex-wrap gap-4 pt-3 border-t border-gray-100 text-[14px]">
                {profile.country && (
                  <div className="flex items-center gap-2 text-[#65676B]">
                    <MapPin className="w-4 h-4" />
                    <span>{profile.country}</span>
                  </div>
                )}
                <div className="flex items-center gap-2 text-[#65676B]">
                  <Calendar className="w-4 h-4" />
                  <span>Joined {profile.createdAt?.toDate ? profile.createdAt.toDate().toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : 'recently'}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Purpose Card */}
        {profile.storytellingPurpose && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mb-6">
            <h2 className="text-[17px] font-bold mb-3 flex items-center gap-2">
               <Target className="w-5 h-5 text-[#0866FF]" />
               Mission
            </h2>
            <div className="bg-[#F0F2F5] rounded-xl p-4 flex gap-3 items-start">
               <Quote className="w-5 h-5 text-gray-400 shrink-0 mt-0.5" />
               <p className="text-[15px] font-medium text-gray-700 italic">
                 {profile.storytellingPurpose}
               </p>
            </div>
          </div>
        )}

        {/* Stories Listing */}
        <div className="space-y-4">
          <h2 className="text-xl font-bold px-1 my-6 flex items-center gap-2">
            Shared Experiences 
            <span className="bg-gray-200 text-gray-700 text-sm py-0.5 px-2 rounded-full">{stories.length}</span>
          </h2>
          
          {stories.length === 0 ? (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 text-center text-[#65676B]">
              <BookOpen className="w-12 h-12 mx-auto mb-3 text-gray-300" />
              <p className="font-medium text-[15px]">No stories shared yet.</p>
            </div>
          ) : (
            stories.map(story => (
              <ExpandableStoryCard key={story.id} story={story as any} />
            ))
          )}
        </div>
      </main>
    </motion.div>
  );
}
