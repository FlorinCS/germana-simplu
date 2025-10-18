import { getSession } from "@/lib/auth/session";
import { db } from "@/lib/db/drizzle";
import { ExerciseResults } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function GET() {
  const session = await getSession();

  if (!session?.user) {
    return new Response("Unauthorized", { status: 401 });
  }

  const userId = session.user.id;

  // Fetch all results for the user
  const results = await db
    .select()
    .from(ExerciseResults)
    .where(eq(ExerciseResults.userId, userId));

  // Convert to a map keyed by exercise_id
  const resultsMap: Record<string, any> = {};
  results.forEach((result) => {
    resultsMap[result.exerciseId] = {
      checked: result.checked,
      id: result.id,
      userId: result.userId,
      exerciseId: result.exerciseId,
    };
  });

  // Return as a map object
  return NextResponse.json(resultsMap);
}
