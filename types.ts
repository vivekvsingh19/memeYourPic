

export interface MemeStyle {
  id: string;
  label: string;
  emoji: string;
  prompt: string;
}

export interface GeneratedCaption {
  id: string;
  text: string;
}

export type ViewState = 'HOME' | 'RESULT' | 'LOGIN' | 'SIGNUP' | 'FORGOT_PASSWORD';

export interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
}

// Re-exporting Firebase User type or a simplified version to avoid dependency issues in pure types file if needed.
// For now, we'll define a basic interface compatible with Firebase User.
export interface User {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
}

// Editor Types
export type LayerType = 'text' | 'sticker' | 'image';

export interface Layer {
  id: string;
  type: LayerType;
  content: string; // Text content or Emoji char or Alt text for images
  src?: string; // For image layers (Data URL)
  x: number; // percentage 0-100
  y: number; // percentage 0-100
  rotation: number; // degrees
  scale: number; // 1.0 is base
  width?: number; // percentage relative to container width (for text wrapping)
  
  // Text Properties
  fontFamily?: string;
  color?: string;
  strokeColor?: string;
  strokeWidth?: number;
  fontSize?: number; // relative base size
  isUppercase?: boolean;
  isStrikethrough?: boolean;
  isBold?: boolean;
}

export interface MemeTemplate {
  id: string;
  label: string;
  preview: string;
  layers: Partial<Layer>[]; // Preset configurations
}

export interface EditorState {
  layers: Layer[];
  selectedId: string | null;
}