import { Category, Emotion } from './types';

export const CATEGORIES: { value: Category; label: string; color: string }[] = [
  { value: 'conflict', label: 'Conflict', color: '#ef4444' },
  { value: 'communication', label: 'Communication', color: '#3b82f6' },
  { value: 'onboarding', label: 'Onboarding', color: '#10b981' },
  { value: 'culture', label: 'Culture', color: '#f59e0b' },
  { value: 'technical', label: 'Technical', color: '#8b5cf6' },
  { value: 'other', label: 'Other', color: '#6b7280' },
];

export const EMOTIONS: { value: Emotion; label: string; icon: string }[] = [
  { value: 'stress', label: 'Stress', icon: '😫' },
  { value: 'confusion', label: 'Confusion', icon: '🤔' },
  { value: 'success', label: 'Success', icon: '🏆' },
  { value: 'happy', label: 'Happy', icon: '😊' },
  { value: 'neutral', label: 'Neutral', icon: '😐' },
  { value: 'frustrated', label: 'Frustrated', icon: '😤' },
];

export const MAP_CENTER: [number, number] = [14.0583, 108.2772]; // Vietnam center
export const DEFAULT_ZOOM = 6;
