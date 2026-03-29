"use client";

import { useEffect, useReducer, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ProjectEditor } from "@/components/editor/ProjectEditor";
import { CollaborationPanel } from "@/components/collaboration/CollaborationPanel";
import { DeployModal } from "@/components/deployment/DeployModal";
import { getProject, updateProject, deleteProject } from "@/lib/projects";
import { createVercelDeployment, pollDeploymentStatus, createDeploymentRecord, updateDeploymentStatus } from "@/lib/deploy";
import { createProjectChannel, subscribeToProjectChannel, broadcastFileUpdate, type PresenceState } from "@/lib/realtime";
import { editorReducer, initialEditorState, type EditorAction } from "@/lib/editor-store";
import type { Project } from "@/lib/types";

export default function ProjectPage() {
  const params = useParams();
  const router = useRouter();
  const projectId = params.id as string;

  const [editorState, dispatch] = useReducer(editorReducer, initialEditorState);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deployModalOpen, setDeployModalOpen] = useState(false);
  const [presences, setPresences] = useState<Record<string, PresenceState[]>>({});

  useEffect(() => {
    async function loadProject() {
      setLoading(true);
      try {
        const project = await getProject(projectId, "user-id");
        if (!project) {
          setError("Project not found");
          return;
        }

        dispatch({
          type: "LOAD_PROJECT",
          files: project.files,
          projectName: project.name,
        });

        const channel = createProjectChannel(projectId, "user-id", "You", "#3b82f6");
        subscribeToProjectChannel(
          channel,
          "user-id",
          "You",
          "#3b82f6",
          ({ filePath, content, userId }) => {
            if (userId !== "user-id") {
              dispatch({ type: "UPDATE_FILE_CONTENT", path: filePath, content });
            }
          },
          (state) => {
            setPresences(state as Record<string, PresenceState[]>);
          }
        );
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load project");
      } finally {
        setLoading(false);
      }
    }

    loadProject();
  }, [projectId]);

  const handleSave = async () => {
    try {
      await updateProject(projectId, "user-id", {
        files: editorState.files.map((f) => ({ path: f.path, content: f.content })),
      });
    } catch (err) {
      console.error("Failed to save project:", err);
    }
  };

  const handleDeploy = async (projectName: string) => {
    try {
      const { data, error: deployError } = await createVercelDeployment(
        projectName,
        editorState.files.map((f) => ({ path: f.path, content: f.content }))
      );

      if (deployError || !data) {
        throw new Error(deployError || "Deployment failed");
      }

      const deploymentId = await createDeploymentRecord(projectId, "user-id", data.vercelId);
      if (!deploymentId) {
        throw new Error("Failed to create deployment record");
      }

      const result = await pollDeploymentStatus(data.vercelId, (status) => {
        console.log("Deployment status:", status);
      });

      if (result.ready && result.url) {
        await updateDeploymentStatus(deploymentId, "ready", result.url);
      } else {
        await updateDeploymentStatus(deploymentId, "error", undefined, result.error);
        throw new Error(result.error || "Deployment failed");
      }
    } catch (err) {
      console.error("Deployment error:", err);
      throw err;
    }
  };

  const handleDelete = async () => {
    if (confirm("Are you sure you want to delete this project?")) {
      await deleteProject(projectId, "user-id");
      router.push("/projects");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-slate-900 text-white">
        <div className="text-center">
          <svg className="animate-spin w-12 h-12 mx-auto mb-4 text-cyan-500" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          <p className="text-slate-400">Loading project...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen bg-slate-900 text-white">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <p className="text-xl font-medium mb-4">{error}</p>
          <button
            onClick={() => router.push("/projects")}
            className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg"
          >
            Back to Projects
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-slate-900">
      <div className="flex-1 flex">
        <ProjectEditor
          editorState={editorState}
          dispatch={dispatch}
          onSave={handleSave}
          onDeploy={() => setDeployModalOpen(true)}
        />
        <CollaborationPanel presences={presences} currentUserId="user-id" />
      </div>

      <DeployModal
        isOpen={deployModalOpen}
        onClose={() => setDeployModalOpen(false)}
        onDeploy={handleDeploy}
        projectName={editorState.projectName}
      />
    </div>
  );
}
