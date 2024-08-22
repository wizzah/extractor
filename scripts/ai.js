export async function callAIWithInput(inputText) {
    const request = fetch(process.env.NEXT_PUBLIC_URL + '/api/ai', {
        method: 'POST',
        body: JSON.stringify({ inputText }),
        headers: {
            'Content-Type': 'application/json',
        }
    });

    const result = request.then((result) => {
        console.log("REUSLT", result);
    }).catch((err) => {
        console.log("ERR", err);
    })

    console.log("Result", result);
}