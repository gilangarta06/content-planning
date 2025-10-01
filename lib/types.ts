export interface Project {
  id: string;
  name: string;
  description?: string;
  platform: 'Instagram' | 'TikTok' | 'Facebook';
  createdAt: Date;
  contents: Content[];
}

export interface Content {
  id: string;
  publishDate: Date;
  contentType: 'Post' | 'Story' | 'Reel' | 'Video' | 'Other';
  copy: string;
  status: 'Draft' | 'In Progress' | 'Scheduled' | 'Published';
  linkToAsset?: string;
  linkToPublishedPost?: string;
}

export type Platform = 'Instagram' | 'TikTok' | 'Facebook' | 'All';

export interface AppState {
  projects: Project[];
  selectedProjectId: string | null;
  selectedPlatform: Platform;
}