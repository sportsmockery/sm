// app/api/audio/next/route.ts

import { NextRequest, NextResponse } from "next/server";
import {
  getNextArticle,
  getArticleAudioInfo,
  type NextArticleMode,
} from "@/lib/audioPlayer";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const articleIdParam = searchParams.get("articleId");
  const modeParam = searchParams.get("mode") as NextArticleMode | null;
  const teamParam = searchParams.get("team");

  if (!articleIdParam || !modeParam) {
    return NextResponse.json(
      { error: "Missing articleId or mode" },
      { status: 400 }
    );
  }

  const articleId = Number(articleIdParam);
  if (Number.isNaN(articleId)) {
    return NextResponse.json(
      { error: "articleId must be a number" },
      { status: 400 }
    );
  }

  const mode: NextArticleMode = modeParam === "team" ? "team" : "recent";
  const team = teamParam && teamParam.length > 0 ? teamParam : null;

  const nextArticle = await getNextArticle(articleId, mode, team);
  if (!nextArticle) {
    return NextResponse.json(null, { status: 200 });
  }

  const audioInfo = await getArticleAudioInfo(nextArticle.slug);
  if (!audioInfo) {
    return NextResponse.json(null, { status: 200 });
  }

  return NextResponse.json(
    {
      article: audioInfo.article,
      audioUrl: audioInfo.audioUrl,
    },
    { status: 200 }
  );
}
