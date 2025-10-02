'use client';

import { useState, useEffect } from 'react';
import { Sidebar } from '@/components/content/Sidebar';
import { ContentTable } from '@/components/content/ContentTable';
import { PlatformSelector } from '@/components/content/PlatformSelector';
import { Project, Platform, AppState } from '@/lib/types';

export default function Home() {
  const [appState, setAppState] = useState<AppState>({
    projects: [],
    selectedProjectId: null,
    selectedPlatform: 'All',
  });
  const [isLoaded, setIsLoaded] = useState(false);

  // 🔹 Fetch projects dari API
  useEffect(() => {
    const fetchState = async () => {
      try {
        const res = await fetch('/api/projects', { cache: 'no-store' });
        const projects: Project[] = await res.json();

        setAppState({
          projects: Array.isArray(projects) ? projects : [],
          selectedProjectId: null,
          selectedPlatform: 'All',
        });
      } catch (err) {
        console.error('Failed to fetch projects:', err);
        setAppState({ projects: [], selectedProjectId: null, selectedPlatform: 'All' });
      } finally {
        setIsLoaded(true);
      }
    };
    fetchState();
  }, []);

  // 🔹 Cari project yang dipilih (pakai id, bukan _id)
  const selectedProject = appState.projects.find(
    (p) => p.id === appState.selectedProjectId
  );

  const handleProjectSelect = async (projectId: string) => {
    setAppState((prev) => ({ ...prev, selectedProjectId: projectId }));
  };

  const handlePlatformChange = async (platform: Platform) => {
    const newState = { ...appState, selectedPlatform: platform };
    setAppState(newState);

    if (
      platform !== 'All' &&
      selectedProject &&
      selectedProject.platform !== platform
    ) {
      const firstMatchingProject = appState.projects.find(
        (p) => p.platform === platform
      );
      if (firstMatchingProject) {
        handleProjectSelect(firstMatchingProject.id);
      } else {
        setAppState({ ...newState, selectedProjectId: null });
      }
    }
  };

  const refreshProjects = async (selectId?: string) => {
    try {
      const res = await fetch('/api/projects', { cache: 'no-store' });
      const projects: Project[] = await res.json();
      setAppState({
        projects: Array.isArray(projects) ? projects : [],
        selectedProjectId: selectId ?? null,
        selectedPlatform: appState.selectedPlatform,
      });
    } catch (err) {
      console.error('Failed to refresh projects:', err);
    }
  };

  const handleProjectCreated = async (project: Project) => {
    await refreshProjects(project.id);
  };

  const handleProjectDeleted = async () => {
    await refreshProjects();
  };

  const handleContentUpdated = async () => {
    await refreshProjects(appState.selectedProjectId ?? undefined);
  };

  if (!isLoaded) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-background">
      <Sidebar
        projects={appState.projects}
        selectedProjectId={appState.selectedProjectId}
        selectedPlatform={appState.selectedPlatform}
        onProjectSelect={handleProjectSelect}
        onProjectCreated={handleProjectCreated}
        onProjectDeleted={handleProjectDeleted}
      />
      
      <main className="flex-1 overflow-auto">
        <div className="p-6 max-w-7xl mx-auto">
          <PlatformSelector
            selectedPlatform={appState.selectedPlatform}
            onPlatformChange={handlePlatformChange}
          />
          
          {selectedProject ? (
            <ContentTable
              project={selectedProject}
              onContentUpdated={handleContentUpdated}
            />
          ) : (
            <div className="text-center py-12">
              <div className="max-w-md mx-auto">
                <div className="mb-6">
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
                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                      />
                    </svg>
                  </div>
                  <h2 className="text-xl font-semibold mb-2">No Project Selected</h2>
                  <p className="text-muted-foreground">
                    {appState.projects.length === 0 
                      ? "Get started by creating your first project using the sidebar."
                      : "Select a project from the sidebar to manage its content."
                    }
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
