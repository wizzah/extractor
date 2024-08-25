- Pull the repo
- cd into the repo directory and run npm install
- Copy .env.template into a file called .env, then fill out your API keys from chatGPT. Adjust NEXT_PUBLIC_INTERVAL and NEXT_PUBLIC_THROTTLE as needed for rate limiting, where interval is the frequency of calls in milliseconds and throttle is how many calls allowed at a time. For chatGPT with a small prepaid amount, 3 is the suggested throttle and 60000 (1 minute) is the suggested interval. NEXT_PUBLIC_AI_CHAR_LIMIT is the character limit in each request, and if there is a better character limit associated with the account then that number can be raised from 4096.
- npm run build && npm run start to run the project with the keys

Extra info:
- This project uses NextJS and Vercel
- Other good TODOs would be to add tests, flexibility between which AI services can be used, a flag for rate limiting or not, create an easy way to copy the result JSON, track the rate limiting

Thought Process:
- For the uploaded files, I'm assuming we always have some kind of demarcation for chunking. For example, the given test file repeats "Chart Notes".
- Normally I would use a store to track displaying chunk progress and errors, but setting up a store would be overkill here.