import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../lib/firebase';
import { doc, updateDoc, setDoc, collection, query, where, getDocs, serverTimestamp } from 'firebase/firestore';
import ProfileAvatarUpload from '../components/profile/ProfileAvatarUpload';
import PassionSelector from '../components/profile/PassionSelector';
import PurposeSelector from '../components/profile/PurposeSelector';

export default function ProfileSetup() {
  const { user, userProfile, refreshProfile } = useAuth();
  const navigate = useNavigate();

  const [username, setUsername] = useState('');
  const [usernameChecking, setUsernameChecking] = useState(false);
  const [usernameError, setUsernameError] = useState('');
  const [usernameValid, setUsernameValid] = useState(false);

  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [bio, setBio] = useState('');
  const [passionField, setPassionField] = useState('');
  const [storytellingPurpose, setStorytellingPurpose] = useState('');
  const [customPurpose, setCustomPurpose] = useState('');
  
  const [country, setCountry] = useState('United States');
  const [timezone, setTimezone] = useState(Intl.DateTimeFormat().resolvedOptions().timeZone);

  const [saving, setSaving] = useState(false);

  // Debounced username check
  useEffect(() => {
    if (!username) {
      setUsernameError('');
      setUsernameValid(false);
      return;
    }

    // Rules: lowercase, no spaces, letters/numbers/underscores only, min 3, max 20
    const isValidFormat = /^[a-z0-9_]{3,20}$/.test(username);
    if (!isValidFormat) {
      setUsernameError('3-20 chars, lowercase letters, numbers, and underscores only.');
      setUsernameValid(false);
      return;
    }

    const checkUsername = async () => {
      setUsernameChecking(true);
      setUsernameError('');
      try {
        const usersRef = collection(db, 'users');
        const q = query(usersRef, where('username', '==', username));
        const querySnapshot = await getDocs(q);
        
        let exists = false;
        querySnapshot.forEach((docSnap) => {
          if (docSnap.id !== user?.uid) {
            exists = true;
          }
        });

        if (exists) {
          setUsernameError('Username is already taken.');
          setUsernameValid(false);
        } else {
          setUsernameValid(true);
        }
      } catch (err) {
        console.error('Error checking username:', err);
      } finally {
        setUsernameChecking(false);
      }
    };

    const delayDebounceFn = setTimeout(() => {
      checkUsername();
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [username, user?.uid]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || saving || !usernameValid) return;
    
    setSaving(true);
    try {
      const userRef = doc(db, 'users', user.uid);
      await setDoc(userRef, {
        uid: user.uid,
        email: user.email,
        username,
        profileImage,
        bio,
        passionField,
        storytellingPurpose: storytellingPurpose === 'Custom' ? customPurpose : storytellingPurpose,
        country,
        timezone,
        isProfileSetup: true,
        createdAt: serverTimestamp()
      }, { merge: true });
      await refreshProfile();
      navigate('/home');
    } catch (err) {
      console.error('Error saving profile:', err);
      setSaving(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.98 }}
      transition={{ duration: 0.3 }}
      className="min-h-screen bg-[#F0F2F5] flex flex-col pt-12 pb-24 font-sans px-4"
    >
      <div className="w-full max-w-2xl mx-auto bg-white sm:rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-8 py-8 border-b border-gray-200 bg-white sticky top-0 z-10">
          <h1 className="text-2xl font-bold text-gray-900 leading-none mb-2">Create your identity</h1>
          <p className="text-gray-500 font-medium">Let the community know who you are.</p>
        </div>

        <form onSubmit={handleSave} className="p-8 space-y-10">
          {/* Avatar Upload */}
          <div className="space-y-4">
             <label className="block text-sm font-semibold text-gray-900">Profile Image</label>
             <ProfileAvatarUpload userId={user?.uid!} currentImage={profileImage} onUpload={setProfileImage} />
          </div>

          {/* Username */}
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-900">Username *</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400 font-medium">@</span>
              <input
                type="text"
                required
                value={username}
                onChange={e => setUsername(e.target.value.toLowerCase())}
                placeholder="alexwrites"
                className={`w-full pl-8 pr-4 py-3 bg-[#F0F2F5] border ${usernameError ? 'border-red-300 focus:ring-red-500' : usernameValid ? 'border-green-300 focus:ring-green-500' : 'border-transparent focus:ring-black'} rounded-xl focus:outline-none focus:ring-2 focus:bg-white transition-all text-sm font-medium text-gray-900`}
              />
            </div>
            {usernameChecking && <p className="text-xs text-gray-500">Checking availability...</p>}
            {usernameError && <p className="text-xs text-red-500 font-medium">{usernameError}</p>}
            {usernameValid && <p className="text-xs text-green-600 font-medium">Username is available!</p>}
          </div>

          {/* Bio */}
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-900">Bio <span className="text-gray-400 font-normal">(Optional)</span></label>
            <textarea
              value={bio}
              onChange={e => setBio(e.target.value)}
              placeholder="A short description about yourself..."
              rows={3}
              className="w-full px-4 py-3 bg-[#F0F2F5] border-transparent rounded-xl focus:outline-none focus:ring-2 focus:ring-black focus:bg-white transition-all text-sm font-medium text-gray-900"
            />
          </div>

          {/* Passion / Field */}
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-900">Passion / Field *</label>
            <PassionSelector value={passionField} onChange={setPassionField} />
          </div>

          {/* Storytelling Purpose */}
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-900">Why are you sharing experiences? *</label>
            <PurposeSelector 
               purpose={storytellingPurpose} 
               setPurpose={setStorytellingPurpose} 
               customPurpose={customPurpose} 
               setCustomPurpose={setCustomPurpose} 
            />
          </div>

          {/* Location & Timezone */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-900">Country *</label>
              <input
                type="text"
                required
                value={country}
                onChange={e => setCountry(e.target.value)}
                placeholder="United States"
                className="w-full px-4 py-3 bg-[#F0F2F5] border-transparent rounded-xl focus:outline-none focus:ring-2 focus:ring-black focus:bg-white transition-all text-sm font-medium text-gray-900"
              />
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-900">Timezone *</label>
              <input
                type="text"
                required
                value={timezone}
                onChange={e => setTimezone(e.target.value)}
                placeholder="America/New_York"
                className="w-full px-4 py-3 bg-[#F0F2F5] border-transparent rounded-xl focus:outline-none focus:ring-2 focus:ring-black focus:bg-white transition-all text-sm font-medium text-gray-900"
              />
            </div>
          </div>

          <div className="pt-6 border-t border-gray-100">
            <button
              type="submit"
              disabled={saving || !usernameValid || !passionField || !storytellingPurpose}
              className="w-full bg-[#0866FF] hover:bg-[#1877F2] text-white font-semibold py-4 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
            >
              {saving ? 'Creating Identity...' : 'Complete Profile'}
            </button>
          </div>
        </form>
      </div>
    </motion.div>
  );
}
