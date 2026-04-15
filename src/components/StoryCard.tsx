import { Story } from '../types';
import { CATEGORIES, EMOTIONS } from '../constants';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Heart, Clock, User } from 'lucide-react';
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
      className="cursor-pointer hover:shadow-lg transition-all border border-border/50 bg-white hover:border-primary/50 group rounded-2xl overflow-hidden"
      onClick={onClick}
    >
      <CardHeader className="p-6 pb-3">
        <div className="flex justify-between items-start gap-3 mb-3">
          <Badge 
            variant="outline" 
            className="text-[10px] uppercase font-black tracking-widest px-3 py-1 flex-shrink-0 !text-foreground"
            style={{ borderColor: category?.color, backgroundColor: `${category?.color}15` }}
          >
            {category?.label}
          </Badge>
          {emotion && (
            <div className="flex items-center gap-1.5 bg-accent px-2.5 py-1 rounded-full border border-border/50 text-[10px] font-bold uppercase tracking-widest whitespace-nowrap flex-shrink-0">
              <span className="text-base leading-none">{emotion.icon}</span>
              <span>{emotion.label}</span>
            </div>
          )}
        </div>
        <CardTitle className="text-lg font-serif font-bold line-clamp-2 group-hover:text-primary transition-colors leading-tight">
          {story.title}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6 pt-3 space-y-4">
        <p className="text-sm text-foreground/70 leading-relaxed line-clamp-2">
          {story.content}
        </p>
        
        <div className="flex items-center justify-between pt-2 border-t border-border/30">
          <div className="flex items-center gap-4 text-[11px] text-muted font-bold uppercase tracking-wider">
            <span className="flex items-center gap-1.5 hover:text-secondary transition-colors">
              <Heart className="w-4 h-4" /> {story.likesCount}
            </span>
            <span className="flex items-center gap-1.5">
              <Clock className="w-4 h-4" /> {formatDistanceToNow(story.createdAt)} ago
            </span>
          </div>
        </div>
        
        <div className="flex items-center gap-2 pt-1">
          {story.authorImage ? (
            <img src={story.authorImage} alt={story.authorName} className="w-5 h-5 rounded-full border border-border/50 object-cover" referrerPolicy="no-referrer" />
          ) : (
            <div className="w-5 h-5 rounded-full bg-accent border border-border/50 flex items-center justify-center">
              <User className="w-3 h-3 text-muted" />
            </div>
          )}
          <span className="text-xs font-bold text-foreground truncate">{story.authorName || 'Anonymous'}</span>
        </div>
      </CardContent>
    </Card>
  );
}
