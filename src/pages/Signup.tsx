import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { createUserWithEmailAndPassword, signInWithPopup } from 'firebase/auth';
import { auth, googleProvider, db } from '../lib/firebase';
import { useAuth } from '../contexts/AuthContext';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { ArrowLeft } from 'lucide-react';

export default function Signup() {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const { user, userProfile, loading: authLoading } = useAuth();

  useEffect(() => {
    if (user && userProfile && !authLoading) {
      if (userProfile.isProfileSetup) {
        navigate('/home');
      } else {
        navigate('/profile-setup');
      }
    }
  }, [user, userProfile, authLoading, navigate]);

  const handleEmailSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);
    try {
      const result = await createUserWithEmailAndPassword(auth, email, password);
      const username = `${firstName} ${lastName}`.trim() || email.split('@')[0];
      
      await setDoc(doc(db, 'users', result.user.uid), {
        uid: result.user.uid,
        username: '',
        email: result.user.email,
        profileImage: null,
        createdAt: serverTimestamp(),
        isProfileSetup: false,
      });
      // Navigation is handled by the useEffect listener when auth context updates
    } catch (err: any) {
      setError(err.message || 'Failed to sign up');
      setLoading(false);
    }
  };

  const handleGoogleSignup = async () => {
    setError('');
    setLoading(true);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const userRef = doc(db, 'users', result.user.uid);
      
      let docSnap;
      try {
        docSnap = await getDoc(userRef);
      } catch (err) {
        console.error("Signup: Google GetDoc failed", err);
        throw err;
      }
      
      if (!docSnap.exists()) {
        try {
          await setDoc(userRef, {
            uid: result.user.uid,
            username: '',
            email: result.user.email || '',
            profileImage: result.user.photoURL || null,
            createdAt: serverTimestamp(),
            isProfileSetup: false,
          });
        } catch (err) {
          console.error("Signup: Google SetDoc failed", err);
          throw err;
        }
      }
      
      // Navigation is handled by the useEffect listener when auth context updates
    } catch (err: any) {
      console.error("Signup: Google Login/Signup total failure", err);
      setError(err.message || 'Failed to sign up with Google');
      setLoading(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.3 }}
      className="min-h-screen bg-gray-50 flex items-center justify-center p-4 font-sans sm:bg-gray-100"
    >
      <div className="w-full max-w-md bg-white sm:rounded-[40px] rounded-3xl overflow-hidden shadow-[0_20px_60px_-15px_rgba(0,0,0,0.1)] relative flex flex-col my-4">
        
        {/* Top Dark Header Area */}
        <div className="relative bg-black h-40 flex-shrink-0 rounded-bl-[60px] sm:rounded-bl-[80px]">
          {/* Subtle decorative pattern effect */}
          <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_20%_20%,_#ffffff_10%,_transparent_20%),_radial-gradient(circle_at_80%_80%,_#ffffff_10%,_transparent_20%)] bg-[length:60px_60px]" />
          
          <div className="absolute inset-x-0 top-8 px-8 flex items-center justify-between z-10">
            <Link to="/login" className="text-white hover:opacity-80 transition-opacity">
              <ArrowLeft className="w-6 h-6" />
            </Link>
            <h2 className="text-3xl font-bold text-white tracking-tight absolute left-1/2 -translate-x-1/2">Sign Up</h2>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 px-8 pt-10 pb-8 flex flex-col bg-white overflow-y-auto">
          <form className="space-y-5" onSubmit={handleEmailSignup}>
            {error && (
              <div className="text-red-500 text-sm text-center font-medium bg-red-50 py-2 rounded-xl">
                {error}
              </div>
            )}
            
            <div className="space-y-1.5 focus-within:text-black text-gray-500 transition-colors">
              <label className="block text-xs font-semibold pl-4">First name</label>
              <input
                type="text"
                value={firstName}
                onChange={e => setFirstName(e.target.value)}
                placeholder="Vijay"
                className="w-full px-5 py-4 bg-white border border-gray-100 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent text-sm placeholder-gray-300 font-medium text-gray-900 transition-all box-border"
              />
            </div>

            <div className="space-y-1.5 focus-within:text-black text-gray-500 transition-colors">
              <label className="block text-xs font-semibold pl-4">Last name</label>
              <input
                type="text"
                value={lastName}
                onChange={e => setLastName(e.target.value)}
                placeholder="Bhuva"
                className="w-full px-5 py-4 bg-white border border-gray-100 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent text-sm placeholder-gray-300 font-medium text-gray-900 transition-all box-border"
              />
            </div>

            <div className="space-y-1.5 focus-within:text-black text-gray-500 transition-colors">
              <label className="block text-xs font-semibold pl-4">Email</label>
              <input
                type="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="vijaybhuva90@gmail.com"
                className="w-full px-5 py-4 bg-white border border-gray-100 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent text-sm placeholder-gray-300 font-medium text-gray-900 transition-all box-border"
              />
            </div>

            <div className="space-y-1.5 focus-within:text-black text-gray-500 transition-colors">
              <label className="block text-xs font-semibold pl-4">Password</label>
              <input
                type="password"
                required
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-5 py-4 bg-white border border-gray-100 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent text-sm placeholder-gray-300 font-medium text-gray-900 transition-all box-border tracking-[0.2em]"
              />
            </div>

            <div className="space-y-1.5 focus-within:text-black text-gray-500 transition-colors">
              <label className="block text-xs font-semibold pl-4">Confirm password</label>
              <input
                type="password"
                required
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-5 py-4 bg-white border border-gray-100 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent text-sm placeholder-gray-300 font-medium text-gray-900 transition-all box-border tracking-[0.2em]"
              />
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-4 px-4 rounded-2xl text-sm font-semibold text-white bg-black hover:bg-gray-900 disabled:opacity-50 transition-colors shadow-lg active:scale-[0.98]"
              >
                Sign Up
              </button>
            </div>
          </form>

          <div className="mt-6 pt-2 text-center pb-2">
             <button
                type="button"
                onClick={handleGoogleSignup}
                disabled={loading}
                className="w-full flex justify-center py-4 px-4 rounded-2xl text-sm font-semibold text-black bg-white border-[1.5px] border-gray-100 hover:bg-gray-50 transition-colors items-center gap-2"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
                Continue with Google
              </button>
          </div>

          <div className="mt-auto pt-6 text-center text-xs font-medium text-gray-500">
            Already have any account?{' '}
            <Link to="/login" className="text-black font-semibold hover:underline">
              Sign In
            </Link>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
