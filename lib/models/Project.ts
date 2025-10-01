import mongoose, { Schema, models, model } from "mongoose";

const ContentSchema = new Schema({
  id: { type: String, required: true },
  publishDate: { type: Date, required: true },
  contentType: { type: String },
  copy: { type: String },
  status: { type: String },
  linkToAsset: { type: String },
  linkToPublishedPost: { type: String },
});

const ProjectSchema = new Schema({
  name: { type: String, required: true },
  description: String,
  platform: String,
  createdAt: { type: Date, default: Date.now },
  contents: [ContentSchema],
});

export const Project = models.Project || model("Project", ProjectSchema);
