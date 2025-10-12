// /api/getLessons/route.ts
import { NextResponse } from "next/server";
import { MongoClient } from "mongodb";
import { getSession } from "@/lib/auth/session";

export const dynamic = "force-dynamic";

export async function GET() {
  const client = new MongoClient(process.env.MONGODB_URI);

  try {
    const session = await getSession();
    if (!session?.user) {
      return new Response("Unauthorized", { status: 401 });
    }

    await client.connect();
    const database = client.db("germana");
    const collection = database.collection("telc-exams");

    // ✅ No prefix filtering — fetch ALL exams
    const exams = await collection.find({}).toArray();

    // Optional: add numeric index to each exam if needed
    const indexedExams = exams.map((exam, index) => ({
      index: index + 1,
      ...exam,
    }));

    return NextResponse.json(indexedExams, {
      headers: {
        "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
        Pragma: "no-cache",
        Expires: "0",
      },
    });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  } finally {
    await client.close();
  }
}
