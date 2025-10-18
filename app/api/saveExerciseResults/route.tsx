import { NextResponse } from "next/server";
import { Pool } from "pg";
import { getSession } from "@/lib/auth/session";

const pool = new Pool({
  connectionString: process.env.POSTGRES_URL,
});

export async function POST(request: Request) {
  try {
    const session = await getSession();

    if (!session?.user) {
      return new Response("Unauthorized", { status: 401 });
    }

    const user_id = session.user.id;
    const body = await request.json();
    const { exerciseId } = body;

    if (!exerciseId) {
      return NextResponse.json({ error: "exerciseId is required" }, { status: 400 });
    }

    // 1️⃣ Check if an entry already exists
    const checkQuery = `
      SELECT * FROM exercise_results 
      WHERE user_id = $1 AND exercise_id = $2;
    `;
    const checkResult = await pool.query(checkQuery, [user_id, exerciseId]);

    if (checkResult.rows.length > 0) {
      return NextResponse.json({
        success: false,
        message: "Exercise result already saved.",
      });
    }

    // 2️⃣ Insert new result
    const insertQuery = `
      INSERT INTO exercise_results (user_id, exercise_id, checked)
      VALUES ($1, $2, 1)
      RETURNING *;
    `;
    const insertResult = await pool.query(insertQuery, [user_id, exerciseId]);

    return NextResponse.json({
      success: true,
      data: insertResult.rows[0],
    });
  } catch (error: any) {
    console.error("Error saving exercise result:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
