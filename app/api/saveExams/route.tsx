import { NextResponse } from "next/server";
import { Pool } from "pg";
import { getSession } from "@/lib/auth/session";

// Configure the PostgreSQL connection
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

    const {score, answers } = body;

    // Validate required fields
    if (!user_id || typeof score !== "number" || !Array.isArray(answers)) {
      return NextResponse.json(
        { error: "Missing or invalid fields." },
        { status: 400 }
      );
    }

    const query = `
      INSERT INTO mock_exam_results 
        (user_id, score, answers)
      VALUES ($1, $2, $3)
      RETURNING *;
    `;

    const values = [user_id, score, JSON.stringify(answers)];

    const result = await pool.query(query, values);

    return NextResponse.json({ success: true, data: result.rows[0] });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
