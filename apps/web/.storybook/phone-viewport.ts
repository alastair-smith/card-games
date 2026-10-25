export const PHONE_VIEWPORT_KEY = 'phone';
export const PHONE_SCREEN_HEIGHT = 667;

export const PHONE_VIEWPORT = {
  name: 'Phone',
  styles: { width: '375px', height: `${PHONE_SCREEN_HEIGHT}px` },
  type: 'mobile',
} as const;
