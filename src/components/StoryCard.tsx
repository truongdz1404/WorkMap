import { Story } from '../types';
import { CATEGORIES, EMOTIONS } from '../constants';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Heart, MessageSquare, Clock } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface StoryCardProps {
  story: Story;
  onClick: () => void;
  key?: string;
}

export default function StoryCard({ story, onClick }: StoryCardProps) {
  const category = CATEGORIES.find(c => c.value === story.category);
  const emotion = EMOTIONS.find(e => e.value === story.emotion);

  return (
    <Card 
      className="cursor-pointer hover:shadow-md transition-all border-transparent bg-background hover:border-primary/30 group rounded-xl"
      onClick={onClick}
    >
      <CardHeader className="p-5 pb-2">
        <div className="flex justify-between items-start mb-2">
          <Badge 
            variant="outline" 
            className="text-[9px] uppercase font-black tracking-widest px-2 py-0.5"
            style={{ borderColor: category?.color, color: category?.color, backgroundColor: `${category?.color}10` }}
          >
            {category?.label}
          </Badge>
          {emotion && (
            <div className="flex items-center gap-1 bg-white px-2 py-0.5 rounded-full border border-border shadow-sm">
              <span className="text-xs">{emotion.icon}</span>
              <span className="text-[9px] uppercase font-bold text-muted">{emotion.label}</span>
            </div>
          )}
        </div>
        <CardTitle className="text-base font-serif font-bold line-clamp-1 group-hover:text-primary transition-colors">
          {story.title}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-5 pt-0">
        <p className="text-xs text-muted leading-relaxed line-clamp-2 mb-4">
          {story.content}
        </p>
        <div className="flex items-center justify-between text-[10px] text-muted font-bold uppercase tracking-wider">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <Heart className="w-3 h-3 text-secondary" /> {story.likesCount}
            </span>
            <span className="flex items-center gap-1 opacity-60">
              <Clock className="w-3 h-3" /> {formatDistanceToNow(story.createdAt)} ago
            </span>
          </div>
          <span className="text-primary/70">{story.authorName || 'Anonymous'}</span>
        </div>
      </CardContent>
    </Card>
  );
}
