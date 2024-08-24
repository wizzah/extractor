- Pull the repo
- cd into the repo directory and run npm install
- Copy .env.template into a file called .env, then fill out your API keys from chatGPT
- npm run build && npm run start to run the project with the keys

Extra info:
- This project uses NextJS and Vercel
- Other TODOs would be to add tests, flexibility between which AI services can be used, a flag for rate limiting or not, create an easy way to copy the result JSON, track the rate limiting

Thought Process:
- For files, I'm assuming we always have some kind of demarcation for chunking. For example, the given test file repeats "Chart Notes".
- Normally I would use a store to track displaying chunk progress and errors, but setting up a store would be overkill here.