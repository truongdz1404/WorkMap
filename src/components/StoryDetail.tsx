import { Story } from '../types';
import { CATEGORIES, EMOTIONS } from '../constants';
import { Button } from './ui/button';
import {
  ThumbsUp,
  ThumbsDown,
  Share2,
  User,
  ArrowLeft,
  MessageCircle,
  Send,
  MessageCircleOff,
  MoreHorizontal,
} from 'lucide-react';
import { motion } from 'motion/react';
import { useState } from 'react';
import { Textarea } from './ui/textarea';
import { useI18n } from '../i18n';

interface StoryDetailProps {
  story: Story;
  onClose: () => void;
  onUpvote: (storyId: string) => void;
  onDownvote: (storyId: string) => void;
  onAddComment?: (storyId: string, content: string) => void;
  currentUserId?: string;
}

export default function StoryDetail({ story, onClose, onUpvote, onDownvote, onAddComment, currentUserId }: StoryDetailProps) {
  const { t, formatRelativeTime } = useI18n();
  const category = CATEGORIES.find((c) => c.value === story.category);
  const emotion = EMOTIONS.find((e) => e.value === story.emotion);
  const [commentText, setCommentText] = useState('');
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);

  const hasUpvoted = !!(currentUserId && story.upvotedBy?.includes(currentUserId));
  const hasDownvoted = !!(currentUserId && story.downvotedBy?.includes(currentUserId));
  const commentsEnabled = story.allowComments !== false;
  const upvoteCount = story.upvotedBy?.length || 0;
  const downvoteCount = story.downvotedBy?.length || 0;
  const totalComments = story.comments?.length || 0;

  const handleAddComment = async () => {
    if (!commentText.trim() || !onAddComment) return;
    setIsSubmittingComment(true);
    try {
      await onAddComment(story.id, commentText);
      setCommentText('');
    } finally {
      setIsSubmittingComment(false);
    }
  };

  return (
    <motion.div
      initial={{ x: '100%' }}
      animate={{ x: 0 }}
      exit={{ x: '100%' }}
      transition={{ type: 'spring', damping: 25, stiffness: 200 }}
      className="fixed inset-y-0 right-0 z-50 flex w-full flex-col border-l border-[#3a3b3c] bg-[#1c1d1f] text-white shadow-2xl md:w-[500px]"
    >
      <div className="flex items-center justify-between border-b border-[#3a3b3c] bg-[#1f2023] px-3 py-2 sm:px-4 sm:py-3">
        <Button variant="ghost" size="icon" onClick={onClose} className="rounded-full text-gray-200 hover:bg-[#323436] hover:text-white">
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="text-sm font-bold text-gray-200">{t('storyDetail.commentsTitle', { count: totalComments })}</div>
        <Button variant="ghost" size="icon" className="rounded-full text-gray-300 hover:bg-[#323436] hover:text-white">
          <MoreHorizontal className="h-5 w-5" />
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="px-3 pb-6 pt-3 sm:px-4">
          <div className="rounded-2xl bg-[#242526] p-4 shadow-lg">
            <div className="mb-3 flex items-start gap-3">
              {story.authorImage ? (
                <img src={story.authorImage} alt={story.authorName} className="h-11 w-11 rounded-full object-cover" referrerPolicy="no-referrer" />
              ) : (
                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#3a3b3c]">
                  <User className="h-5 w-5 text-gray-300" />
                </div>
              )}
              <div className="min-w-0 flex-1">
                <div className="truncate text-base font-bold text-gray-100">{story.authorName || t('storyDetail.anonymous')}</div>
                <div className="mt-0.5 text-xs font-medium text-gray-400">{formatRelativeTime(story.createdAt)}</div>
              </div>
            </div>

            <h1 className="mb-2 text-2xl font-bold leading-tight text-white">{story.title}</h1>
            <p className="whitespace-pre-wrap text-[17px] leading-relaxed text-gray-100">{story.content}</p>

            <div className="mt-3 flex flex-wrap items-center gap-2">
              <span
                className="rounded-full px-2.5 py-1 text-[10px] font-black uppercase tracking-widest text-white"
                style={{ backgroundColor: category?.color || '#6b7280' }}
              >
                {category ? t(`categories.${category.value}`) : t('categories.other')}
              </span>
              {emotion && (
                <span className="rounded-full bg-[#3a3b3c] px-2.5 py-1 text-[10px] font-black uppercase tracking-widest text-gray-200">
                  {emotion.icon} {t(`emotions.${emotion.value}`)}
                </span>
              )}
            </div>

            <div className="mt-4 flex items-center justify-between border-y border-[#3a3b3c] py-2 text-sm text-gray-300">
              <div className="flex items-center gap-2">
                <div className="flex items-center justify-center rounded-full bg-blue-500 p-1">
                  <ThumbsUp className="h-3 w-3 text-white" />
                </div>
                <div className="flex items-center justify-center rounded-full bg-red-500 p-1">
                  <ThumbsDown className="h-3 w-3 text-white" />
                </div>
                <span>{upvoteCount + downvoteCount}</span>
              </div>
              <div className="text-sm">{totalComments}</div>
            </div>

            <div className="mt-1 grid grid-cols-3 gap-1">
              <button
                type="button"
                onClick={() => onUpvote(story.id)}
                className={`flex items-center justify-center gap-2 rounded-lg px-2 py-2 text-xs font-bold transition-colors ${hasUpvoted ? 'bg-[#2d5f42] text-green-300' : 'text-gray-300 hover:bg-[#3a3b3c]'}`}
              >
                <ThumbsUp className="h-4 w-4" />
                {upvoteCount}
              </button>
              <button
                type="button"
                onClick={() => onDownvote(story.id)}
                className={`flex items-center justify-center gap-2 rounded-lg px-2 py-2 text-xs font-bold transition-colors ${hasDownvoted ? 'bg-[#5f2d35] text-red-300' : 'text-gray-300 hover:bg-[#3a3b3c]'}`}
              >
                <ThumbsDown className="h-4 w-4" />
                {downvoteCount}
              </button>
              <button
                type="button"
                className="flex items-center justify-center gap-2 rounded-lg px-2 py-2 text-xs font-bold text-gray-300 transition-colors hover:bg-[#3a3b3c]"
              >
                <Share2 className="h-4 w-4" />
                {t('storyDetail.share')}
              </button>
            </div>
          </div>

          <div className="mt-4 flex items-center justify-between px-1">
            <h3 className="text-[15px] font-semibold text-gray-100">{t('storyDetail.mostRelevant')}</h3>
            <MessageCircle className="h-4 w-4 text-gray-400" />
          </div>

          {commentsEnabled && totalComments > 0 && (
            <div className="mt-3 space-y-4">
              {story.comments?.map((comment) => (
                <div key={comment.id} className="flex items-start gap-2.5">
                  {comment.authorImage ? (
                    <img src={comment.authorImage} alt={comment.authorName} className="h-9 w-9 rounded-full object-cover" referrerPolicy="no-referrer" />
                  ) : (
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#3a3b3c]">
                      <User className="h-4 w-4 text-gray-300" />
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <div className="rounded-2xl bg-[#3a3b3c] px-3 py-2.5">
                      <p className="text-[14px] font-bold leading-none text-gray-100">{comment.authorName || t('storyDetail.anonymous')}</p>
                      <p className="mt-1.5 break-words text-[15px] leading-relaxed text-gray-100">{comment.content}</p>
                    </div>
                    <div className="mt-1.5 flex items-center gap-4 px-1 text-xs font-semibold text-gray-400">
                      <span>{formatRelativeTime(comment.createdAt)}</span>
                      <button type="button" className="transition-colors hover:text-gray-200">{t('storyDetail.reply')}</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {commentsEnabled && totalComments === 0 && (
            <div className="mt-4 rounded-xl border border-[#3a3b3c] bg-[#242526] px-4 py-3 text-sm text-gray-400">
              {t('storyDetail.noCommentsYet')}
            </div>
          )}

          {!commentsEnabled && (
            <div className="mt-4 rounded-2xl border border-[#3a3b3c] bg-[#242526] p-4">
              <div className="flex items-center gap-2 text-gray-300">
                <MessageCircleOff className="h-5 w-5" />
                <h3 className="text-sm font-bold uppercase tracking-widest">{t('storyDetail.commentsOff')}</h3>
              </div>
            </div>
          )}
        </div>
      </div>

      {commentsEnabled && (
        <div className="border-t border-[#3a3b3c] bg-[#242526] px-3 py-3 sm:px-4">
          <div className="flex items-end gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#3a3b3c]">
              <User className="h-4 w-4 text-gray-300" />
            </div>
            <div className="flex-1 rounded-2xl border border-[#3a3b3c] bg-[#3a3b3c] px-3 py-2">
              <Textarea
                placeholder={t('storyDetail.writeComment')}
                className="min-h-[42px] border-0 bg-transparent p-0 text-sm text-white placeholder:text-gray-400 focus-visible:ring-0"
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                maxLength={500}
              />
            </div>
            <Button
              onClick={handleAddComment}
              disabled={!commentText.trim() || isSubmittingComment}
              className="h-9 w-9 rounded-full bg-[#2d88ff] p-0 text-white hover:bg-[#1f7cff] disabled:opacity-50"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
          <div className="mt-1 px-12 text-[11px] text-gray-400">
            {t('storyDetail.commentCharacters', { count: commentText.length })}
          </div>
        </div>
      )}
    </motion.div>
  );
}
