"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ProjectList } from "@/components/projects/ProjectList";
import { listProjects, deleteProject } from "@/lib/projects";
import type { Project } from "@/lib/types";

export default function ProjectsPage() {
  const router = useRouter();
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadProjects() {
      try {
        const data = await listProjects("user-id");
        setProjects(data);
      } catch (err) {
        console.error("Failed to load projects:", err);
      } finally {
        setIsLoading(false);
      }
    }

    loadProjects();
  }, []);

  const handleOpenProject = (id: string) => {
    router.push(`/projects/${id}`);
  };

  const handleDeleteProject = async (id: string) => {
    if (confirm("Are you sure you want to delete this project?")) {
      await deleteProject(id, "user-id");
      setProjects(projects.filter((p) => p.id !== id));
    }
  };

  const handleNewProject = () => {
    router.push("/");
  };

  return (
    <ProjectList
      projects={projects}
      onOpenProject={handleOpenProject}
      onDeleteProject={handleDeleteProject}
      onNewProject={handleNewProject}
      isLoading={isLoading}
    />
  );
}
