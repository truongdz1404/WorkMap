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
  Languages,
} from 'lucide-react';
import { motion } from 'motion/react';
import { useState } from 'react';
import { Textarea } from './ui/textarea';
import { useI18n } from '../i18n';
import { translateText, translateTexts } from '../lib/translation';
import { db } from '../firebase';
import { doc, updateDoc, getDoc } from 'firebase/firestore';

interface StoryDetailProps {
  story: Story;
  onClose: () => void;
  onUpvote: (storyId: string) => void;
  onDownvote: (storyId: string) => void;
  onAddComment?: (storyId: string, content: string) => void;
  currentUserId?: string;
}

function TranslatedComment({
  comment,
  formatRelativeTime,
  replyLabel,
  anonymousLabel,
  language,
  translateLabel,
  originalLabel,
  translatingLabel,
  storyId,
}: {
  comment: NonNullable<Story['comments']>[number];
  formatRelativeTime: (timestamp: number) => string;
  replyLabel: string;
  anonymousLabel: string;
  language: 'vi' | 'en';
  translateLabel: string;
  originalLabel: string;
  translatingLabel: string;
  storyId: string;
}) {
  const [isTranslated, setIsTranslated] = useState(false);
  const [isTranslating, setIsTranslating] = useState(false);
  const [translatedComment, setTranslatedComment] = useState<string | null>(comment.contentTranslations?.[language] ?? null);

  const handleToggleTranslation = async () => {
    if (isTranslated) {
      setIsTranslated(false);
      return;
    }

    if (translatedComment) {
      setIsTranslated(true);
      return;
    }

    setIsTranslating(true);
    try {
      const nextComment = await translateText(comment.content, {
        targetLanguage: language,
      });
      setTranslatedComment(nextComment);
      setIsTranslated(true);

      // Save translation to Firebase
      const storyRef = doc(db, 'stories', storyId);
      const storySnap = await getDoc(storyRef);
      if (storySnap.exists()) {
        const updatedComments = (storySnap.data().comments || []).map((c: any) =>
          c.id === comment.id
            ? {
              ...c,
              contentTranslations: {
                ...c.contentTranslations,
                [language]: nextComment,
              },
            }
            : c
        );
        await updateDoc(storyRef, { comments: updatedComments });
      }
    } catch (error) {
      console.error('Translate comment failed:', error);
    } finally {
      setIsTranslating(false);
    }
  };

  const displayComment = isTranslated ? (translatedComment ?? comment.content) : comment.content;

  return (
    <div className="flex items-start gap-2.5">
      {comment.authorImage ? (
        <img src={comment.authorImage} alt={comment.authorName} className="h-9 w-9 rounded-full object-cover" referrerPolicy="no-referrer" />
      ) : (
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-accent">
          <User className="h-4 w-4 text-muted-foreground" />
        </div>
      )}
      <div className="min-w-0 flex-1">
        <div className="rounded-2xl bg-accent px-3 py-2.5 border border-border">
          <p className="text-[14px] font-bold leading-none text-foreground">{comment.authorName || anonymousLabel}</p>
          <p className="mt-1.5 break-words text-[15px] leading-relaxed text-foreground">{displayComment}</p>
        </div>
        <div className="mt-1.5 flex items-center gap-4 px-1 text-xs font-semibold text-muted-foreground">
          <span>{formatRelativeTime(comment.createdAt)}</span>
          <button type="button" className="transition-colors hover:text-foreground">{replyLabel}</button>
          <button
            type="button"
            onClick={handleToggleTranslation}
            disabled={isTranslating}
            className="inline-flex items-center gap-1 transition-colors hover:text-foreground disabled:opacity-50"
          >
            <Languages className="h-3.5 w-3.5" />
            {isTranslating ? translatingLabel : isTranslated ? originalLabel : translateLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function StoryDetail({ story, onClose, onUpvote, onDownvote, onAddComment, currentUserId }: StoryDetailProps) {
  const { t, formatRelativeTime, language } = useI18n();
  const category = CATEGORIES.find((c) => c.value === story.category);
  const emotion = EMOTIONS.find((e) => e.value === story.emotion);
  const [commentText, setCommentText] = useState('');
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  const [isStoryTranslated, setIsStoryTranslated] = useState(false);
  const [isTranslatingStory, setIsTranslatingStory] = useState(false);
  const [translatedStory, setTranslatedStory] = useState<{ title: string; content: string } | null>(
    story.titleTranslations?.[language] && story.contentTranslations?.[language]
      ? { title: story.titleTranslations[language], content: story.contentTranslations[language] }
      : null,
  );

  const visibleTitle = isStoryTranslated ? (translatedStory?.title ?? story.title) : story.title;
  const visibleContent = isStoryTranslated ? (translatedStory?.content ?? story.content) : story.content;

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

  const handleToggleStoryTranslation = async () => {
    if (isStoryTranslated) {
      setIsStoryTranslated(false);
      return;
    }

    if (translatedStory) {
      setIsStoryTranslated(true);
      return;
    }

    setIsTranslatingStory(true);
    try {
      const [nextTitle, nextContent] = await translateTexts([story.title, story.content], {
        targetLanguage: language,
      });
      setTranslatedStory({ title: nextTitle, content: nextContent });
      setIsStoryTranslated(true);

      // Save translation to Firebase
      const storyRef = doc(db, 'stories', story.id);
      await updateDoc(storyRef, {
        titleTranslations: {
          ...story.titleTranslations,
          [language]: nextTitle,
        },
        contentTranslations: {
          ...story.contentTranslations,
          [language]: nextContent,
        },
      });
    } catch (error) {
      console.error('Translate story failed:', error);
    } finally {
      setIsTranslatingStory(false);
    }
  };

  return (
    <motion.div
      initial={{ x: '100%' }}
      animate={{ x: 0 }}
      exit={{ x: '100%' }}
      transition={{ type: 'spring', damping: 25, stiffness: 200 }}
      className="fixed inset-y-0 right-0 z-50 flex w-full flex-col border-l border-border bg-card text-foreground shadow-2xl md:w-[500px]"
    >
      <div className="flex items-center justify-between border-b border-border bg-card px-3 py-2 sm:px-4 sm:py-3">
        <Button variant="ghost" size="icon" onClick={onClose} className="rounded-full text-muted-foreground hover:bg-accent hover:text-foreground">
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="text-sm font-bold text-muted-foreground">{t('storyDetail.commentsTitle', { count: totalComments })}</div>
        <Button variant="ghost" size="icon" className="rounded-full text-muted-foreground hover:bg-accent hover:text-foreground">
          <MoreHorizontal className="h-5 w-5" />
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="px-3 pb-6 pt-3 sm:px-4">
          <div className="rounded-2xl bg-card border border-border p-4 shadow-lg">
            <div className="mb-3 flex items-start gap-3">
              {story.authorImage ? (
                <img src={story.authorImage} alt={story.authorName} className="h-11 w-11 rounded-full object-cover" referrerPolicy="no-referrer" />
              ) : (
                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-accent">
                  <User className="h-5 w-5 text-muted-foreground" />
                </div>
              )}
              <div className="min-w-0 flex-1">
                <div className="truncate text-base font-bold text-foreground">{story.authorName || t('storyDetail.anonymous')}</div>
                <div className="mt-0.5 text-xs font-medium text-muted-foreground">{formatRelativeTime(story.createdAt)}</div>
              </div>
            </div>

            <div className="mb-3 flex items-center gap-2">
              <button
                type="button"
                onClick={handleToggleStoryTranslation}
                disabled={isTranslatingStory}
                className="inline-flex items-center gap-1.5 rounded-full border border-border px-3 py-1 text-[10px] font-black uppercase tracking-widest text-muted-foreground transition-colors hover:bg-accent hover:text-foreground disabled:opacity-50"
              >
                <Languages className="h-3.5 w-3.5" />
                {isTranslatingStory ? t('storyDetail.translating') : isStoryTranslated ? t('storyDetail.original') : t('storyDetail.translate')}
              </button>
            </div>

            <h1 className="mb-2 text-2xl font-bold leading-tight text-foreground">{visibleTitle}</h1>
            <p className="whitespace-pre-wrap text-[17px] leading-relaxed text-foreground">{visibleContent}</p>

            <div className="mt-3 flex flex-wrap items-center gap-2">
              <span
                className="rounded-full px-2.5 py-1 text-[10px] font-black uppercase tracking-widest text-white"
                style={{ backgroundColor: category?.color || '#6b7280' }}
              >
                {category ? t(`categories.${category.value}`) : t('categories.other')}
              </span>
              {emotion && (
                <span className="rounded-full bg-accent px-2.5 py-1 text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                  {emotion.icon} {t(`emotions.${emotion.value}`)}
                </span>
              )}
            </div>

            <div className="mt-4 flex items-center justify-between border-y border-border py-2 text-sm text-muted-foreground">
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
                className={`flex items-center justify-center gap-2 rounded-lg px-2 py-2 text-xs font-bold transition-colors ${hasUpvoted ? 'bg-green-900/30 text-green-400' : 'text-muted-foreground hover:bg-accent'}`}
              >
                <ThumbsUp className="h-4 w-4" />
                {upvoteCount}
              </button>
              <button
                type="button"
                onClick={() => onDownvote(story.id)}
                className={`flex items-center justify-center gap-2 rounded-lg px-2 py-2 text-xs font-bold transition-colors ${hasDownvoted ? 'bg-red-900/30 text-red-400' : 'text-muted-foreground hover:bg-accent'}`}
              >
                <ThumbsDown className="h-4 w-4" />
                {downvoteCount}
              </button>
              <button
                type="button"
                className="flex items-center justify-center gap-2 rounded-lg px-2 py-2 text-xs font-bold text-muted-foreground transition-colors hover:bg-accent"
              >
                <Share2 className="h-4 w-4" />
                {t('storyDetail.share')}
              </button>
            </div>
          </div>

          <div className="mt-4 flex items-center justify-between px-1">
            <h3 className="text-[15px] font-semibold text-foreground">{t('storyDetail.mostRelevant')}</h3>
            <MessageCircle className="h-4 w-4 text-muted-foreground" />
          </div>

          {commentsEnabled && totalComments > 0 && (
            <div className="mt-3 space-y-4">
              {story.comments?.map((comment) => (
                <TranslatedComment
                  key={comment.id}
                  comment={comment}
                  formatRelativeTime={formatRelativeTime}
                  replyLabel={t('storyDetail.reply')}
                  anonymousLabel={t('storyDetail.anonymous')}
                  language={language}
                  translateLabel={t('storyDetail.translate')}
                  originalLabel={t('storyDetail.original')}
                  translatingLabel={t('storyDetail.translating')}
                  storyId={story.id}
                />
              ))}
            </div>
          )}

          {commentsEnabled && totalComments === 0 && (
            <div className="mt-4 rounded-xl border border-border bg-card px-4 py-3 text-sm text-muted-foreground">
              {t('storyDetail.noCommentsYet')}
            </div>
          )}

          {!commentsEnabled && (
            <div className="mt-4 rounded-2xl border border-border bg-card p-4">
              <div className="flex items-center gap-2 text-muted-foreground">
                <MessageCircleOff className="h-5 w-5" />
                <h3 className="text-sm font-bold uppercase tracking-widest">{t('storyDetail.commentsOff')}</h3>
              </div>
            </div>
          )}
        </div>
      </div>

      {commentsEnabled && (
        <div className="border-t border-border bg-card px-3 py-3 sm:px-4">
          <div className="flex items-end gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-accent">
              <User className="h-4 w-4 text-muted-foreground" />
            </div>
            <div className="flex-1 rounded-2xl border border-border bg-accent px-3 py-2">
              <Textarea
                placeholder={t('storyDetail.writeComment')}
                className="min-h-[42px] border-0 bg-transparent p-0 text-sm text-foreground placeholder:text-muted-foreground focus-visible:ring-0"
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                maxLength={500}
              />
            </div>
            <Button
              onClick={handleAddComment}
              disabled={!commentText.trim() || isSubmittingComment}
              className="h-9 w-9 rounded-full bg-primary p-0 text-white hover:bg-primary/90 disabled:opacity-50"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
          <div className="mt-1 px-12 text-[11px] text-muted-foreground">
            {t('storyDetail.commentCharacters', { count: commentText.length })}
          </div>
        </div>
      )}
    </motion.div>
  );
}
