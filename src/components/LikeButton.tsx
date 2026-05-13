import React, { useState, useEffect } from 'react';
import { ThumbsUp } from 'lucide-react';
import { db } from '../lib/firebase';
import { doc, getDoc, setDoc, deleteDoc, updateDoc, increment, serverTimestamp } from 'firebase/firestore';
import { useAuth } from '../contexts/AuthContext';

interface Props {
  storyId: string;
  initialLikes: number;
}

export default function LikeButton({ storyId, initialLikes }: Props) {
  const { user } = useAuth();
  const [likesCount, setLikesCount] = useState(initialLikes || 0);
  const [isLiked, setIsLiked] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    const checkLike = async () => {
      try {
        const likeId = `${storyId}_${user.uid}`;
        const likeRef = doc(db, 'storyLikes', likeId);
        const likeSnap = await getDoc(likeRef);
        setIsLiked(likeSnap.exists());
      } catch (error) {
        console.error("Error checking like status:", error);
      } finally {
        setLoading(false);
      }
    };

    checkLike();
  }, [storyId, user]);

  const handleToggleLike = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!user || loading) return;

    const likeId = `${storyId}_${user.uid}`;
    const likeRef = doc(db, 'storyLikes', likeId);
    const storyRef = doc(db, 'stories', storyId);

    // Optimistic update
    const wasLiked = isLiked;
    setIsLiked(!wasLiked);
    setLikesCount(prev => prev + (wasLiked ? -1 : 1));

    try {
      if (wasLiked) {
        await deleteDoc(likeRef);
        await updateDoc(storyRef, { likes: increment(-1) });
      } else {
        await setDoc(likeRef, {
          storyId,
          userId: user.uid,
          createdAt: serverTimestamp()
        });
        await updateDoc(storyRef, { likes: increment(1) });
      }
    } catch (error) {
      console.error("Error toggling like:", error);
      // Revert optimistic update on error
      setIsLiked(wasLiked);
      setLikesCount(prev => prev + (wasLiked ? 1 : -1));
    }
  };

  return (
    <button 
      onClick={handleToggleLike}
      className={`flex-1 flex items-center justify-center gap-2 py-1.5 rounded-md cursor-pointer transition-colors font-semibold text-[15px] ${
        isLiked 
          ? 'text-[#0866FF] hover:bg-blue-50' 
          : 'text-[#65676B] hover:bg-[#F0F2F5]'
      }`}
    >
      <ThumbsUp className={`w-5 h-5 ${isLiked ? 'fill-current' : ''}`} /> 
      {likesCount > 0 ? likesCount : 'Like'}
    </button>
  );
}
