import { getSession } from "@/lib/auth/session";
import { db } from "@/lib/db/drizzle";
import { userLessons } from "@/lib/db/schema";
import { eq, and, sql } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const session = await getSession();
    if (!session?.user) {
      return new Response("Unauthorized", { status: 401 });
    }

    const { lessonId } = await req.json();
    const userId = session.user.id;

    if (!lessonId) {
      return new Response("Missing lessonId", { status: 400 });
    }

    // Try to update first
    const updated = await db
      .update(userLessons)
      .set({
        position: sql`${userLessons.position} + 1`,
        points: sql`${userLessons.points} + 100`,
      })
      .where(and(eq(userLessons.userId, userId), eq(userLessons.lessonId, lessonId)))
      .returning();

    if (updated.length > 0) {
      // Row existed → return updated
      return NextResponse.json({ lesson: updated[0] });
    }

    // Row didn't exist → insert new one with position = 0, points = 0
    const inserted = await db
      .insert(userLessons)
      .values({
        lessonId,
        userId,
        position: 0,
        points: 0,
      })
      .returning();

    return NextResponse.json({ lesson: inserted[0] });
  } catch (err) {
    console.error("Lesson API error:", err);
    return new Response("Internal Server Error", { status: 500 });
  }
}
