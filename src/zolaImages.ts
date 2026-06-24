// Centralized memory for Zola's actual image assets
// This maps poses of Zola to their actual SVG image files for high-contrast, scalable, offline use.

// @ts-ignore
import waving from './assets/images/zola/waving.svg';
// @ts-ignore
import highfive from './assets/images/zola/highfive.svg';
// @ts-ignore
import crayonBook from './assets/images/zola/crayon_book.svg';
// @ts-ignore
import reminder from './assets/images/zola/reminder.svg';
// @ts-ignore
import thumbsup from './assets/images/zola/thumbsup.svg';
// @ts-ignore
import clapping from './assets/images/zola/clapping.svg';
// @ts-ignore
import pointingIdea from './assets/images/zola/pointing_idea.svg';
// @ts-ignore
import pointingSide from './assets/images/zola/pointing_side.svg';
// @ts-ignore
import thinking from './assets/images/zola/thinking.svg';
// @ts-ignore
import armsCrossed from './assets/images/zola/arms_crossed.svg';

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
