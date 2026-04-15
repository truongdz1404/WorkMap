export type Category = 'conflict' | 'communication' | 'onboarding' | 'culture' | 'technical' | 'other';
export type Emotion = 'stress' | 'confusion' | 'success' | 'happy' | 'neutral' | 'frustrated';

export interface Story {
  id: string;
  title: string;
  content: string;
  category: Category;
  emotion?: Emotion;
  latitude: number;
  longitude: number;
  createdAt: number;
  likesCount: number;
  authorId?: string;
  authorName?: string;
  authorImage?: string;
}

export interface UserProfile {
  uid: string;
  displayName: string;
  photoURL?: string;
  email: string;
}
