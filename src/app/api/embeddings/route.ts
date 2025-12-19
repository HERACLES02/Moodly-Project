import { NextRequest, NextResponse } from "next/server"
import { pipeline } from "@xenova/transformers"

// ✅ OPTIMIZATION: Cache the model at module level (loads once, reused forever)
let modelInstance: any = null
let loadingPromise: Promise<any> | null = null

async function getModel() {
  if (modelInstance) return modelInstance

  if (!loadingPromise) {
    loadingPromise = (async () => {
      console.log("🤖 Loading embedding model on server...")
      const pipe = await pipeline(
        "feature-extraction",
        "Xenova/all-MiniLM-L6-v2",
      )
      modelInstance = pipe
      console.log("✅ Model loaded and cached")
      return pipe
    })()
  }

  return loadingPromise
}

// ✅ OPTIMIZATION: Pre-compute mood embeddings (never change, compute once)
const MOOD_EMBEDDINGS: Record<string, Float32Array | null> = {
  sad: null,
  happy: null,
  anxious: null,
  calm: null,
  energetic: null,
  excited: null,
  tired: null,
  grateful: null,
}

const MOOD_INTENTS: Record<string, string> = {
  sad: "sad melancholy heartbreak sorrow grief emotional reflective cinema",
  happy: "happy upbeat energetic positive cheerful feel-good comedy",
  anxious: "calming soothing reassuring grounded peaceful cinema",
  calm: "calm peaceful relaxed serene gentle cinema",
  energetic: "energetic high energy intense action adventure exciting",
  excited: "excited celebratory party fun thrilling adventurous",
  tired: "gentle soft relaxing unwind cozy slow cinema",
  grateful: "grateful thankful warm heartfelt inspiring wholesome",
}

async function getMoodEmbedding(mood: string): Promise<Float32Array> {
  const key = mood.toLowerCase()

  // Return cached if available
  if (MOOD_EMBEDDINGS[key]) return MOOD_EMBEDDINGS[key]!

  const pipe = await getModel()
  const text = MOOD_INTENTS[key] || "balanced contemporary popular cinema"
  const out = await pipe(text, { pooling: "mean", normalize: true })
  const vec = Float32Array.from((out?.data ?? out?.[0]) as number[])

  // Cache it
  MOOD_EMBEDDINGS[key] = vec
  return vec
}

/**
 * POST /api/embeddings
 * Generate embeddings for text (movies/songs)
 *
 * Body: {
 *   texts: string[],        // Array of text to embed
 *   mood?: string,          // Optional mood for similarity
 *   queryText?: string      // Optional query text for search
 * }
 *
 * Returns: {
 *   embeddings: number[][],
 *   moodEmbedding?: number[],
 *   queryEmbedding?: number[]
 * }
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { texts, mood, queryText } = body

    if (!Array.isArray(texts) || texts.length === 0) {
      return NextResponse.json(
        { error: "texts array is required" },
        { status: 400 },
      )
    }

    const pipe = await getModel()

    // Generate embeddings for all texts (batch processing)
    const embeddings: number[][] = []
    for (const text of texts) {
      const out = await pipe(text, { pooling: "mean", normalize: true })
      const vec = Array.from((out?.data ?? out?.[0]) as Float32Array)
      embeddings.push(vec)
    }

    // Get mood embedding if requested
    let moodEmbedding: number[] | undefined
    if (mood) {
      const vec = await getMoodEmbedding(mood)
      moodEmbedding = Array.from(vec)
    }

    // Get query embedding if requested
    let queryEmbedding: number[] | undefined
    if (queryText) {
      const out = await pipe(queryText, { pooling: "mean", normalize: true })
      queryEmbedding = Array.from((out?.data ?? out?.[0]) as Float32Array)
    }

    return NextResponse.json(
      {
        embeddings,
        moodEmbedding,
        queryEmbedding,
      },
      {
        headers: {
          // ✅ Cache embeddings for 1 hour (same text = same embedding)
          "Cache-Control": "public, max-age=3600, stale-while-revalidate=7200",
        },
      },
    )
  } catch (error) {
    console.error("❌ Embedding generation error:", error)
    return NextResponse.json(
      { error: "Failed to generate embeddings" },
      { status: 500 },
    )
  }
}
