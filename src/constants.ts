export const THROTTLE = parseInt(process.env.NEXT_PUBLIC_THROTTLE!) || 3;
export const INTERVAL = parseInt(process.env.NEXT_PUBLIC_INTERVAL!) || 60000;
// current character limit for chatGPT is 4096
export const AI_CHAR_LIMIT = parseInt(process.env.NEXT_PUBLIC_AI_CHAR_LIMIT!) || 4096;