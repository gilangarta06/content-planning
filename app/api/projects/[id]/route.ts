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

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  try {
    const body = await req.json();

    const client = await clientPromise;
    const db = client.db("mydb");

    const project = await db.collection("projects").findOne({ _id: new ObjectId(params.id) });
    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    if (body.action === "addContent") {
      const newContent = { ...body.content, id: new ObjectId().toString() };

      await db.collection("projects").updateOne(
        { _id: new ObjectId(params.id) },
        { $push: { contents: newContent } }
      );

      return NextResponse.json({ success: true, content: newContent });
    }

    if (body.action === "updateContent") {
      await db.collection("projects").updateOne(
        { _id: new ObjectId(params.id), "contents.id": body.contentId },
        {
          $set: Object.fromEntries(
            Object.entries(body.updates).map(([k, v]) => [`contents.$.${k}`, v])
          )
        }
      );

      return NextResponse.json({ success: true });
    }

    if (body.action === "deleteContent") {
      await db.collection("projects").updateOne(
        { _id: new ObjectId(params.id) },
        { $pull: { contents: { id: body.contentId } } }
      );

      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error) {
    console.error("Error updating project:", error);
    return NextResponse.json({ error: "Failed to update project" }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  try {
    const client = await clientPromise;
    const db = client.db("mydb");

    const result = await db.collection("projects").deleteOne({ _id: new ObjectId(params.id) });

    if (result.deletedCount === 0) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting project:", error);
    return NextResponse.json({ error: "Failed to delete project" }, { status: 500 });
  }
}
