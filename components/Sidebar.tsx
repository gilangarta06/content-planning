'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { ProjectForm } from './ProjectForm';
import { Project, Platform } from '@/lib/types';
import { Trash2, ExternalLink, Menu, X } from 'lucide-react';
import Link from 'next/link';

interface SidebarProps {
  projects: Project[];
  selectedProjectId: string | null;
  selectedPlatform: Platform;
  onProjectSelect: (projectId: string) => void;
  onProjectCreated: (project: Project) => void;
  onProjectDeleted: (projectId: string) => void;
}

export function Sidebar({ 
  projects, 
  selectedProjectId, 
  selectedPlatform,
  onProjectSelect, 
  onProjectCreated,
  onProjectDeleted 
}: SidebarProps) {
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const filteredProjects = projects.filter(project => 
    selectedPlatform === 'All' || project.platform === selectedPlatform
  );

  const handleDeleteProject = async (projectId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm('Are you sure you want to delete this project? This action cannot be undone.')) return;

    try {
      const res = await fetch(`/api/projects/${projectId}`, {
        method: 'DELETE',
      });

      if (!res.ok) throw new Error('Failed to delete project');

      onProjectDeleted(projectId);
    } catch (error) {
      console.error('Error deleting project:', error);
      alert('Failed to delete project. Please try again.');
    }
  };

  const getPlatformColor = (platform: string) => {
    switch (platform) {
      case 'Instagram': return 'bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200';
      case 'TikTok': return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
      case 'Facebook': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const SidebarContent = () => (
    <div className="h-full flex flex-col">
      <div className="p-6 border-b">
        <h1 className="text-xl font-semibold mb-4">Content Planning</h1>
        <ProjectForm onProjectCreated={onProjectCreated} />
      </div>
      
      <div className="flex-1 overflow-y-auto p-4">
        <div className="space-y-2">
          {filteredProjects.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">
              No projects found for selected platform
            </p>
          ) : (
            filteredProjects.map(project => (
              <Card 
                key={project.id}
                className={`cursor-pointer transition-all hover:shadow-md ${
                  selectedProjectId === project.id ? 'ring-2 ring-primary' : ''
                }`}
                onClick={() => onProjectSelect(project.id)}
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-medium text-sm leading-tight">{project.name}</h3>
                    <div className="flex items-center gap-1 ml-2">
                      <Link
                        href={`/project/${project.id}`}
                        target="_blank"
                        onClick={(e) => e.stopPropagation()}
                        className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-800"
                        title="Open client view"
                      >
                        <ExternalLink className="h-3 w-3 text-muted-foreground" />
                      </Link>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-6 w-6 p-0 text-muted-foreground hover:text-destructive"
                        onClick={(e) => handleDeleteProject(project.id, e)}
                        title="Delete project"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                  
                  {project.description && (
                    <p className="text-xs text-muted-foreground mb-3 line-clamp-2">
                      {project.description}
                    </p>
                  )}
                  
                  <div className="flex items-center justify-between">
                    <Badge variant="outline" className={getPlatformColor(project.platform)}>
                      {project.platform}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      {project.contents.length} content{project.contents.length !== 1 ? 's' : ''}
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile menu button */}
      <Button
        variant="outline"
        size="sm"
        className="fixed top-4 left-4 z-50 md:hidden"
        onClick={() => setIsMobileOpen(true)}
      >
        <Menu className="h-4 w-4" />
      </Button>

      {/* Desktop sidebar */}
      <div className="hidden md:block w-80 bg-background border-r h-screen sticky top-0">
        <SidebarContent />
      </div>

      {/* Mobile sidebar */}
      {isMobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="fixed inset-0 bg-background/80 backdrop-blur-sm" onClick={() => setIsMobileOpen(false)} />
          <div className="fixed left-0 top-0 h-full w-80 bg-background border-r shadow-lg">
            <div className="flex items-center justify-between p-4 border-b">
              <h1 className="text-xl font-semibold">Content Planning</h1>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsMobileOpen(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            <div className="h-[calc(100vh-73px)]">
              <div className="p-4 border-b">
                <ProjectForm onProjectCreated={onProjectCreated} />
              </div>
              <div className="flex-1 overflow-y-auto p-4">
                <div className="space-y-2">
                  {filteredProjects.map(project => (
                    <Card 
                      key={project.id}
                      className={`cursor-pointer transition-all hover:shadow-md ${
                        selectedProjectId === project.id ? 'ring-2 ring-primary' : ''
                      }`}
                      onClick={() => {
                        onProjectSelect(project.id);
                        setIsMobileOpen(false);
                      }}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between mb-2">
                          <h3 className="font-medium text-sm leading-tight">{project.name}</h3>
                          <div className="flex items-center gap-1 ml-2">
                            <Link
                              href={`/project/${project.id}`}
                              target="_blank"
                              onClick={(e) => e.stopPropagation()}
                              className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-800"
                              title="Open client view"
                            >
                              <ExternalLink className="h-3 w-3 text-muted-foreground" />
                            </Link>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-6 w-6 p-0 text-muted-foreground hover:text-destructive"
                              onClick={(e) => handleDeleteProject(project.id, e)}
                              title="Delete project"
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                        
                        {project.description && (
                          <p className="text-xs text-muted-foreground mb-3 line-clamp-2">
                            {project.description}
                          </p>
                        )}
                        
                        <div className="flex items-center justify-between">
                          <Badge variant="outline" className={getPlatformColor(project.platform)}>
                            {project.platform}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            {project.contents.length} content{project.contents.length !== 1 ? 's' : ''}
                          </span>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
