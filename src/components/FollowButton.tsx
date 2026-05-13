import React, { useState, useEffect } from 'react';
import { db } from '../lib/firebase';
import { doc, getDoc, setDoc, deleteDoc, serverTimestamp } from 'firebase/firestore';
import { useAuth } from '../contexts/AuthContext';
import { UserPlus, UserMinus } from 'lucide-react';

interface Props {
  targetUserId: string;
  targetUsername: string;
}

export default function FollowButton({ targetUserId, targetUsername }: Props) {
  const { user } = useAuth();
  const [isFollowing, setIsFollowing] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user || user.uid === targetUserId) {
      setLoading(false);
      return;
    }

    const checkFollow = async () => {
      try {
        const followId = `${user.uid}_${targetUserId}`;
        const followRef = doc(db, 'follows', followId);
        const followSnap = await getDoc(followRef);
        setIsFollowing(followSnap.exists());
      } catch (error) {
        console.error("Error checking follow status:", error);
      } finally {
        setLoading(false);
      }
    };

    checkFollow();
  }, [targetUserId, user]);

  const handleToggleFollow = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!user || loading || user.uid === targetUserId) return;

    const followId = `${user.uid}_${targetUserId}`;
    const followRef = doc(db, 'follows', followId);

    // Optimistic update
    const wasFollowing = isFollowing;
    setIsFollowing(!wasFollowing);

    try {
      if (wasFollowing) {
        await deleteDoc(followRef);
      } else {
        await setDoc(followRef, {
          followerId: user.uid,
          followingId: targetUserId,
          createdAt: serverTimestamp()
        });
      }
    } catch (error) {
      console.error("Error toggling follow:", error);
      // Revert optimistic update
      setIsFollowing(wasFollowing);
    }
  };

  if (!user || user.uid === targetUserId) return null;

  return (
    <button
      onClick={handleToggleFollow}
      disabled={loading}
      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[13px] font-semibold transition-colors disabled:opacity-50 ${
        isFollowing
          ? 'bg-gray-100 text-gray-800 hover:bg-gray-200'
          : 'bg-[#0866FF] text-white hover:bg-[#1877F2]'
      }`}
    >
      {isFollowing ? (
        <>
          <UserMinus className="w-3.5 h-3.5" />
          Following
        </>
      ) : (
        <>
          <UserPlus className="w-3.5 h-3.5" />
          Follow
        </>
      )}
    </button>
  );
}
