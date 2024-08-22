import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

const client = new OpenAI({
    organization: process.env.NEXT_PUBLIC_ORG_ID,
    apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY,
});

export async function POST (req: NextRequest) {
    let completion;
    try {
        completion = await client.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [
                { role: "system", content: "You are a helpful assistant." },
                {
                    role: "user",
                    content: "Write a haiku about recursion in programming.",
                },
            ],
        });
    
        return NextResponse.json(completion.choices[0].message, {status: 200});

    } catch (error) {
        console.log("ERROR", error);
        return NextResponse.json(completion, {status: 500});
    }

}