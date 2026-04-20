import { Story } from '../types';
import { CATEGORIES, EMOTIONS } from '../constants';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { ThumbsUp, ThumbsDown, Share2, Clock, User, ArrowLeft, MessageCircle, Send, MessageCircleOff } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
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
  const category = CATEGORIES.find(c => c.value === story.category);
  const emotion = EMOTIONS.find(e => e.value === story.emotion);
  const [commentText, setCommentText] = useState('');
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  const hasUpvoted = currentUserId && story.upvotedBy?.includes(currentUserId);
  const hasDownvoted = currentUserId && story.downvotedBy?.includes(currentUserId);
  const commentsEnabled = story.allowComments !== false;

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
      className="fixed inset-y-0 right-0 z-50 flex w-full flex-col border-l border-border bg-white shadow-2xl md:w-[500px]"
    >
      <div className="flex items-center justify-between border-b border-border bg-background/50 p-3 backdrop-blur-sm sm:p-4 md:p-6">
        <Button variant="ghost" size="icon" onClick={onClose} className="rounded-full hover:bg-red-50 hover:text-red-600">
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div className="flex gap-1.5 sm:gap-2">
          <Button
            variant="outline"
            size="sm"
            className="rounded-full border-border px-2 text-[10px] font-black uppercase tracking-widest sm:gap-2 sm:px-3"
            onClick={() => onUpvote(story.id)}
          >
            <ThumbsUp className={`w-4 h-4 transition-colors ${hasUpvoted ? 'text-green-600' : 'text-gray-400'}`} /> {story.upvotedBy?.length || 0}
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="rounded-full border-border px-2 text-[10px] font-black uppercase tracking-widest sm:gap-2 sm:px-3"
            onClick={() => onDownvote(story.id)}
          >
            <ThumbsDown className={`w-4 h-4 transition-colors ${hasDownvoted ? 'text-red-600' : 'text-gray-400'}`} /> {story.downvotedBy?.length || 0}
          </Button>
          <Button variant="outline" size="sm" className="rounded-full border-border px-2 text-[10px] font-black uppercase tracking-widest sm:gap-2 sm:px-3">
            <Share2 className="w-4 h-4 text-primary" />
            <span className="hidden sm:inline">{t('storyDetail.share')}</span>
          </Button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 sm:p-6 md:p-10">
        <div className="mb-8 md:mb-10">
          <div className="mb-5 flex flex-wrap items-center gap-3 sm:mb-6">
            <Badge
              variant="outline"
              className="text-[9px] uppercase font-black tracking-widest px-3 py-1 !text-foreground"
              style={{ borderColor: category?.color, backgroundColor: `${category?.color}10` }}
            >
              {category ? t(`categories.${category.value}`) : t('categories.other')}
            </Badge>
            {emotion && (
              <div className="flex items-center gap-2 bg-accent/50 px-3 py-1 rounded-full border border-border">
                <span className="text-lg">{emotion.icon}</span>
                <span className="text-[9px] uppercase font-black tracking-widest">{t(`emotions.${emotion.value}`)}</span>
              </div>
            )}
          </div>
          <h1 className="mb-6 font-serif text-2xl font-bold leading-tight text-foreground sm:text-3xl md:mb-8 md:text-4xl">
            {story.title}
          </h1>

          <div className="grid grid-cols-1 gap-4 border-y border-border py-5 sm:grid-cols-2 sm:gap-6 sm:py-8">
            <div className="flex items-center gap-3">
              {story.authorImage ? (
                <img src={story.authorImage} alt={story.authorName} className="w-11 h-11 rounded-full border border-border object-cover" referrerPolicy="no-referrer" />
              ) : (
                <div className="w-11 h-11 rounded-full bg-accent flex items-center justify-center border border-border">
                  <User className="w-5 h-5 text-primary" />
                </div>
              )}
              <div>
                <p className="text-[9px] uppercase font-black text-muted tracking-widest leading-none mb-1">{t('storyDetail.author')}</p>
                <p className="text-sm font-bold text-foreground">{story.authorName || t('storyDetail.anonymous')}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-full bg-accent flex items-center justify-center border border-border">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                {/* <p className="text-[9px] uppercase font-black text-muted tracking-widest leading-none mb-1">Shared</p> */}
                <p className="text-sm font-bold text-foreground">{formatRelativeTime(story.createdAt)}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="prose prose-stone max-w-none">
          <p className="whitespace-pre-wrap font-sans text-base leading-relaxed text-foreground/80 sm:text-lg">
            {story.content}
          </p>
        </div>

        {/* <div className="mt-16 p-8 bg-accent/20 rounded-2xl border border-border">
          <div className="flex items-center gap-2 text-muted mb-3">
            <MapPin className="w-4 h-4" />
            <span className="text-[10px] font-black uppercase tracking-widest">Location Context</span>
          </div>
          <p className="text-sm font-bold text-muted">
            Coordinates: {story.latitude.toFixed(4)}, {story.longitude.toFixed(4)}
          </p>
        </div> */}

        {commentsEnabled && story.comments && story.comments.length > 0 && (
          <div className="mt-10 space-y-4 sm:mt-16">
            <div className="flex items-center gap-2">
              <MessageCircle className="w-5 h-5 text-primary" />
              <h3 className="text-sm font-bold uppercase tracking-widest text-foreground">{t('storyDetail.commentsTitle', { count: story.comments.length })}</h3>
            </div>
            <div className="space-y-4">
              {story.comments.map((comment) => (
                <div key={comment.id} className="p-4 bg-accent/30 rounded-lg border border-border/50">
                  <div className="flex items-center gap-2 mb-2">
                    {comment.authorImage ? (
                      <img src={comment.authorImage} alt={comment.authorName} className="w-6 h-6 rounded-full border border-border object-cover" referrerPolicy="no-referrer" />
                    ) : (
                      <div className="w-6 h-6 rounded-full bg-accent border border-border flex items-center justify-center">
                        <User className="w-3 h-3 text-muted" />
                      </div>
                    )}
                    <span className="text-xs font-bold text-foreground">{comment.authorName}</span>
                    <span className="text-[9px] text-muted ml-auto">{formatRelativeTime(comment.createdAt)}</span>
                  </div>
                  <p className="text-sm text-foreground/80">{comment.content}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {commentsEnabled ? (
          <div className="mt-8 rounded-2xl border border-border/50 bg-accent/20 p-4 sm:mt-12 sm:p-6">
            <div className="flex items-center gap-2 mb-4">
              <MessageCircle className="w-5 h-5 text-primary" />
              <h3 className="text-sm font-bold uppercase tracking-widest text-foreground">{t('storyDetail.addComment')}</h3>
            </div>
            <div className="space-y-3">
              <Textarea
                placeholder={t('storyDetail.shareThoughts')}
                className="min-h-[80px] bg-white border-border focus-visible:ring-primary p-3"
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                maxLength={500}
              />
              <div className="flex items-center justify-between">
                <p className="text-[9px] text-muted font-bold uppercase tracking-widest">
                  {t('storyDetail.commentCharacters', { count: commentText.length })}
                </p>
                <Button
                  onClick={handleAddComment}
                  disabled={!commentText.trim() || isSubmittingComment}
                  className="rounded-full gap-2 text-[10px] font-black uppercase tracking-widest bg-primary hover:bg-primary/90"
                >
                  <Send className="w-3 h-3" />
                  {isSubmittingComment ? t('storyDetail.posting') : t('storyDetail.comment')}
                </Button>
              </div>
            </div>
          </div>
        ) : (
          <div className="mt-8 rounded-2xl border border-border/60 bg-muted/20 p-4 sm:mt-12 sm:p-6">
            <div className="flex items-center gap-2 text-muted">
              <MessageCircleOff className="w-5 h-5" />
              <h3 className="text-sm font-bold uppercase tracking-widest">{t('storyDetail.commentsOff')}</h3>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
}
