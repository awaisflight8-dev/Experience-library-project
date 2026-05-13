import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../lib/firebase';
import { doc, setDoc } from 'firebase/firestore';
import { ArrowLeft, Loader2 } from 'lucide-react';
import ProfileAvatarUpload from '../components/profile/ProfileAvatarUpload';

export default function EditProfile() {
  const { user, userProfile, refreshProfile } = useAuth();
  const navigate = useNavigate();

  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [bio, setBio] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (userProfile) {
      setProfileImage(userProfile.profileImage || userProfile.profilePhoto || null);
      setBio(userProfile.bio || '');
    }
  }, [userProfile]);

  if (!user || !userProfile) {
    return null;
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || saving) return;
    
    setSaving(true);
    try {
      const userRef = doc(db, 'users', user.uid);
      await setDoc(userRef, {
        profileImage,
        bio,
      }, { merge: true });
      await refreshProfile();
      navigate(`/profile/${userProfile.username}`);
    } catch (err) {
      console.error('Error saving profile:', err);
      setSaving(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.3 }}
      className="min-h-screen bg-[#F0F2F5] text-[#050505] font-sans pb-24"
    >
      <nav className="fixed top-0 w-full z-50 bg-white shadow-sm h-14 flex items-center px-4 transition-all">
        <div className="max-w-[800px] w-full mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <button onClick={() => navigate(-1)} className="p-2 hover:bg-[#F0F2F5] rounded-full transition-colors mr-2">
              <ArrowLeft className="w-5 h-5" />
            </button>
            <span className="font-bold text-[17px]">Edit Profile</span>
          </div>
        </div>
      </nav>

      <main className="max-w-[600px] mx-auto px-4 pt-[72px]">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <form onSubmit={handleSave} className="p-6 space-y-6">
            
            <div className="flex justify-center mb-6">
              <ProfileAvatarUpload 
                userId={user.uid}
                currentImage={profileImage}
                onUpload={(url) => setProfileImage(url)}
              />
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <label className="block text-[14px] font-bold text-gray-700 ml-1 uppercase tracking-tight">Bio / About</label>
                <textarea
                  value={bio}
                  onChange={e => setBio(e.target.value)}
                  placeholder="Tell people about yourself..."
                  className="w-full px-4 py-3 bg-[#F0F2F5] border-none rounded-xl focus:ring-2 focus:ring-[#0866FF] text-[15px] min-h-[120px] resize-none"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={saving}
              className="w-full bg-[#0866FF] text-white py-3 rounded-lg font-bold hover:bg-[#0759E0] disabled:opacity-50 transition-colors text-[17px] flex items-center justify-center gap-2 shadow-sm"
            >
              {saving ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Saving...
                </>
              ) : 'Save Profile'}
            </button>
          </form>
        </div>
      </main>
    </motion.div>
  );
}
