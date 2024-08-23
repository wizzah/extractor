import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

const client = new OpenAI({
    organization: process.env.NEXT_PUBLIC_ORG_ID,
    apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY,
});

export async function POST (req: NextRequest) {
    const data = await req.json();
    console.log("REQ", data);
    let completion;
    try {
        completion = await client.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [
                { role: "system", content: "You are a helpful assistant." },
                {
                    role: "user",
                    content: "I am going to give you some text that I would like to be processed. Summary will be a summary of the text, entities will be a list of personally identifiable information in the text, and outline will be breaking the content into sections. I'd like to receive the data in an object that looks like { 'summary': 'Document summary...', 'entities': ['entity1', 'entity2'], 'outline': {'section 1': ['point 1', 'point 2'], 'section 2': ['point 1', 'point 2']}}. Thanks! Here is the text: " + data.inputText,
                },
            ],
        });
    
        return NextResponse.json(completion.choices[0].message, {status: 200});

    } catch (error) {
        console.log("ERROR", error);
        return NextResponse.json(completion, {status: 500});
    }

}