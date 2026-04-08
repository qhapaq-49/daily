// Image sources are combined from two places:
//  1. Files in src/assets/stickers/ and src/assets/avatars/  (bundled into the app)
//  2. URLs listed in src/assets/image-config.ts              (fetched at runtime, not uploaded to GitHub)
//
// For most cases, just add URLs to image-config.ts.

import { STICKER_URLS, AVATAR_URLS } from '../assets/image-config';

const localStickers = Object.values(
  import.meta.glob('../assets/stickers/*.{png,jpg,jpeg,gif,webp,svg,PNG,JPG,JPEG,GIF,WEBP,SVG}', {
    eager: true,
    import: 'default',
  }) as Record<string, string>
);

const localAvatars = Object.values(
  import.meta.glob('../assets/avatars/*.{png,jpg,jpeg,gif,webp,svg,PNG,JPG,JPEG,GIF,WEBP,SVG}', {
    eager: true,
    import: 'default',
  }) as Record<string, string>
);

// URL-based images are shown as-is (fetched from original host, not uploaded to GitHub)
export const STICKER_ASSETS: string[] = [...localStickers, ...STICKER_URLS];
export const AVATAR_ASSETS: string[] = [...localAvatars, ...AVATAR_URLS];
