export type Category = 'conflict' | 'communication' | 'onboarding' | 'culture' | 'technical' | 'other';
export type Emotion = 'stress' | 'confusion' | 'success' | 'happy' | 'neutral' | 'frustrated';

export interface Comment {
  id: string;
  authorId: string;
  authorName: string;
  authorImage?: string;
  content: string;
  createdAt: number;
}

export interface Story {
  id: string;
  title: string;
  content: string;
  category: Category;
  emotion?: Emotion;
  isAnonymous?: boolean;
  allowComments?: boolean;
  latitude: number;
  longitude: number;
  createdAt: number;
  upvotedBy: string[];
  downvotedBy: string[];
  authorId?: string;
  authorName?: string;
  authorImage?: string;
  comments?: Comment[];
}

export interface UserProfile {
  uid: string;
  displayName: string;
  photoURL?: string;
  email: string;
}
