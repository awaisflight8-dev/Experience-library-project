import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Timestamp } from 'firebase/firestore';
import { MoreHorizontal, ChevronDown, ChevronUp } from 'lucide-react';
import CommentSection from './CommentSection';
import FollowButton from './FollowButton';
import StoryInteractionBar from './StoryInteractionBar';
import ReactMarkdown from 'react-markdown';

interface ContentSections {
  situationBefore: string;
  whatChanged: string;
  exactSteps: string;
  result: string;
  mistakes: string;
  advice: string;
}

interface Story {
  id: string;
  title: string;
  category: string;
  authorName: string;
  authorUsername?: string;
  authorId: string;
  createdAt: Timestamp;
  contentSections?: ContentSections;
  likes?: number;
  commentsCount?: number;
}

interface Props {
  story: Story;
  initiallyExpanded?: boolean;
}

export default function ExpandableStoryCard({ story, initiallyExpanded = false }: Props) {
  const [expanded, setExpanded] = useState(initiallyExpanded);
  const [showComments, setShowComments] = useState(initiallyExpanded);

  useEffect(() => {
    if (initiallyExpanded) {
      setExpanded(true);
      setShowComments(true);
    }
  }, [initiallyExpanded]);

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

  const sections = [
    { id: 'situationBefore', title: 'The Problem', content: story.contentSections?.situationBefore },
    { id: 'whatChanged', title: 'The Turning Point', content: story.contentSections?.whatChanged },
    { id: 'exactSteps', title: 'What I Did', content: story.contentSections?.exactSteps },
    { id: 'result', title: 'Where I Am Now', content: story.contentSections?.result },
    { id: 'mistakes', title: 'What Went Wrong', content: story.contentSections?.mistakes },
    { id: 'advice', title: 'Advice to My Past Self', content: story.contentSections?.advice }
  ];

  const handleToggleExpand = (e: React.MouseEvent) => {
    e.preventDefault();
    setExpanded(!expanded);
  };

  return (
    <article className="w-full bg-white sm:rounded-xl shadow-sm border-x-0 sm:border border-gray-200 flex flex-col mb-4 overflow-hidden relative">
      {/* Card Header */}
      <div className="flex items-center justify-between p-4 pb-2">
        <div className="flex items-center gap-3">
          <Link to={story.authorUsername ? `/profile/${story.authorUsername}` : '#'} className="w-10 h-10 rounded-full bg-[#E4E6EB] flex flex-shrink-0 items-center justify-center text-black font-semibold hover:opacity-80 transition-opacity">
            {story.authorName.charAt(0).toUpperCase()}
          </Link>
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              {story.authorUsername ? (
                <Link to={`/profile/${story.authorUsername}`} className="font-semibold text-[15px] hover:underline cursor-pointer">
                  {story.authorName}
                </Link>
              ) : (
                <span className="font-semibold text-[15px]">
                  {story.authorName}
                </span>
              )}
              {story.authorUsername && (
                <FollowButton targetUserId={story.authorId} targetUsername={story.authorUsername} />
              )}
            </div>
            <div className="flex items-center gap-1 text-[13px] text-[#65676B]">
              <span>{getTimeAgo(story.createdAt)}</span>
              <span>·</span>
              <span className="hover:underline cursor-pointer">{story.category}</span>
            </div>
          </div>
        </div>
      </div>
      
      {/* Card Body */}
      <div className="px-4 pb-3">
        <h3 className="font-bold text-[16px] mb-2">{story.title}</h3>
        
        {!expanded ? (
          <div>
            <p className="text-[15px] text-[#050505] leading-[1.4] line-clamp-3">
              {story.contentSections?.situationBefore || 'An undocumented journey through the complexities of real growth...'}
            </p>
            <button 
              onClick={handleToggleExpand}
              className="text-[#0866FF] hover:underline text-[15px] font-medium block mt-1"
            >
              See More
            </button>
          </div>
        ) : (
          <div className="space-y-6 mt-4">
            {sections.map(section => {
              if (!section.content) return null;
              return (
                <div key={section.id} className="bg-gray-50 rounded-2xl p-5 border border-gray-100">
                  <h4 className="text-xl font-bold font-serif mb-3 text-black">
                    {section.title}
                  </h4>
                  <div className="text-[15px] text-gray-800 leading-relaxed font-sans markdown-body">
                    <ReactMarkdown>{section.content}</ReactMarkdown>
                  </div>
                </div>
              );
            })}
            <button 
              onClick={handleToggleExpand}
              className="text-[#65676B] hover:text-black font-semibold text-[15px] w-full text-center py-2 flex items-center justify-center gap-1 mt-4"
            >
              <ChevronUp className="w-4 h-4" /> Show Less
            </button>
          </div>
        )}
      </div>

      {/* Card Footer Actions */}
      <StoryInteractionBar 
        storyId={story.id} 
        storyTitle={story.title} 
        likesCount={story.likes || 0} 
        commentsCount={story.commentsCount || 0} 
        onToggleComments={() => setShowComments(!showComments)}
        showComments={showComments}
      />

      {showComments && (
        <CommentSection storyId={story.id} />
      )}
    </article>
  );
}
