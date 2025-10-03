import { getSession } from "@/lib/auth/session";
import { db } from "@/lib/db/drizzle";
import { userLessons } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
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

    // Try to update existing row → reset progress
    const updated = await db
      .update(userLessons)
      .set({
        position: 0,
        points: 0,
      })
      .where(and(eq(userLessons.userId, userId), eq(userLessons.lessonId, lessonId)))
      .returning();

    if (updated.length > 0) {
      // Row existed → return updated
      return NextResponse.json({ lesson: updated[0], reset: true });
    }

    // If row didn’t exist yet → insert new one with zero progress
    const inserted = await db
      .insert(userLessons)
      .values({
        lessonId,
        userId,
        position: 0,
        points: 0,
      })
      .returning();

    return NextResponse.json({ lesson: inserted[0], reset: true });
  } catch (err) {
    console.error("Reset Lesson API error:", err);
    return new Response("Internal Server Error", { status: 500 });
  }
}
