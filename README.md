# Setup 👋
Requirements:
- ChatGPT org ID and API key
- npm

## Walkthrough
Install npm if you don't already have it - https://docs.npmjs.com/downloading-and-installing-node-js-and-npm

 ```
cd extractor
npm install
cp .env.template .env
```
- In the env file, fill out your org ID and API key from chatGPT.
- Adjust **NEXT_PUBLIC_INTERVAL** and **NEXT_PUBLIC_THROTTLE** as needed for rate limiting, where interval is the frequency of calls in milliseconds and throttle is how many calls allowed at a time. For chatGPT with a small prepaid amount, 3 is the suggested throttle and 60000 (1 minute) is the suggested interval.
- **NEXT_PUBLIC_AI_CHAR_LIMIT** is the character limit in each request, and if there is a better character limit associated with the account then that number can be raised from 4096.

To start the project:
 ```
npm run build && npm run start
```
This should create an instance on http://localhost:3000

## Application Usage
Select a .txt file to upload by clicking on the "Choose File" button. The file is divided by the demarcator and displays the amount of batches that will be run. Clicking continue will run the batches. The errors panel will display any problems detected through the process.

## Notes
This project uses NextJS, React, and chatGPT.

Assumptions:
- For the uploaded files, I'm assuming we always have some kind of demarcation for chunking. For example, the given test file repeats "Chart Notes".
- I'm assuming the user will have API keys for chatGPT with a few dollars on the account to get the project working.

In a production scenario:
- I would add tests, especially around rate limiting and throttling. I would add flexibility between which AI services can be used, a flag for rate limiting or not, create an easy way to copy the result JSON (like a button in the corner), track the rate limiting, and more error logging around the request responses.
- Normally I would use a store to track displaying chunk progress and errors, but setting up a store would be overkill here.
- Parsing results from chatGPT is imperfect because it will sometimes return extra text around a JSON object. In cases like this, the prompt can be adjusted to encourage chatGPT to return more pure results.