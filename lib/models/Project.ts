import mongoose, { Schema, models, model, Document } from "mongoose";

export interface Content {
  id: string;
  publishDate: Date;
  contentType?: string;
  copy?: string;
  status?: string;
  linkToAsset?: string;
  linkToPublishedPost?: string;
}

export interface Project extends Document {
  name: string;
  description?: string;
  platform?: string;
  createdAt: Date;
  contents: Content[];
}

const ContentSchema = new Schema<Content>({
  id: { type: String, required: true },
  publishDate: { type: Date, required: true },
  contentType: { type: String },
  copy: { type: String },
  status: { type: String },
  linkToAsset: { type: String },
  linkToPublishedPost: { type: String },
});

const ProjectSchema = new Schema<Project>({
  name: { type: String, required: true },
  description: { type: String },
  platform: { type: String },
  createdAt: { type: Date, default: Date.now },
  contents: { type: [ContentSchema], default: [] },
});

export const Project =
  models.Project || model<Project>("Project", ProjectSchema);
