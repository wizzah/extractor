import pThrottle from "p-throttle";
import { ChunkData, ExtractedJson } from "../types";
import { INTERVAL, JSON_BATCH_MESSAGE, SUMMARY_MESSAGE, THROTTLE } from "../constants";
import { Dispatch, SetStateAction } from "react";

export async function batchAICalls(inputText: string[], setBatchNumber: Dispatch<SetStateAction<ChunkData | undefined>>, setErrors: React.Dispatch<React.SetStateAction<string[]>>) {
    // list of all queries we will be running to build final JSON
    // The type here comes from the throttled method we're using
    let queryList: Promise<{ role: string; content: string; refusal: null; } | undefined>[] = [];

    // list of JSONs we will be asking the AI to combine
    let jsonList: string[] = [];

    // limit number of concurrent requests, we will limit to 3 here. chatGPT limits us to 3 every 60s
    const throttle = pThrottle({
        limit: THROTTLE,
        interval: INTERVAL
    });

    const throttled = throttle(async (queryString, index) => {
        const response = await fetch(process.env.NEXT_PUBLIC_URL + '/api/ai', {
            method: 'POST',
            body: JSON.stringify({ inputText: JSON_BATCH_MESSAGE + queryString }),
            headers: {
                'Content-Type': 'application/json',
            }
        });

        setBatchNumber(prevState => {
            if (prevState) {
                return { ...prevState, batchNumber: index + 1 }
            }
        });

        return Promise.resolve(response.json());

    });

    // throttle the requests so we aren't instantly rate-limited
    for (var i = 0; i < inputText.length; i++) {
        queryList.push(throttled(inputText[i], i));
    }

    await Promise.all(queryList).then((values) => {
        for (var i = 0; i < values.length; i++) {
            jsonList.push(values[i]!.content);
        }
    }).catch((err) => {
        const errorItem = "Error requesting JSON from AI. ";
        setErrors(prevState => {
            return prevState ? [...prevState, errorItem] : [errorItem];
        });
    })

    return jsonList;
}

export async function buildResultJson(title: string, jsonObjs: string[], setErrors: React.Dispatch<React.SetStateAction<string[]>>) {
    let finalJson: ExtractedJson = {
        title: title,
        entities: [],
        summary: "",
        outline: {}
    }

    let summary = "";

    for (var i = 0; i < jsonObjs.length; i++) {

        const stringed = JSON.stringify(jsonObjs[i]);
        // remove the spacers \n, replace escaped \" with a regular double quote ", and remove triple backticks
        const cleanString = stringed.replace(/\\n/g, "").replace(/\\"/g, '"').replace(/```json/g, "").replace(/```/g, "");
        // remove extra quotes from beginning and end of JSON string
        const superCleanString = cleanString.substring(1, cleanString.length - 1);

        try {
            const parsed = JSON.parse(superCleanString);

            // remove dupes from entities and add them into the final JSON
            for (var j = 0; j < parsed.entities.length; j++) {
                if (!finalJson.entities.includes(parsed.entities[j])) {
                    finalJson.entities.push(parsed.entities[j]);
                }
            }

            const section = "Section " + String(i + 1);
            finalJson.outline[section] = parsed.outline;

            summary += "\n" + parsed.summary;
        } catch (e) {
            // was not able to create a JSON object from AI response, add to error list and do not add this one to the final JSON.
            setErrors(prevState => {
                const err = "Unable to parse response for one of the calls into JSON: " + e;
                return prevState ? [...prevState, err] : [err];
            });
        }
    }

    // fetch final summary
    const response = await fetch(process.env.NEXT_PUBLIC_URL + '/api/ai', {
        method: 'POST',
        body: JSON.stringify({ inputText: SUMMARY_MESSAGE + summary }),
        headers: {
            'Content-Type': 'application/json',
        }
    });

    let completedResponse = await response.json();
    finalJson.summary = completedResponse.content;
    return finalJson;
}
