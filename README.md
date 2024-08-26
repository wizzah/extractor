- Pull the repo
- Install npm if you don't already have it - https://docs.npmjs.com/downloading-and-installing-node-js-and-npm
- cd into the repo directory and run **npm install**
- Copy **.env.template** into a file called **.env**, then fill out your API keys from chatGPT. Adjust **NEXT_PUBLIC_INTERVAL** and **NEXT_PUBLIC_THROTTLE** as needed for rate limiting, where interval is the frequency of calls in milliseconds and throttle is how many calls allowed at a time. For chatGPT with a small prepaid amount, 3 is the suggested throttle and 60000 (1 minute) is the suggested interval. **NEXT_PUBLIC_AI_CHAR_LIMIT** is the character limit in each request, and if there is a better character limit associated with the account then that number can be raised from 4096.
- Run **npm run build && npm run start** to run the project with the keys. It should create an instance on http://localhost:3000

Extra info:
- This project uses NextJS, React, and chatGPT.
- Other good TODOs would be to add tests, flexibility between which AI services can be used, a flag for rate limiting or not, create an easy way to copy the result JSON (like a button in the corner), track the rate limiting, more error logging

Thought Process:
- For the uploaded files, I'm assuming we always have some kind of demarcation for chunking. For example, the given test file repeats "Chart Notes".
- Normally I would use a store to track displaying chunk progress and errors, but setting up a store would be overkill here.
- Parsing results from chatGPT is imperfect because it will sometimes return extra text around a JSON object.
