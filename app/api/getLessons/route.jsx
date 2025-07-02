// /api/getLessons/route.ts
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

    const { searchParams } = new URL(request.url);
    const idPrefix = searchParams.get("idPrefix"); // e.g., "A1", "A2", "B1"

    await client.connect();
    const database = client.db("germana");
    const collection = database.collection("lessons");

    const filter = idPrefix ? { id: { $regex: `^${idPrefix}-` } } : {};
    const items = await collection.find(filter).toArray();

    return NextResponse.json(items, {
      headers: {
        "Cache-Control":
          "no-store, no-cache, must-revalidate, proxy-revalidate",
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
