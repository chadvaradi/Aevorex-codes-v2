// Util: cleanText – strips all emoji-like unicode characters (U+1F300-1FAFF)
// The function is intentionally lightweight (no external deps) so it can be
// imported anywhere – including SWR hooks – without increasing bundle size.

const EMOJI_REGEX = /[\u{1F300}-\u{1FAFF}]/gu;

export const cleanText = (input: string | null | undefined): string | undefined => {
  if (typeof input !== 'string') return input as undefined;
  return input.replace(EMOJI_REGEX, '');
};

export default cleanText; 