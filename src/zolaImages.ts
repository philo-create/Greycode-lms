// Centralized memory for Zola's actual image assets
// This maps poses of Zola to their actual SVG image files for high-contrast, scalable, offline use.

// @ts-ignore
const waving = '/assets/images/zola/waving.svg';
// @ts-ignore
const highfive = '/assets/images/zola/highfive.svg';
// @ts-ignore
const crayonBook = '/assets/images/zola/crayon_book.svg';
// @ts-ignore
const reminder = '/assets/images/zola/reminder.svg';
// @ts-ignore
const thumbsup = '/assets/images/zola/thumbsup.svg';
// @ts-ignore
const clapping = '/assets/images/zola/clapping.svg';
// @ts-ignore
const pointingIdea = '/assets/images/zola/pointing_idea.svg';
// @ts-ignore
const pointingSide = '/assets/images/zola/pointing_side.svg';
// @ts-ignore
const thinking = '/assets/images/zola/thinking.svg';
// @ts-ignore
const armsCrossed = '/assets/images/zola/arms_crossed.svg';

export const zolaImages = {
  waving,
  highfive,
  crayon_book: crayonBook,
  learning: crayonBook,
  playing: crayonBook,
  reminder,
  listening: thinking,
  thumbsup,
  clapping,
  pointing_idea: pointingIdea,
  pointing_side: pointingSide,
  pointing: pointingIdea,
  thinking,
  arms_crossed: armsCrossed,
};

export type ZolaPose = keyof typeof zolaImages;

export const getZolaImage = (pose: string): string => {
  const normalized = pose.toLowerCase();
  let imgObj;
  if (normalized in zolaImages) {
    imgObj = zolaImages[normalized as ZolaPose];
  } else {
    imgObj = zolaImages.waving; // Default fallback
  }
  // Next.js static imports return an object with a .src property
  return (imgObj as any).src || imgObj;
};
