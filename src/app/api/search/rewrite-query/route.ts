import { NextResponse } from 'next/server'

const HF_API_URL =
  "https://router.huggingface.co/hf-inference/models/mistralai/Mistral-7B-Instruct-v0.3"







export async function POST(req: Request) {
  try {
    const { query, mood } = await req.json()

    if (!query || typeof query !== 'string') {
      return NextResponse.json(
        { error: 'Missing or invalid query', main: '', alternatives: [] },
        { status: 400 }
      )
    }

   const apiKey = process.env.HUGGING_FACE_API_KEY

console.log('HF key prefix:', apiKey?.slice(0, 10)) // TEMP: debug

if (!apiKey) {
  console.error('HUGGING_FACE_API_KEY is not set')
  return NextResponse.json({ main: query, alternatives: [] })
}

    const moodText = typeof mood === 'string' ? mood : 'neutral'

    const prompt = `
You rewrite movie search queries.

Given:
- mood: "${moodText}"
- user_query: "${query}"

Task:
1. Rewrite user_query into a short, clear search query that is good for finding movies.
2. Propose up to 3 short alternative phrasings.
3. Focus on genres, themes, tone, and pacing.
4. Do NOT invent movie titles.
5. Answer ONLY with valid JSON in this shape:

{
  "main": "rewritten search query",
  "alternatives": [
    "alt phrasing 1",
    "alt phrasing 2"
  ]
}
`.trim()

    const hfResponse = await fetch(HF_API_URL, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        inputs: prompt,
        parameters: {
          max_new_tokens: 200,
          temperature: 0.4,
        },
      }),
    })

    if (!hfResponse.ok) {
      console.error(
        'HF rewrite-query error:',
        hfResponse.status,
        await hfResponse.text()
      )
      return NextResponse.json({ main: query, alternatives: [] })
    }

    const result = await hfResponse.json()

    const generatedText: string | undefined =
      Array.isArray(result) && result[0]?.generated_text
        ? result[0].generated_text
        : typeof result === 'string'
        ? result
        : ''

    let jsonPart = generatedText || ''

    const firstBrace = jsonPart.indexOf('{')
    const lastBrace = jsonPart.lastIndexOf('}')
    if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
      jsonPart = jsonPart.slice(firstBrace, lastBrace + 1)
    }

    let parsed: { main?: string; alternatives?: string[] } = {}
    try {
      parsed = JSON.parse(jsonPart)
    } catch (err) {
      console.error('Failed to parse HF JSON:', err, 'raw:', jsonPart)
      return NextResponse.json({ main: query, alternatives: [] })
    }

    const main = (parsed.main || query).trim()
    const alternatives = Array.isArray(parsed.alternatives)
      ? parsed.alternatives.filter(
          (s) => typeof s === 'string' && s.trim().length > 0
        )
      : []

    return NextResponse.json({ main, alternatives })
  } catch (err) {
    console.error('rewrite-query API error:', err)
    return NextResponse.json(
      { main: '', alternatives: [], error: 'HF rewrite failed' },
      { status: 500 }
    )
  }
}
