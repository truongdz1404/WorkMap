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
    <div className="bg-white p-8 rounded-2xl shadow-2xl w-full max-w-md border border-border">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-2xl font-serif font-bold text-foreground">Share your story</h2>
          <p className="text-[10px] uppercase font-black text-muted tracking-widest mt-1">Location: {latitude.toFixed(4)}, {longitude.toFixed(4)}</p>
        </div>
        <Button variant="ghost" size="icon" onClick={onClose} className="rounded-full hover:bg-accent">
          <X className="w-5 h-5 text-muted" />
        </Button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <label className="text-[10px] font-black text-muted uppercase tracking-widest">Title</label>
          <Input
            placeholder="A short, catchy title"
            className="bg-accent/30 border-border focus-visible:ring-primary h-11 font-bold"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            maxLength={100}
          />
        </div>

        <div className="space-y-2">
          <label className="text-[10px] font-black text-muted uppercase tracking-widest">Category</label>
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

        <div className="space-y-2">
          <label className="text-[10px] font-black text-muted uppercase tracking-widest">How did you feel?</label>
          <div className="grid grid-cols-3 gap-2.5">
            {EMOTIONS.map((emo) => (
              <button
                key={emo.value}
                type="button"
                onClick={() => setEmotion(emotion === emo.value ? 'none' : emo.value)}
                className={`flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all ${emotion === emo.value
                    ? 'border-primary bg-primary/15 shadow-md'
                    : 'border-border bg-white hover:border-primary/30 hover:bg-accent/30'
                  }`}
              >
                <span className="text-2xl mb-1">{emo.icon}</span>
                <span className="text-[8px] font-black tracking-widest text-foreground leading-tight">{emo.label}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-[10px] font-black text-muted uppercase tracking-widest">Your Story</label>
          <Textarea
            placeholder="What happened? How did you handle it?"
            className="min-h-[150px] bg-accent/30 border-border focus-visible:ring-primary p-4 leading-relaxed"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            required
            maxLength={5000}
          />
          <p className="text-[9px] text-muted font-bold text-right uppercase tracking-widest">
            {content.length} / 5000 characters
          </p>
        </div>

        <div className="pt-4 flex gap-4">
          <Button variant="outline" className="flex-1 rounded-full h-12 font-black uppercase tracking-widest text-[10px] border-border hover:bg-accent" onClick={onClose} type="button">
            Cancel
          </Button>
          <Button className="flex-1 rounded-full h-12 font-black uppercase tracking-widest text-[10px] bg-primary hover:bg-primary/90" type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Posting...' : 'Post Story'}
          </Button>
        </div>
      </form>
    </div>
  );
}
