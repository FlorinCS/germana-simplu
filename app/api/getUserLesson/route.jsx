import { getSession } from "@/lib/auth/session";
import { db } from "@/lib/db/drizzle";
import { userLessons } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function GET(req) {
  try {
    const session = await getSession();
    if (!session?.user) {
      return new Response("Unauthorized", { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const lessonId = searchParams.get("lessonId"); // <-- from query string
    const userId = session.user.id;

    if (!lessonId) {
      return new Response("Missing lessonId", { status: 400 });
    }

    const lesson = await db
      .select()
      .from(userLessons)
      .where(
        and(eq(userLessons.userId, userId), eq(userLessons.lessonId, lessonId))
      )
      .limit(1);

    return NextResponse.json({ lesson: lesson[0] ?? null });
  } catch (err) {
    console.error("Lesson API error:", err);
    return new Response("Internal Server Error", { status: 500 });
  }
}
