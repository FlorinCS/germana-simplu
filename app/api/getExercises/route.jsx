import { NextResponse } from "next/server";
import { MongoClient } from "mongodb";
import { getSession } from "@/lib/auth/session";

export const dynamic = "force-dynamic";

export async function GET(request) {
  const client = new MongoClient(process.env.MONGODB_URI);

  try {
    const session = await getSession();
    if (!session?.user) {
      return new Response("Unauthorized", { status: 401 });
    }

    const url = new URL(request.url);
    const level = url.searchParams.get("level");
    const type = url.searchParams.get("type");

    await client.connect();
    const database = client.db("germana");
    const collection = database.collection("exercises");

    const query = {};

    if (level) query.level = level;
    if (type) query.type = type;

    const items = await collection.find(query).toArray();

    return NextResponse.json(items, {
      headers: {
        "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
        Pragma: "no-cache",
        Expires: "0",
      },
    });
  } catch (error) {
    console.error("Error fetching exercises:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  } finally {
    await client.close();
  }
}
