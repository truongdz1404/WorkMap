import React, { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { CATEGORIES, EMOTIONS } from '../constants';
import { Category, Emotion } from '../types';
import { X } from 'lucide-react';
import { useI18n } from '../i18n';

interface StoryFormProps {
  latitude: number;
  longitude: number;
  onSubmit: (data: StoryFormData) => void;
  onClose: () => void;
  isSubmitting: boolean;
}

interface StoryFormData {
  title: string;
  content: string;
  category: Category;
  emotion?: Emotion;
  latitude: number;
  longitude: number;
  isAnonymous: boolean;
  allowComments: boolean;
}

export default function StoryForm({ latitude, longitude, onSubmit, onClose, isSubmitting }: StoryFormProps) {
  const { t } = useI18n();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState<Category>('other');
  const [emotion, setEmotion] = useState<Emotion | 'none'>('none');
  const [isAnonymous, setIsAnonymous] = useState(true);
  const [allowComments, setAllowComments] = useState(true);

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
      isAnonymous,
      allowComments,
    });
  };

  return (
    <div className="max-h-[90dvh] w-full max-w-md overflow-y-auto rounded-2xl border border-border bg-card p-4 shadow-2xl sm:p-6 md:max-w-[620px] md:p-8">
      <div className="mb-5 flex items-start justify-between sm:mb-8">
        <div>
          <h2 className="text-xl font-serif font-bold text-foreground sm:text-2xl">{t('storyForm.title')}</h2>
          <p className="mt-1 text-[9px] font-black uppercase tracking-widest text-foreground/55 sm:text-[10px]">{t('storyForm.location')}: {latitude.toFixed(4)}, {longitude.toFixed(4)}</p>
        </div>
        <Button variant="ghost" size="icon" onClick={onClose} className="rounded-full hover:bg-accent">
          <X className="w-5 h-5 text-foreground/55" />
        </Button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
        <div className="space-y-1.5 sm:space-y-2">
          <label className="text-[10px] font-black uppercase tracking-widest text-foreground/70">{t('storyForm.titleLabel')}</label>
          <Input
            placeholder={t('storyForm.titlePlaceholder')}
            className="bg-accent/30 border-border focus-visible:ring-primary h-11 font-bold"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            maxLength={100}
          />
        </div>

        <div className="space-y-1.5 sm:space-y-2">
          <label className="text-[10px] font-black uppercase tracking-widest text-foreground/70">{t('storyForm.categoryLabel')}</label>
          <Select value={category} onValueChange={(v) => setCategory(v as Category)}>
            <SelectTrigger className="bg-accent/30 border-border h-11 font-bold text-foreground data-placeholder:text-foreground/60 dark:bg-accent/50 dark:border-border/50">
              <SelectValue className="text-foreground" placeholder={t('storyForm.selectCategory')} />
            </SelectTrigger>
            <SelectContent>
              {CATEGORIES.map((cat) => (
                <SelectItem key={cat.value} value={cat.value} className="font-bold">
                  {t(`categories.${cat.value}`)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5 sm:space-y-2">
          <label className="text-[10px] font-black uppercase tracking-widest text-foreground/70">{t('storyForm.emotionLabel')}</label>
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
                <span className="text-[8px] font-black tracking-widest text-foreground leading-tight">{t(`emotions.${emo.value}`)}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-1.5 sm:space-y-2">
          <label className="text-[10px] font-black uppercase tracking-widest text-foreground/70">{t('storyForm.storyLabel')}</label>
          <Textarea
            placeholder={t('storyForm.storyPlaceholder')}
            className="min-h-[130px] max-h-[50vh] resize-none overflow-y-auto bg-accent/30 border-border p-4 leading-relaxed focus-visible:ring-primary sm:min-h-[150px]"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            required
            maxLength={5000}
          />
          <p className="text-[9px] font-bold text-right uppercase tracking-widest text-foreground/45">
            {t('storyForm.charactersCount', { count: content.length })}
          </p>
        </div>

        <div className="space-y-3 rounded-2xl border border-border bg-accent/20 p-3 sm:p-4">
          <div className="flex items-center justify-between gap-3 rounded-xl bg-card p-3 border border-border/70">
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-foreground">{t('storyForm.postAnonymousTitle')}</p>
              <p className="text-[10px] font-bold text-foreground/55">{t('storyForm.postAnonymousDesc')}</p>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={isAnonymous}
              onClick={() => setIsAnonymous((prev) => !prev)}
              className={`h-7 w-12 rounded-full border-2 transition-colors ${isAnonymous ? 'border-primary bg-primary/90' : 'border-border bg-accent dark:border-muted dark:bg-muted/40'}`}
            >
              <span
                className={`block h-5 w-5 rounded-full shadow-sm transition-transform ${isAnonymous ? 'translate-x-5 bg-primary-foreground' : 'translate-x-0 bg-muted-foreground dark:bg-foreground/90'}`}
              />
            </button>
          </div>

          <div className="flex items-center justify-between gap-3 rounded-xl bg-card p-3 border border-border/70">
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-foreground">{t('storyForm.allowCommentsTitle')}</p>
              <p className="text-[10px] font-bold text-foreground/55">{t('storyForm.allowCommentsDesc')}</p>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={allowComments}
              onClick={() => setAllowComments((prev) => !prev)}
              className={`h-7 w-12 rounded-full border-2 transition-colors ${allowComments ? 'border-primary bg-primary/90' : 'border-border bg-accent dark:border-muted dark:bg-muted/40'}`}
            >
              <span
                className={`block h-5 w-5 rounded-full shadow-sm transition-transform ${allowComments ? 'translate-x-5 bg-primary-foreground' : 'translate-x-0 bg-muted-foreground dark:bg-foreground/90'}`}
              />
            </button>
          </div>
        </div>

        <div className="sticky bottom-0 flex gap-3 bg-card/95 pt-2 pb-1 backdrop-blur supports-[backdrop-filter]:bg-card/80 sm:static sm:bg-transparent sm:pt-4 sm:pb-0">
          <Button variant="outline" className="h-11 flex-1 rounded-full border-border text-foreground text-[10px] font-black uppercase tracking-widest hover:bg-accent dark:hover:bg-accent/60 dark:border-border/60 dark:text-foreground sm:h-12" onClick={onClose} type="button">
            {t('storyForm.cancel')}
          </Button>
          <Button className="h-11 flex-1 rounded-full bg-primary text-[10px] font-black uppercase tracking-widest hover:bg-primary/90 sm:h-12" type="submit" disabled={isSubmitting}>
            {isSubmitting ? t('storyForm.posting') : t('storyForm.postStory')}
          </Button>
        </div>
      </form>
    </div>
  );
}
