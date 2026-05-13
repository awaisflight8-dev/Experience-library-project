import React from 'react';
import { MessageSquare } from 'lucide-react';
import LikeButton from './LikeButton';
import ShareButton from './ShareButton';

interface Props {
  storyId: string;
  storyTitle: string;
  likesCount: number;
  commentsCount: number;
  onToggleComments: () => void;
  showComments: boolean;
}

export default function StoryInteractionBar({ 
  storyId, 
  storyTitle, 
  likesCount, 
  commentsCount, 
  onToggleComments,
  showComments
}: Props) {
  return (
    <div className="px-4 py-2 border-t border-gray-100 flex items-center justify-between gap-1 sm:gap-2">
      <LikeButton storyId={storyId} initialLikes={likesCount} />
      <button 
        onClick={onToggleComments}
        className={`flex-1 flex items-center justify-center gap-2 py-1.5 rounded-md cursor-pointer transition-colors font-semibold text-[15px] ${
          showComments ? 'bg-gray-100 text-[#050505]' : 'hover:bg-[#F0F2F5] text-[#65676B]'
        }`}
      >
        <MessageSquare className="w-5 h-5" /> 
        {commentsCount > 0 ? commentsCount : 'Comment'}
      </button>
      <ShareButton storyId={storyId} title={storyTitle} />
    </div>
  );
}
