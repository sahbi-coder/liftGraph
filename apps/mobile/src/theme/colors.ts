export const colors = {
  darkerGray: '#111827',
  darkGray: '#1b2433',
  lightGray: '#1f2937',
  white: '#ffffff',
  niceOrange: '#f97316',
  midGray: '#374151',
} as const;

export type ColorKey = keyof typeof colors;
