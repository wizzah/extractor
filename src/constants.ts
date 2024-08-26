export const THROTTLE = parseInt(process.env.NEXT_PUBLIC_THROTTLE!) || 3;
export const INTERVAL = parseInt(process.env.NEXT_PUBLIC_INTERVAL!) || 60000;
// current character limit for chatGPT is 4096
export const AI_CHAR_LIMIT = parseInt(process.env.NEXT_PUBLIC_AI_CHAR_LIMIT!) || 4096;
export const SUMMARY_MESSAGE = "I am going to give you some text that I would like to be summarized. It is a collection of summaries that can be summarized into one paragraph. Please only respond with the summary. Thanks! Here is the text: ";
export const JSON_BATCH_MESSAGE = "I am going to give you some text that I would like to be processed. Summary will be a summary of the text, entities will be a list of personally identifiable information in the text, and outline will be breaking the content into sections. I'd like to receive the data in an object that looks like { 'summary': 'Document summary...', 'entities': ['entity1', 'entity2'], 'outline': ['point 1', 'point 2']}. Please only respond with a JSON object that can be parsed with javascript. Thanks! Here is the text: "
