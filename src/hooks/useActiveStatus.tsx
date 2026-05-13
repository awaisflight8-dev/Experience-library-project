import { useEffect, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../lib/firebase';
import { doc, updateDoc, serverTimestamp } from 'firebase/firestore';

export function useActiveStatus() {
  const { user, userProfile } = useAuth();
  const lastUpdateRef = useRef<number>(0);
  const UPDATE_INTERVAL = 3 * 60 * 1000; // 3 minutes

  useEffect(() => {
    if (!user || !userProfile?.isProfileSetup) return;

    const updateStatus = async () => {
      const now = Date.now();
      if (now - lastUpdateRef.current < UPDATE_INTERVAL) return;

      try {
         lastUpdateRef.current = now;
         const userRef = doc(db, 'users', user.uid);
         await updateDoc(userRef, {
           lastActiveAt: serverTimestamp(),
           isOnline: true
         });
      } catch (err) {
        console.error('Failed to update active status', err);
      }
    };

    const handleOffline = async () => {
      if (!user) return;
      try {
         const userRef = doc(db, 'users', user.uid);
         await updateDoc(userRef, {
           isOnline: false
         });
      } catch (err) {}
    };

    // Initial update
    updateStatus();

    // Event listeners
    window.addEventListener('mousemove', updateStatus);
    window.addEventListener('keydown', updateStatus);
    window.addEventListener('scroll', updateStatus);
    window.addEventListener('click', updateStatus);
    window.addEventListener('beforeunload', handleOffline);

    return () => {
      window.removeEventListener('mousemove', updateStatus);
      window.removeEventListener('keydown', updateStatus);
      window.removeEventListener('scroll', updateStatus);
      window.removeEventListener('click', updateStatus);
      window.removeEventListener('beforeunload', handleOffline);
    };
  }, [user, userProfile?.isProfileSetup]);
}
