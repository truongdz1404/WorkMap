import { Story } from '../types';
import { CATEGORIES, EMOTIONS } from '../constants';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { ThumbsUp, ThumbsDown, Clock, User, MessageCircle } from 'lucide-react';
import { useState } from 'react';
import { useI18n } from '../i18n';

interface StoryCardProps {
  story: Story;
  onClick: () => void;
  onUpvote?: (storyId: string) => void;
  onDownvote?: (storyId: string) => void;
  onComment?: (storyId: string) => void;
  currentUserId?: string;
  key?: string;
}

export default function StoryCard({ story, onClick, onUpvote, onDownvote, onComment, currentUserId }: StoryCardProps) {
  const { t, formatRelativeTime } = useI18n();
  const category = CATEGORIES.find(c => c.value === story.category);
  const emotion = EMOTIONS.find(e => e.value === story.emotion);
  const hasUpvoted = currentUserId && story.upvotedBy?.includes(currentUserId);
  const hasDownvoted = currentUserId && story.downvotedBy?.includes(currentUserId);
  const [hoveredButton, setHoveredButton] = useState<string | null>(null);

  const upvoteCount = story.upvotedBy?.length || 0;
  const downvoteCount = story.downvotedBy?.length || 0;
  const commentCount = story.comments?.length || 0;
  const commentsEnabled = story.allowComments !== false;

  return (
    <Card
      className="cursor-pointer hover:shadow-lg transition-all border border-border/50 bg-card hover:border-primary/50 group rounded-2xl overflow-hidden dark:bg-card"
      onClick={onClick}
    >
      <CardHeader className="p-6 pb-3">
        <div className="flex justify-between items-start gap-3 mb-3">
          <Badge
            variant="outline"
            className="text-[10px] uppercase font-black tracking-widest px-3 py-1 flex-shrink-0 !text-foreground"
            style={{ borderColor: category?.color, backgroundColor: `${category?.color}15` }}
          >
            {category ? t(`categories.${category.value}`) : t('categories.other')}
          </Badge>
          {emotion && (
            <div className="flex items-center gap-1.5 bg-accent px-2.5 py-1 rounded-full border border-border/50 text-[10px] font-bold uppercase tracking-widest whitespace-nowrap flex-shrink-0">
              <span className="text-base leading-none">{emotion.icon}</span>
              <span>{t(`emotions.${emotion.value}`)}</span>
            </div>
          )}
        </div>
        <CardTitle className="text-lg font-serif font-bold line-clamp-2 group-hover:text-primary transition-colors leading-tight">
          {story.title}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6 pt-3 space-y-4">
        <p className="text-sm text-foreground/70 leading-relaxed line-clamp-3">
          {story.content}
        </p>

        <div className="flex items-center justify-between pt-3 border-t border-border/30">
          <div className="flex items-center gap-3 text-[11px] text-muted font-bold uppercase tracking-wider">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onUpvote?.(story.id);
              }}
              onMouseEnter={() => setHoveredButton('upvote')}
              onMouseLeave={() => setHoveredButton(null)}
              className="flex items-center gap-1.5 px-2 py-1.5 rounded-md transition-all hover:bg-accent/50"
            >
              <ThumbsUp 
                className={`w-4 h-4 transition-colors ${
                  hoveredButton === 'upvote' || hasUpvoted ? 'text-green-600 dark:text-green-400' : 'text-muted'
                }`} 
              />
              <span className="font-semibold">{upvoteCount}</span>
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDownvote?.(story.id);
              }}
              onMouseEnter={() => setHoveredButton('downvote')}
              onMouseLeave={() => setHoveredButton(null)}
              className="flex items-center gap-1.5 px-2 py-1.5 rounded-md transition-all hover:bg-accent/50"
            >
              <ThumbsDown 
                className={`w-4 h-4 transition-colors ${
                  hoveredButton === 'downvote' || hasDownvoted ? 'text-red-600 dark:text-red-400' : 'text-muted'
                }`} 
              />
              <span className="font-semibold">{downvoteCount}</span>
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                if (!commentsEnabled) return;
                onComment?.(story.id);
              }}
              onMouseEnter={() => setHoveredButton('comment')}
              onMouseLeave={() => setHoveredButton(null)}
              disabled={!commentsEnabled}
              className={`flex items-center gap-1.5 px-2 py-1.5 rounded-md transition-all ml-1 ${commentsEnabled ? 'hover:bg-accent/50' : 'opacity-45 cursor-not-allowed'}`}
            >
              <MessageCircle 
                className={`w-4 h-4 transition-colors ${
                  commentsEnabled && hoveredButton === 'comment' ? 'text-blue-600 dark:text-blue-400' : 'text-muted'
                }`} 
              />
              <span className="font-semibold">{commentCount}</span>
            </button>
          </div>

          <span className="text-[10px] font-bold text-muted">
            {formatRelativeTime(story.createdAt)}
          </span>
        </div>

        <div className="flex items-center gap-2 pt-2">
          {story.authorImage ? (
            <img src={story.authorImage} alt={story.authorName} className="w-5 h-5 rounded-full border border-border/50 object-cover" referrerPolicy="no-referrer" />
          ) : (
            <div className="w-5 h-5 rounded-full bg-accent border border-border/50 flex items-center justify-center">
              <User className="w-3 h-3 text-muted" />
            </div>
          )}
          <span className="text-xs font-bold text-foreground truncate">{story.authorName || t('app.anonymousName')}</span>
        </div>
      </CardContent>
    </Card>
  );
}
