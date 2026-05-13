import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { signOut } from 'firebase/auth';
import { auth, db } from '../lib/firebase';
import { useNavigate, Link, useParams } from 'react-router-dom';
import { motion } from 'motion/react';
import { 
  LogOut, 
  BookOpen, 
  ChevronRight,
  MoreHorizontal,
  ThumbsUp,
  MessageSquare,
  Share2,
  Image as ImageIcon,
  Smile
} from 'lucide-react';
import { collection, query, orderBy, limit, onSnapshot, where, Timestamp, getDoc, doc } from 'firebase/firestore';
import SearchBar from '../components/SearchBar';
import ExpandableStoryCard from '../components/ExpandableStoryCard';
import { HOME_CATEGORIES } from '../constants/categories';

interface Story {
  id: string;
  title: string;
  category: string;
  authorName: string;
  authorUsername?: string;
  authorId: string;
  createdAt: Timestamp;
  contentSections?: {
    situationBefore: string;
    whatChanged: string;
    exactSteps: string;
    result: string;
    mistakes: string;
    advice: string;
  };
  likes?: number;
  commentsCount?: number;
}

export default function Home() {
  const { user, userProfile } = useAuth();
  const navigate = useNavigate();
  const { storyId } = useParams<{ storyId: string }>();
  const [stories, setStories] = useState<Story[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('All');

  useEffect(() => {
    setLoading(true);
    let q = query(
      collection(db, 'stories'),
      orderBy('createdAt', 'desc'),
      limit(20)
    );

    if (activeCategory !== 'All') {
      q = query(
        collection(db, 'stories'),
        where('category', '==', activeCategory),
        orderBy('createdAt', 'desc'),
        limit(20)
      );
    }

    const unsubscribe = onSnapshot(q, async (snapshot) => {
      let storyData = snapshot.docs.map(d => ({
        id: d.id,
        ...d.data()
      })) as Story[];

      if (storyId && !storyData.find(s => s.id === storyId)) {
        try {
          const specificStory = await getDoc(doc(db, 'stories', storyId));
          if (specificStory.exists()) {
            storyData = [{ id: specificStory.id, ...specificStory.data() } as Story, ...storyData];
          }
        } catch (err) {
          console.error("Error fetching requested story:", err);
        }
      }

      setStories(storyData);
      setLoading(false);
    }, (error) => {
      console.error("Error fetching stories:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [activeCategory]);

  const handleLogout = async () => {
    await signOut(auth);
    navigate('/');
  };

  const getTimeAgo = (timestamp?: Timestamp) => {
    if (!timestamp) return 'Just now';
    const seconds = Math.floor((new Date().getTime() - timestamp.toDate().getTime()) / 1000);
    
    let interval = seconds / 31536000;
    if (interval > 1) return Math.floor(interval) + 'y';
    interval = seconds / 2592000;
    if (interval > 1) return Math.floor(interval) + 'm';
    interval = seconds / 86400;
    if (interval > 1) return Math.floor(interval) + 'd';
    interval = seconds / 3600;
    if (interval > 1) return Math.floor(interval) + 'h';
    interval = seconds / 60;
    if (interval > 1) return Math.floor(interval) + 'm';
    return Math.floor(seconds) + 's';
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.3 }}
      className="min-h-screen bg-[#F0F2F5] font-sans text-[#050505] pb-20"
    >
      {/* Facebook-style Header */}
      <nav className="fixed top-0 w-full z-50 bg-white shadow-sm h-14 flex items-center px-4 transition-all">
        <div className="max-w-[1200px] w-full mx-auto flex items-center justify-between gap-4">
          <Link to="/home" className="flex items-center gap-2 flex-shrink-0 group">
            <div className="w-9 h-9 bg-[#0866FF] rounded-full flex items-center justify-center">
              <BookOpen className="w-5 h-5 text-white" />
            </div>
            <span className="hidden sm:block font-bold text-xl tracking-tight text-[#0866FF]">Experience</span>
          </Link>
          
          <div className="flex-1 max-w-[600px]">
             <SearchBar />
          </div>

          <Link to={userProfile?.username ? `/profile/${userProfile.username}` : '#'} className="flex-shrink-0 flex items-center justify-center w-9 h-9 rounded-full bg-[#E4E6EB] hover:bg-[#D8DADF] cursor-pointer transition-colors text-black font-semibold overflow-hidden border border-gray-100 shadow-sm">
             {userProfile?.profileImage || userProfile?.profilePhoto ? (
                <img src={userProfile.profileImage || userProfile.profilePhoto!} alt={userProfile.username} className="w-full h-full object-cover" />
             ) : (
                userProfile?.username?.charAt(0).toUpperCase() || user?.email?.charAt(0).toUpperCase() || 'U'
             )}
          </Link>
        </div>
      </nav>

      {/* Mobile Search - Removed as we now have search in header or can keep if needed, but user wants clean */}
      {/* <div className="md:hidden px-4 pt-16 pb-2 bg-white shadow-sm mb-4">
        <SearchBar />
      </div> */}

      <main className="max-w-[1920px] mx-auto pt-[72px] px-0 lg:px-4 flex justify-center">
        
        {/* Left Sidebar (Categories) - Hidden on mobile/tablet */}
        <div className="hidden xl:block w-[320px] shrink-0 sticky top-[72px] h-[calc(100vh-72px)] overflow-y-auto px-4">
          <div className="space-y-1 py-4">
            {HOME_CATEGORIES.map(cat => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`w-full flex items-center gap-3 px-2 py-3 rounded-lg transition-colors ${
                  activeCategory === cat 
                    ? 'bg-[#E4E6EB] font-semibold text-black' 
                    : 'hover:bg-[#E4E6EB] font-medium text-gray-700'
                }`}
              >
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${activeCategory === cat ? 'bg-[#0866FF] text-white' : 'bg-gray-200 text-gray-700'}`}>
                   {cat.charAt(0)}
                </div>
                <span>{cat}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Main Feed Content */}
        <div className="w-full max-w-[680px] px-0 sm:px-4 py-4 flex flex-col items-center">
          
          {/* Create Post Card */}
          <div className="w-full bg-white sm:rounded-xl shadow-sm border-x-0 sm:border border-gray-200 p-4 mb-4">
            <div className="flex gap-3 items-center">
              <Link to={userProfile?.username ? `/profile/${userProfile.username}` : '#'} className="w-10 h-10 rounded-full bg-[#E4E6EB] flex flex-shrink-0 items-center justify-center text-black font-semibold overflow-hidden">
                 {userProfile?.profileImage || userProfile?.profilePhoto ? (
                    <img src={userProfile.profileImage || userProfile.profilePhoto!} alt={userProfile.username} className="w-full h-full object-cover" />
                 ) : (
                    userProfile?.username?.charAt(0).toUpperCase() || user?.email?.charAt(0).toUpperCase() || 'U'
                 )}
              </Link>
              <Link to="/create" className="flex-1 bg-[#F0F2F5] hover:bg-[#E4E6EB] transition-colors rounded-full px-6 py-2.5 text-left text-[15px] font-medium text-gray-600 cursor-pointer">
                What's on your mind, {userProfile?.username || 'User'}?
              </Link>
            </div>
          </div>

          {/* Stories List */}
          <div className="w-full flex flex-col gap-4">
            {loading ? (
              Array(3).fill(0).map((_, i) => (
                <div key={i} className="bg-white sm:rounded-xl shadow-sm border border-gray-200 p-4 animate-pulse space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gray-200 rounded-full" />
                    <div className="space-y-2">
                       <div className="w-32 h-3 bg-gray-200 rounded-full" />
                       <div className="w-20 h-2 bg-gray-200 rounded-full" />
                    </div>
                  </div>
                  <div className="w-3/4 h-4 bg-gray-200 rounded-lg" />
                  <div className="w-full h-32 bg-gray-100 rounded-lg" />
                </div>
              ))
            ) : stories.length === 0 ? (
              <div className="py-24 text-center bg-white sm:rounded-xl border border-gray-200 shadow-sm px-6">
                <h3 className="text-xl font-bold text-black mb-2">No posts available</h3>
                <p className="text-gray-500 font-medium">Adjust your filters or be the first to share an experience.</p>
              </div>
            ) : (
              stories.map(story => (
                <ExpandableStoryCard key={story.id} story={story} initiallyExpanded={story.id === storyId} />
              ))
            )}
          </div>
        </div>

        {/* Right Sidebar (Contacts/Info) */}
        <div className="hidden lg:block w-[320px] shrink-0 sticky top-[72px] h-[calc(100vh-72px)] overflow-y-auto px-4 py-4">
           <h3 className="font-semibold text-[#65676B] text-[15px] mb-4">Suggested</h3>
           <Link 
              to="/create" 
              className="flex items-center gap-3 p-2 hover:bg-[#E4E6EB] rounded-lg transition-colors cursor-pointer group"
            >
              <div className="w-9 h-9 rounded-full bg-[#E4E6EB] flex items-center justify-center border border-gray-200 text-gray-600">
                <BookOpen className="w-5 h-5" />
              </div>
              <div className="flex flex-col">
                <span className="font-semibold text-[15px]">Share your journey</span>
                <span className="text-[13px] text-[#65676B]">Help others learn</span>
              </div>
            </Link>

            <div className="mt-8 border-t border-gray-300 pt-4 px-2">
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[13px] text-[#65676B]">
                <a href="#" className="hover:underline">Privacy</a>
                <a href="#" className="hover:underline">Terms</a>
                <a href="#" className="hover:underline">Advertising</a>
                <a href="#" className="hover:underline">Ad Choices</a>
                <a href="#" className="hover:underline">Cookies</a>
              </div>
              <p className="text-[13px] text-[#65676B] mt-2">Experience Library © 2026</p>
            </div>
        </div>
      </main>

      {/* Floating Action Button */}
      <Link 
        to="/create"
        className="fixed bottom-6 right-6 w-14 h-14 bg-[#0866FF] text-white rounded-full flex items-center justify-center shadow-lg hover:bg-[#0759E0] transition-transform hover:scale-110 active:scale-95 z-50 group"
      >
        <BookOpen className="w-6 h-6" />
        <span className="absolute right-full mr-3 bg-black text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none font-medium">
          Create Story
        </span>
      </Link>
    </motion.div>
  );
}
