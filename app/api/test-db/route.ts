import clientPromise from "@/lib/mongodb";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db("mydb");
    await db.command({ ping: 1 });
    return NextResponse.json({ success: true, message: "Connected to MongoDB!" });
  } catch (error: any) {
    console.error("MongoDB connection error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
