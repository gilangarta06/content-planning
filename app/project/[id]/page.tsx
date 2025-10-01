'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Project } from '@/lib/types';
import { format } from 'date-fns';
import { ExternalLink, Calendar } from 'lucide-react';
import Link from 'next/link';

export default function ProjectClientView() {
  const params = useParams();
  const [project, setProject] = useState<Project | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchProject() {
      try {
        if (!params.id) return;
        const res = await fetch(`/api/projects/${params.id}`);
        if (res.ok) {
          const data = await res.json();
          setProject(data);
        } else {
          setProject(null);
        }
      } catch (err) {
        console.error('Failed to fetch project', err);
        setProject(null);
      } finally {
        setIsLoading(false);
      }
    }

    fetchProject();
  }, [params.id]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Draft':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
      case 'In Progress':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'Scheduled':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'Published':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPlatformColor = (platform: string) => {
    switch (platform) {
      case 'Instagram':
        return 'bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200';
      case 'TikTok':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
      case 'Facebook':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading project...</p>
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="text-center py-12">
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-8 h-8 text-muted-foreground"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
            </div>
            <h2 className="text-xl font-semibold mb-2">Project Not Found</h2>
            <p className="text-muted-foreground mb-6">
              The project you're looking for doesn't exist or may have been deleted.
            </p>
            <Link
              href="/"
              className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2"
            >
              Back to Dashboard
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  const sortedContents = project.contents
    ? project.contents.sort(
        (a, b) =>
          new Date(a.publishDate).getTime() - new Date(b.publishDate).getTime()
      )
    : [];

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-6 max-w-6xl">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-3xl font-bold">{project.name}</h1>
            <Badge className={getPlatformColor(project.platform)}>
              {project.platform}
            </Badge>
          </div>
          {project.description && (
            <p className="text-muted-foreground text-lg">{project.description}</p>
          )}
          <div className="flex items-center gap-4 mt-4 text-sm text-muted-foreground">
            <span>
              Created: {format(new Date(project.createdAt), 'MMM dd, yyyy')}
            </span>
            <span>•</span>
            <span>
              {project.contents?.length || 0} content item
              {project.contents && project.contents.length !== 1 ? 's' : ''}
            </span>
          </div>
        </div>

        {/* Content Table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Content Schedule
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Publish Date</TableHead>
                    <TableHead>Content Type</TableHead>
                    <TableHead className="max-w-xs">Copy</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Asset Link</TableHead>
                    <TableHead>Published Link</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sortedContents.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={6}
                        className="text-center py-12 text-muted-foreground"
                      >
                        No content scheduled for this project yet.
                      </TableCell>
                    </TableRow>
                  ) : (
                    sortedContents.map((content) => (
                      <TableRow key={content.id}>
                        <TableCell className="font-medium">
                          {format(
                            new Date(content.publishDate),
                            'MMM dd, yyyy'
                          )}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{content.contentType}</Badge>
                        </TableCell>
                        <TableCell className="max-w-xs">
                          <div className="truncate" title={content.copy}>
                            {content.copy || (
                              <span className="text-muted-foreground italic">
                                No copy
                              </span>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={getStatusColor(content.status)}>
                            {content.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {content.linkToAsset ? (
                            <a
                              href={content.linkToAsset}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 text-primary hover:underline"
                            >
                              <ExternalLink className="h-3 w-3" />
                              View Asset
                            </a>
                          ) : (
                            <span className="text-muted-foreground">-</span>
                          )}
                        </TableCell>
                        <TableCell>
                          {content.linkToPublishedPost ? (
                            <a
                              href={content.linkToPublishedPost}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 text-primary hover:underline"
                            >
                              <ExternalLink className="h-3 w-3" />
                              View Post
                            </a>
                          ) : (
                            <span className="text-muted-foreground">-</span>
                          )}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="mt-8 text-center text-sm text-muted-foreground">
          <p>This is a read-only view of the content schedule.</p>
          <Link
            href="/"
            className="text-primary hover:underline mt-2 inline-block"
          >
            Access full dashboard →
          </Link>
        </div>
      </div>
    </div>
  );
}
