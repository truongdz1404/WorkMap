import { Category, Emotion } from './types';

export const CATEGORIES: { value: Category; color: string }[] = [
  { value: 'conflict', color: '#ef4444' },
  { value: 'communication', color: '#3b82f6' },
  { value: 'onboarding', color: '#10b981' },
  { value: 'culture', color: '#f59e0b' },
  { value: 'technical', color: '#8b5cf6' },
  { value: 'other', color: '#6b7280' },
];

export const EMOTIONS: { value: Emotion; icon: string }[] = [
  { value: 'stress', icon: '😫' },
  { value: 'confusion', icon: '🤔' },
  { value: 'success', icon: '🏆' },
  { value: 'happy', icon: '😊' },
  { value: 'neutral', icon: '😐' },
  { value: 'frustrated', icon: '😤' },
];

export const MAP_CENTER: [number, number] = [14.0583, 108.2772]; // Vietnam center
export const DEFAULT_ZOOM = 6;
