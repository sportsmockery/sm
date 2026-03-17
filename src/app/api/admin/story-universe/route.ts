import { NextRequest, NextResponse } from "next/server"
import { requireAdmin } from "@/lib/admin-auth"
import {
  getStoryUniverseCandidates,
  isStoryUniverseDetected,
} from "@/lib/story-universe-detection"

/**
 * GET /api/admin/story-universe?postId=X&categoryId=Y&title=Z&tags=a,b,c
 *
 * Returns ranked Story Universe candidates for the given post context.
 */
export async function GET(request: NextRequest) {
  try {
    const auth = await requireAdmin(request)
    if (auth.error) {
      return NextResponse.json({ error: auth.error }, { status: auth.status })
    }

    const { searchParams } = new URL(request.url)
    const postId = searchParams.get("postId") || "0"
    const categoryId = searchParams.get("categoryId") || null
    const title = searchParams.get("title") || ""
    const tagsParam = searchParams.get("tags") || ""
    const tags = tagsParam ? tagsParam.split(",").filter(Boolean) : []

    const candidates = await getStoryUniverseCandidates(
      postId,
      categoryId,
      title,
      tags
    )

    return NextResponse.json({
      candidates,
      detected: isStoryUniverseDetected(candidates),
    })
  } catch (error) {
    console.error("Error in GET /api/admin/story-universe:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
