import React, { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { CATEGORIES, EMOTIONS } from '../constants';
import { Category, Emotion } from '../types';
import { X } from 'lucide-react';

interface StoryFormProps {
  latitude: number;
  longitude: number;
  onSubmit: (data: any) => void;
  onClose: () => void;
  isSubmitting: boolean;
}

export default function StoryForm({ latitude, longitude, onSubmit, onClose, isSubmitting }: StoryFormProps) {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState<Category>('other');
  const [emotion, setEmotion] = useState<Emotion | 'none'>('none');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !content) return;

    onSubmit({
      title,
      content,
      category,
      emotion: emotion === 'none' ? undefined : emotion,
      latitude,
      longitude,
    });
  };

  return (
    <div className="max-h-[90dvh] w-full max-w-md overflow-y-auto rounded-2xl border border-border bg-white p-4 shadow-2xl sm:p-6 md:max-w-[620px] md:p-8">
      <div className="mb-5 flex items-start justify-between sm:mb-8">
        <div>
          <h2 className="text-xl font-serif font-bold text-foreground sm:text-2xl">Share your story</h2>
          <p className="mt-1 text-[9px] font-black uppercase tracking-widest text-foreground/55 sm:text-[10px]">Location: {latitude.toFixed(4)}, {longitude.toFixed(4)}</p>
        </div>
        <Button variant="ghost" size="icon" onClick={onClose} className="rounded-full hover:bg-accent">
          <X className="w-5 h-5 text-foreground/55" />
        </Button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
        <div className="space-y-1.5 sm:space-y-2">
          <label className="text-[10px] font-black uppercase tracking-widest text-foreground/70">Title</label>
          <Input
            placeholder="A short, catchy title"
            className="bg-accent/30 border-border focus-visible:ring-primary h-11 font-bold"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            maxLength={100}
          />
        </div>

        <div className="space-y-1.5 sm:space-y-2">
          <label className="text-[10px] font-black uppercase tracking-widest text-foreground/70">Category</label>
          <Select value={category} onValueChange={(v) => setCategory(v as Category)}>
            <SelectTrigger className="bg-accent/30 border-border h-11 font-bold">
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent>
              {CATEGORIES.map((cat) => (
                <SelectItem key={cat.value} value={cat.value} className="font-bold">
                  {cat.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5 sm:space-y-2">
          <label className="text-[10px] font-black uppercase tracking-widest text-foreground/70">How did you feel?</label>
          <div className="grid grid-cols-3 gap-2">
            {EMOTIONS.map((emo) => (
              <button
                key={emo.value}
                type="button"
                onClick={() => setEmotion(emotion === emo.value ? 'none' : emo.value)}
                className={`flex flex-col items-center justify-center rounded-xl border-2 p-2.5 transition-all sm:p-4 ${emotion === emo.value
                    ? 'border-primary bg-primary/15 shadow-md'
                    : 'border-border bg-white hover:border-primary/30 hover:bg-accent/30'
                  }`}
              >
                <span className="mb-1 text-xl sm:text-2xl">{emo.icon}</span>
                <span className="text-[8px] font-black tracking-widest text-foreground leading-tight">{emo.label}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-1.5 sm:space-y-2">
          <label className="text-[10px] font-black uppercase tracking-widest text-foreground/70">Your Story</label>
          <Textarea
            placeholder="What happened? How did you handle it?"
            className="field-sizing-fixed h-40 max-h-56 resize-none overflow-y-auto bg-accent/30 border-border p-4 leading-relaxed focus-visible:ring-primary"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            required
            maxLength={5000}
          />
          <p className="text-[9px] font-bold text-right uppercase tracking-widest text-foreground/45">
            {content.length} / 5000 characters
          </p>
        </div>

        <div className="sticky bottom-0 flex gap-3 bg-white/95 pt-2 pb-1 backdrop-blur supports-[backdrop-filter]:bg-white/80 sm:static sm:bg-transparent sm:pt-4 sm:pb-0">
          <Button variant="outline" className="h-11 flex-1 rounded-full border-border text-[10px] font-black uppercase tracking-widest hover:bg-accent sm:h-12" onClick={onClose} type="button">
            Cancel
          </Button>
          <Button className="h-11 flex-1 rounded-full bg-primary text-[10px] font-black uppercase tracking-widest hover:bg-primary/90 sm:h-12" type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Posting...' : 'Post Story'}
          </Button>
        </div>
      </form>
    </div>
  );
}
