import pThrottle from "p-throttle";
import { ExtractedJson } from "../types";

export async function batchAICalls(inputText: string[]) {
    // list of all queries we will be running to build final JSON
    let queryList: any[] = [];

    // list of JSONs we will be asking the AI to combine
    let jsonList: any[] = [];

    // Any issues get added into here
    let errorList: any[] = [];

    // limit number of concurrent requests, we will limit to 3 here. chatGPT limits us to 3 every 60s
    const throttle = pThrottle({
        limit: 3,
        interval: 60000
    });

    const throttled = throttle(async (queryString) => {
        // rate limited, so use dummy data for now
        const response = await fetch(process.env.NEXT_PUBLIC_URL + '/api/ai', {
            method: 'POST',
            body: JSON.stringify({ inputText: jsonBatchMessage + queryString }),
            headers: {
                'Content-Type': 'application/json',
            }
        });

        return Promise.resolve(response.json());
        // return Promise.resolve(exampleResponse);
    });

    // throttle the requests so we aren't instantly rate-limited
    for (var i = 0; i < 5; i++) {
        queryList.push(throttled(inputText[i]));
    }

    await Promise.all(queryList).then((values) => {
        for (var i = 0; i < values.length; i++) {
            jsonList.push(values[i].content);
        }
    }).catch((err) => {
        errorList.push(err);
    })

    return [jsonList, errorList];
}

export async function buildResultJson(title: string, jsonObjs: ExtractedJson[]) {
    let finalJson: ExtractedJson = {
        title: title,
        entities: [],
        summary: "",
        outline: {}
    }

    let summary = "";

    for (var i = 0; i < jsonObjs.length; i++) {

        let stringed = JSON.stringify(jsonObjs[i]);
        // remove the spacers \n, replace escaped \" with a regular double quote ", and remove triple backticks
        let cleanString = stringed.replace(/\\n/g, "").replace(/\\"/g, '"').replace(/```json/g, "").replace(/```/g, "");
        // remove extra quotes from beginning and end of JSON string
        let superCleanString = cleanString.substring(1, cleanString.length - 1);

        let parsed = JSON.parse(superCleanString);

        // remove dupes from entities and add them into the final JSON
        for (var j = 0; j < parsed.entities.length; j++) {
            if (!finalJson.entities.includes(parsed.entities[j])) {
                finalJson.entities.push(parsed.entities[j]);
            } else {
                console.log("found dupe");
            }
        }

        const section = "Section " + String(i + 1);
        finalJson.outline[section] = parsed.outline;

        summary += "\n" + parsed.summary;
    }

    const response = await fetch(process.env.NEXT_PUBLIC_URL + '/api/ai', {
        method: 'POST',
        body: JSON.stringify({ inputText: summaryMessage + summary }),
        headers: {
            'Content-Type': 'application/json',
        }
    });

    let completedResponse = await response.json();
    finalJson.summary = completedResponse.content;
    return finalJson;
}

const jsonBatchMessage = "I am going to give you some text that I would like to be processed. Summary will be a summary of the text, entities will be a list of personally identifiable information in the text, and outline will be breaking the content into sections. I'd like to receive the data in an object that looks like { 'summary': 'Document summary...', 'entities': ['entity1', 'entity2'], 'outline': ['point 1', 'point 2']}. Thanks! Here is the text: "
const summaryMessage = "I am going to give you some text that I would like to be summarized. It is a collection of summaries that can be summarized into one paragraph. Please only respond with the summary. Thanks! Here is the text: ";

const exampleResponseOne = {
    "role": "assistant",
    "content": "{\n  \"summary\": \"This document includes personal and medical information about a patient named Jane Doe. It outlines her contact information, diagnosis codes related to injuries and conditions, and details about her provider and insurance. The diagnoses indicate various injuries and conditions stemming from a car collision and associated complications.\",\n  \"entities\": [\n    \"Jane Doe\",\n    \"(912) 480-1800\",\n    \"(912) 480-1900\",\n    \"Doe, Jane\",\n    \"103254\",\n    \"02/02/1878\",\n    \"John Carter, DC\",\n    \"12/21/2020\"\n  ],\n  \"outline\": {\n    \"Patient Information\": [\n      \"Address: 3800 West Slaughter Lane, Austin, TX 78000\",\n      \"Name: Jane Doe\",\n      \"Phone: (912) 480-1800\",\n      \"Fax: (912) 480-1900\",\n      \"Patient Account Number: 103254\",\n      \"Date of Birth: 02/02/1878\"\n    ],\n    \"Insurance Details\": [\n      \"Insurance Company: [Not provided]\",\n      \"Policy Number: [Not provided]\",\n      \"Insured ID: [Not provided]\"\n    ],\n    \"Provider Information\": [\n      \"Date: 12/21/2020\",\n      \"Provider: John Carter, DC - Anytown\"\n    ],\n    \"Diagnosis Codes\": [\n      \"V89.2XXA: Car driver injured in collision\",\n      \"G47.8: Difficulty Sleeping (Post-Traumatic)\",\n      \"G44.319: Acute post-traumatic headache, not intractable\",\n      \"S00.00XA: Superficial Injury to Head (whiplash, headrest)\",\n      \"M54.12: Radiculopathy, cervical reg\",\n      \"M50.121: Cervical disc disorder at C4-C5 level with radiculopathy\",\n      \"M50.122: Cervical disc disorder at C5-C6 level with radiculopathy\",\n      \"M50.123: Cervical disc disorder at C6-C7 level with radiculopathy\",\n      \"S13.4XXA: Sprain of ligaments of cervical spine, initial encounter\",\n      \"S16.1XXA: Strain of muscle, fascia and tendon at neck level, init\",\n      \"S23.3XXA: Sprain of ligaments of thoracic spine, initial encounter\",\n      \"S29.012S: Strain of muscle and tendon of back wall of thorax, sequela\",\n      \"M54.14: Radiculopathy, thoracic reg\",\n      \"M54.6: Pain in thoracic spine\",\n      \"M62.830: Muscle spasm of back\",\n      \"S33.5XXA: Sprain of ligaments of lumbar spine, initial encounter\",\n      \"S39.012A: Strain of lower back\",\n      \"M54.17: Radiculopathy, lumbosacral reg\",\n      \"M54.41: Lumbago w/ sciatica, RT side\",\n      \"M79.2: Neuralgia and neuritis, unspecified\",\n      \"M60.9: Myositis, unspecified\",\n      \"M25.611: Stiffness of RT shoulder, NEC\",\n      \"M25.511: Pain in RT shoulder\",\n      \"S43.401A: unspec. sprain of RT shoulder joint\",\n      \"M25.552: Pain in left hip\",\n      \"M25.551: Pain in right hip\",\n      \"R07.9: Chest Pain\"\n    ],\n    \"Additional Information\": [\n      \"Printed: Wednesday, March 31, 2021 9:35:03 AM\"\n    ]\n  }\n}",
    "refusal": null
};

const exampleResponseTwo = {
    "role": "assistant",
    "content": "{\n  \"summary\": \"The document outlines a treatment plan for a patient named Jane Doe, including a detailed schedule across three phases of care aimed at addressing acute inflammatory stages through various therapeutic interventions. Key goals include decreasing swelling, pain reduction, and improving range of motion through chiropractic adjustments and electrical stimulation. The document includes personal information and clinic details as well.\",\n  \"entities\": [\n    \"Jane Doe\",\n    \"(912) 480-1800\",\n    \"(912) 480-1900\",\n    \"Doe, Jane\",\n    \"Acct #: 103254\",\n    \"DOB: 02/02/1878\",\n    \"John Carter, DC\",\n    \"12/21/2020\",\n    \"3800 West Slaughter Lane, Austin, TX 78000\"\n  ],\n  \"outline\": {\n    \"Introduction\": [\n      \"Patient information\",\n      \"Provider information\",\n      \"Date of document\"\n    ],\n    \"Treatment Plan\": [\n      \"Phase 1: schedule and goals\",\n      \"Phase 2: schedule\",\n      \"Phase 3: schedule\"\n    ],\n    \"Phase 1 Details\": [\n      \"Symptoms in acute inflammatory stage\",\n      \"Chiropractic treatment frequency\",\n      \"Goals of Phase 1\"\n    ],\n    \"Therapeutic Interventions\": [\n      \"Spinal adjustments specifics\",\n      \"Electrical stimulation details\",\n      \"Moist heat application\",\n      \"Training for home exercises\"\n    ],\n    \"Additional Information\": [\n      \"Document print date\"\n    ]\n  }\n}",
    "refusal": null
}

const exampleResponseThree = {
    "role": "assistant",
    "content": "{\n  \"summary\": \"The document details a medical treatment record for a patient named Jane Doe, including personal information, the date of service, and specific therapeutic procedures performed to address spinal and joint functionality, pain, and mobility through various methods such as spinal adjustments, electrical stimulation, moist heat application, mechanical traction, and therapeutic exercise rehabilitation.\",\n  \"entities\": [\n    \"Jane Doe\",\n    \"3800 West Slaughter Lane, Austin, TX 78000\",\n    \"(912) 480-1800\",\n    \"(912) 480-1900\",\n    \"Doe, Jane\",\n    \"Acct #: 103254\",\n    \"DOB: 02/02/1878\",\n    \"John Carter, DC\"\n  ],\n  \"outline\": {\n    \"Patient Information\": [\n      \"Name: Jane Doe\",\n      \"Address: 3800 West Slaughter Lane, Austin, TX 78000\",\n      \"Phone: (912) 480-1800\",\n      \"Fax: (912) 480-1900\",\n      \"Patient Account Number: 103254\",\n      \"Date of Birth: 02/02/1878\"\n    ],\n    \"Date of Service\": [\n      \"Date: 12/22/2020\"\n    ],\n    \"Provider Information\": [\n      \"Provider: John Carter, DC - Anytown\"\n    ],\n    \"Treatment Procedures\": [\n      \"Specific spinal adjustments on 3 to 4 regions\",\n      \"Right shoulder adjustment for range of motion\",\n      \"Bilateral hip adjustment for range of motion\",\n      \"Electrical stimulation applied for pain relief and healing\",\n      \"Moist heat application to relax musculature\",\n      \"Mechanical traction for mobility and decompression\",\n      \"One-on-one therapeutic exercise rehabilitation therapy\"\n    ],\n    \"Printed Information\": [\n      \"Printed on: Wednesday, March 31, 2021 9:35:04 AM\"\n    ]\n  }\n}",
    "refusal": null
}

const exampleResponse = {
    "role": "assistant",
    "content": "```json\n{\n  \"summary\": \"This document contains patient information, including personal details, insurance information, and a diagnosis summary related to injuries sustained in a collision. It lists various medical codes reflecting the patient's conditions and treatments.\",\n  \"entities\": [\n    \"Jane Doe\",\n    \"(912) 480-1800\",\n    \"103254\",\n    \"02/02/1878\",\n    \"John Carter, DC\",\n    \"Amitytown\",\n    \"12/22/2020\"\n  ],\n  \"outline\": {\n    \"Patient Information\": [\n      \"Name: Jane Doe\",\n      \"Phone: (912) 480-1800\",\n      \"Fax: (912) 480-1900\",\n      \"Account Number: 103254\",\n      \"Date of Birth: 02/02/1878\"\n    ],\n    \"Incident Details\": [\n      \"Date of Incident: 12/22/2020\",\n      \"Provider: John Carter, DC - Anytown\"\n    ],\n    \"Diagnosis Codes\": [\n      \"V89.2XXA: Car driver injured in collision\",\n      \"G47.8: Difficulty Sleeping (Post-Traumatic)\",\n      \"G44.319: Acute post-traumatic headache, not intractable\",\n      \"S00.00XA: Superficial Injury to Head (whiplash, headrest)\",\n      \"M54.12: Radiculopathy, cervical reg\",\n      \"M50.121: Cervical disc disorder at C4-C5 level with radiculopathy\",\n      \"M50.122: Cervical disc disorder at C5-C6 level with radiculopathy\",\n      \"M50.123: Cervical disc disorder at C6-C7 level with radiculopathy\",\n      \"S13.4XXA: Sprain of ligaments of cervical spine, initial encounter\",\n      \"S16.1XXA: Strain of muscle, fascia and tendon at neck level, initial\",\n      \"S23.3XXA: Sprain of ligaments of thoracic spine, initial encounter\",\n      \"S29.012S: Strain of muscle and tendon of back wall of thorax, sequela\",\n      \"M54.14: Radiculopathy, thoracic reg\",\n      \"M54.6: Pain in thoracic spine\",\n      \"M62.830: Muscle spasm of back\",\n      \"S33.5XXA: Sprain of ligaments of lumbar spine, initial encounter\",\n      \"S39.012A: Strain of lower back\",\n      \"M54.17: Radiculopathy, lumbosacral reg\",\n      \"M54.41: Lumbago w/ sciatica, RT side\",\n      \"M79.2: Neuralgia and neuritis, unspecified\",\n      \"M60.9: Myositis, unspecified\",\n      \"M25.611: Stiffness of RT shoulder, NEC\",\n      \"M25.511: Pain in RT shoulder\",\n      \"S43.401A: unspec. sprain of RT shoulder joint\",\n      \"M25.552: Pain in left hip\",\n      \"M25.551: Pain in right hip\",\n      \"R07.9: Chest Pain\"\n    ],\n    \"Printed At\": [\n      \"Wednesday, March 31, 2021 9:35:04 AM\"\n    ]\n  }\n}\n```",
    "refusal": null
}
function getExampleResponse() {
    const rng = Math.floor(Math.random() * 2);

    switch(rng) {
        case 0:
            return exampleResponseOne;
        case 1:
            return exampleResponseTwo;
        case 2:
            return exampleResponseThree;
        // case 3:
        //     return exampleResponseFour;
    }
}