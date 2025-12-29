"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
} from "react";
import { supabase } from "@/lib/supabase/client";
import type { RehabProject } from "@/types/database";

interface ProjectContextValue {
  project: RehabProject | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  updateProject: (updates: Partial<RehabProject>) => Promise<void>;
}

const ProjectContext = createContext<ProjectContextValue | undefined>(undefined);

interface ProjectProviderProps {
  projectId: string;
  children: ReactNode;
}

export function ProjectProvider({ projectId, children }: ProjectProviderProps) {
  const [project, setProject] = useState<RehabProject | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProject = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from("projects")
        .select("*")
        .eq("id", projectId)
        .single();

      if (fetchError) {
        throw fetchError;
      }

      setProject(data as RehabProject);
    } catch (err) {
      console.error("Error fetching project:", err);
      setError(err instanceof Error ? err.message : "Failed to load project");
    } finally {
      setIsLoading(false);
    }
  };

  const updateProject = async (updates: Partial<RehabProject>) => {
    if (!project) return;

    try {
      const { data, error: updateError } = await supabase
        .from("projects")
        .update(updates)
        .eq("id", projectId)
        .select()
        .single();

      if (updateError) {
        throw updateError;
      }

      setProject(data as RehabProject);
    } catch (err) {
      console.error("Error updating project:", err);
      throw err;
    }
  };

  useEffect(() => {
    fetchProject();
  }, [projectId]);

  return (
    <ProjectContext.Provider
      value={{
        project,
        isLoading,
        error,
        refetch: fetchProject,
        updateProject,
      }}
    >
      {children}
    </ProjectContext.Provider>
  );
}

export function useProject() {
  const context = useContext(ProjectContext);
  if (context === undefined) {
    throw new Error("useProject must be used within a ProjectProvider");
  }
  return context;
}
