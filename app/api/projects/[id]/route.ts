import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";

export async function GET(req: Request, { params }: { params: { id: string } }) {
  try {
    const client = await clientPromise;
    const db = client.db("mydb");

    const project = await db.collection("projects").findOne({ _id: new ObjectId(params.id) });

    if (!project) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    return NextResponse.json({
      id: project._id.toString(),
      name: project.name,
      description: project.description,
      platform: project.platform,
      createdAt: project.createdAt,
      contents: project.contents || []
    });
  } catch (error) {
    console.error("Error fetching project:", error);
    return NextResponse.json({ error: "Failed to fetch project" }, { status: 500 });
  }
}
