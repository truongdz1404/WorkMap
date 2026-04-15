import { Story } from '../types';
import { CATEGORIES, EMOTIONS } from '../constants';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { X, Heart, Share2, MapPin, Clock, User } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { motion, AnimatePresence } from 'motion/react';

interface StoryDetailProps {
  story: Story;
  onClose: () => void;
  onLike: (storyId: string) => void;
}

export default function StoryDetail({ story, onClose, onLike }: StoryDetailProps) {
  const category = CATEGORIES.find(c => c.value === story.category);
  const emotion = EMOTIONS.find(e => e.value === story.emotion);

  return (
    <motion.div 
      initial={{ x: '100%' }}
      animate={{ x: 0 }}
      exit={{ x: '100%' }}
      transition={{ type: 'spring', damping: 25, stiffness: 200 }}
      className="fixed inset-y-0 right-0 w-full md:w-[500px] bg-white shadow-2xl z-50 flex flex-col border-l border-border"
    >
      <div className="p-6 border-b border-border flex justify-between items-center bg-background/50 backdrop-blur-sm">
        <Button variant="ghost" size="icon" onClick={onClose} className="rounded-full hover:bg-accent">
          <X className="w-5 h-5 text-muted" />
        </Button>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="rounded-full gap-2 text-[10px] font-black uppercase tracking-widest border-border" onClick={() => onLike(story.id)}>
            <Heart className="w-4 h-4 text-secondary" /> {story.likesCount}
          </Button>
          <Button variant="outline" size="sm" className="rounded-full gap-2 text-[10px] font-black uppercase tracking-widest border-border">
            <Share2 className="w-4 h-4 text-primary" /> Share
          </Button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-10">
        <div className="mb-10">
          <div className="flex items-center gap-3 mb-6">
            <Badge 
              variant="outline" 
              className="text-[9px] uppercase font-black tracking-widest px-3 py-1"
              style={{ borderColor: category?.color, color: category?.color, backgroundColor: `${category?.color}10` }}
            >
              {category?.label}
            </Badge>
            {emotion && (
              <div className="flex items-center gap-2 bg-accent/50 px-3 py-1 rounded-full border border-border">
                <span className="text-lg">{emotion.icon}</span>
                <span className="text-[9px] uppercase font-black text-muted tracking-widest">{emotion.label}</span>
              </div>
            )}
          </div>
          <h1 className="text-4xl font-serif font-bold text-foreground leading-tight mb-8">
            {story.title}
          </h1>
          
          <div className="grid grid-cols-2 gap-6 py-8 border-y border-border">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-full bg-accent flex items-center justify-center border border-border">
                <User className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-[9px] uppercase font-black text-muted tracking-widest leading-none mb-1">Author</p>
                <p className="text-sm font-bold text-foreground">{story.authorName || 'Anonymous'}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-full bg-accent flex items-center justify-center border border-border">
                <Clock className="w-5 h-5 text-secondary" />
              </div>
              <div>
                <p className="text-[9px] uppercase font-black text-muted tracking-widest leading-none mb-1">Shared</p>
                <p className="text-sm font-bold text-foreground">{formatDistanceToNow(story.createdAt)} ago</p>
              </div>
            </div>
          </div>
        </div>

        <div className="prose prose-stone max-w-none">
          <p className="text-foreground/80 leading-relaxed whitespace-pre-wrap text-lg font-sans">
            {story.content}
          </p>
        </div>

        <div className="mt-16 p-8 bg-accent/20 rounded-2xl border border-border">
          <div className="flex items-center gap-2 text-muted mb-3">
            <MapPin className="w-4 h-4" />
            <span className="text-[10px] font-black uppercase tracking-widest">Location Context</span>
          </div>
          <p className="text-sm font-bold text-muted">
            Coordinates: {story.latitude.toFixed(4)}, {story.longitude.toFixed(4)}
          </p>
        </div>
      </div>
    </motion.div>
  );
}
