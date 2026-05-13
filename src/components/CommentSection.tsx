import React, { useState, useEffect } from 'react';
import { db } from '../lib/firebase';
import { collection, query, where, orderBy, onSnapshot, addDoc, serverTimestamp, updateDoc, doc, increment, Timestamp } from 'firebase/firestore';
import { useAuth } from '../contexts/AuthContext';
import { Send, MoreHorizontal } from 'lucide-react';

interface Comment {
  id: string;
  userId: string;
  username: string;
  profileImage: string | null;
  text: string;
  createdAt: Timestamp;
}

interface Props {
  storyId: string;
}

export default function CommentSection({ storyId }: Props) {
  const { user, userProfile } = useAuth();
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(
      collection(db, 'comments'),
      where('storyId', '==', storyId),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const docs = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Comment));
      setComments(docs);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [storyId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !newComment.trim() || submitting || !userProfile) return;

    setSubmitting(true);
    try {
      await addDoc(collection(db, 'comments'), {
        storyId,
        userId: user.uid,
        username: userProfile.username || 'User',
        profileImage: userProfile.profileImage || userProfile.profilePhoto || null,
        text: newComment.trim(),
        createdAt: serverTimestamp()
      });
      await updateDoc(doc(db, 'stories', storyId), {
        commentsCount: increment(1)
      });
      setNewComment('');
    } catch (err) {
      console.error("Error adding comment:", err);
    } finally {
      setSubmitting(false);
    }
  };

  const getTimeAgo = (timestamp?: Timestamp) => {
    if (!timestamp) return 'Just now';
    const seconds = Math.floor((new Date().getTime() - timestamp.toDate().getTime()) / 1000);
    let interval = seconds / 31536000;
    if (interval > 1) return Math.floor(interval) + 'y';
    interval = seconds / 2592000;
    if (interval > 1) return Math.floor(interval) + 'mo';
    interval = seconds / 86400;
    if (interval > 1) return Math.floor(interval) + 'd';
    interval = seconds / 3600;
    if (interval > 1) return Math.floor(interval) + 'h';
    interval = seconds / 60;
    if (interval > 1) return Math.floor(interval) + 'm';
    return Math.floor(seconds) + 's';
  };

  if (loading) {
    return <div className="p-4 text-center text-sm text-gray-500">Loading comments...</div>;
  }

  return (
    <div className="border-t border-gray-100 pt-3 flex flex-col gap-3 max-h-[400px] overflow-y-auto w-full px-4 pb-4">
      {user && userProfile && (
        <form onSubmit={handleSubmit} className="flex gap-2 items-start mt-2 w-full">
          <div className="w-8 h-8 rounded-full bg-[#E4E6EB] flex flex-shrink-0 items-center justify-center text-black font-semibold overflow-hidden">
             {userProfile.profileImage || userProfile.profilePhoto ? (
                <img src={userProfile.profileImage || userProfile.profilePhoto} alt={userProfile.username} className="w-full h-full object-cover" />
             ) : (
                userProfile.username?.charAt(0).toUpperCase() || 'U'
             )}
          </div>
          <div className="flex-1 relative flex items-center bg-[#F0F2F5] rounded-2xl md:rounded-full px-3 py-1 min-h-[36px]">
            <input
              type="text"
              placeholder="Write a comment..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              className="bg-transparent border-none outline-none w-full text-[15px] placeholder-gray-500 py-1 pe-8"
              disabled={submitting}
            />
            {newComment.trim() && (
              <button 
                type="submit" 
                disabled={submitting}
                className="absolute right-2 text-[#0866FF] p-1.5 rounded-full hover:bg-gray-200 transition-colors"
              >
                <Send className="w-4 h-4" />
              </button>
            )}
          </div>
        </form>
      )}

      {comments.length > 0 ? (
        <div className="flex flex-col gap-3 mt-3">
          {comments.map(comment => (
            <div key={comment.id} className="flex gap-2 group w-full relative">
              <div className="w-8 h-8 rounded-full bg-[#E4E6EB] flex flex-shrink-0 items-center justify-center text-black font-semibold overflow-hidden">
                {comment.profileImage ? (
                  <img src={comment.profileImage} alt={comment.username} className="w-full h-full object-cover" />
                ) : (
                  comment.username.charAt(0).toUpperCase()
                )}
              </div>
              <div className="flex flex-col w-full max-w-[calc(100%-40px)]">
                <div className="bg-[#F0F2F5] rounded-2xl px-3 py-2 w-fit max-w-full inline-block">
                  <span className="font-semibold text-[13px] block">{comment.username}</span>
                  <span className="text-[15px] break-words whitespace-pre-wrap">{comment.text}</span>
                </div>
                <div className="flex items-center gap-3 text-[12px] text-[#65676B] font-semibold mt-1 ml-2">
                  <span>{getTimeAgo(comment.createdAt)}</span>
                  <button className="hover:underline">Like</button>
                  <button className="hover:underline">Reply</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-4 text-gray-500 text-sm">
          No comments yet. Be the first to share your thoughts!
        </div>
      )}
    </div>
  );
}
