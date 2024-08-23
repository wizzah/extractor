import pThrottle from "p-throttle";

export async function callAIWithInput(inputText: string, title: string) {
    // chunk by the demarcator
    let queryString = inputText.split(title);

    // remove any empty strings
    queryString = queryString.filter((listItem) => listItem.length > 0);

    // list of all promises we will be running
    let promiseList: any[] = [];

    // list of JSONs we will be asking the AI to combine
    let jsonList: any[] = [];

    // Any issues get added into here
    let errorList: any[] = [];

    console.log("TOTAL CHUNKS", queryString.length);

    // limit number of concurrent requests, we will limit to 3 here. chatGPT limits us to 3 every 60s
    const throttle = pThrottle({
        limit: 3,
        interval: 60000
    });

    const throttled = throttle(async (promise) => {
        let completedPromise = await promise;
        return Promise.resolve(completedPromise.json());
    });

    for (var i = 0; i < 2; i++) {
        // current character limit is 4096
        if (queryString[i].length <= 4096) {
            const request = fetch(process.env.NEXT_PUBLIC_URL + '/api/ai', {
                method: 'POST',
                body: JSON.stringify({ inputText: queryString[i] }),
                headers: {
                    'Content-Type': 'application/json',
                }
            });
        
            promiseList.push(throttled(request));

        } else {
            errorList.push("Character count too high on chunk " + i);
        }
    }

    await Promise.all(promiseList).then((values) => {
        for (var i = 0; i < values.length; i++) {
            jsonList.push(values[i].content);
        }
    }).catch((err) => {
        errorList.push(err);
    })

    return [jsonList, errorList];
}