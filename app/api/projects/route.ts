import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";

// ❗ Memberitahu Next.js bahwa route ini harus dijalankan secara runtime
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db("mydb");

    const projects = await db.collection("projects").find().toArray();

    return NextResponse.json(
      projects.map((p) => ({
        id: p._id.toString(),
        name: p.name,
        description: p.description,
        platform: p.platform,
        createdAt: p.createdAt,
        contents: p.contents || [],
      }))
    );
  } catch (error) {
    console.error("GET /api/projects error:", error);
    return NextResponse.json({ error: "Failed to fetch projects" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();

    if (!body.name || !body.platform) {
      return NextResponse.json(
        { error: "Name and platform are required" },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db("mydb");

    const newProject = {
      name: body.name,
      description: body.description || "",
      platform: body.platform,
      contents: body.contents || [],
      createdAt: new Date(),
    };

    const result = await db.collection("projects").insertOne(newProject);

    return NextResponse.json({
      id: result.insertedId.toString(),
      ...newProject,
    });
  } catch (error) {
    console.error("POST /api/projects error:", error);
    return NextResponse.json({ error: "Failed to create project" }, { status: 500 });
  }
}
