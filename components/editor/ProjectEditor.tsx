"use client";

import { useState, useEffect } from "react";
import { MonacoEditor } from "./MonacoEditor";
import { FileExplorer } from "./FileExplorer";
import { Button } from "../ui/Button";
import type { EditorState, EditorAction } from "@/lib/editor-store";
import type { ProjectFile } from "@/lib/types";

interface ProjectEditorProps {
  editorState: EditorState;
  dispatch: (action: EditorAction) => void;
  onSave: () => Promise<void>;
  onDeploy?: () => void;
}

export function ProjectEditor({ editorState, dispatch, onSave, onDeploy }: ProjectEditorProps) {
  const [isSaving, setIsSaving] = useState(false);
  const [addFileDialog, setAddFileDialog] = useState(false);
  const [newFilePath, setNewFilePath] = useState("");

  const activeFile = editorState.files[editorState.activeFileIndex];
  const language = getLanguageFromPath(activeFile?.path || "");

  useEffect(() => {
    const timer = setTimeout(() => {
      if (editorState.isDirty) {
        onSave();
      }
    }, 3000);

    return () => clearTimeout(timer);
  }, [editorState.isDirty, onSave]);

  const handleFileContentChange = (content: string) => {
    if (activeFile) {
      dispatch({ type: "UPDATE_FILE_CONTENT", path: activeFile.path, content });
    }
  };

  const handleAddFile = () => {
    if (newFilePath.trim()) {
      dispatch({ type: "ADD_FILE", path: `frontend/${newFilePath.trim()}`, content: "" });
      setNewFilePath("");
      setAddFileDialog(false);
    }
  };

  const handleDeleteFile = (index: number) => {
    if (confirm("Are you sure you want to delete this file?")) {
      dispatch({ type: "DELETE_FILE", path: editorState.files[index].path });
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    await onSave();
    setIsSaving(false);
  };

  return (
    <div className="flex h-[calc(100vh-4rem)]">
      <FileExplorer
        files={editorState.files}
        activeFileIndex={editorState.activeFileIndex}
        onFileSelect={(index) => dispatch({ type: "SET_ACTIVE_FILE", path: editorState.files[index].path })}
        onAddFile={() => setAddFileDialog(true)}
        onDeleteFile={handleDeleteFile}
      />

      <div className="flex-1 flex flex-col bg-slate-900">
        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-700 bg-slate-850">
          <div className="flex items-center gap-3">
            <h2 className="text-lg font-semibold text-white">{editorState.projectName}</h2>
            {activeFile && (
              <span className="text-sm text-slate-400 bg-slate-700 px-2 py-1 rounded">
                {activeFile.path}
              </span>
            )}
            {editorState.isDirty && (
              <span className="text-xs text-amber-400 font-medium">Unsaved</span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Button variant="secondary" size="sm" onClick={handleSave} isLoading={isSaving}>
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
              </svg>
              Save
            </Button>
            {onDeploy && (
              <Button variant="primary" size="sm" onClick={onDeploy}>
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
                Deploy
              </Button>
            )}
          </div>
        </div>

        {activeFile ? (
          <div className="flex-1 overflow-hidden">
            <MonacoEditor
              value={activeFile.content}
              onChange={handleFileContentChange}
              language={language}
            />
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center text-slate-500">
            <div className="text-center">
              <svg className="w-16 h-16 mx-auto mb-4 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <p className="text-lg font-medium">No file selected</p>
              <p className="text-sm">Select a file from the explorer to start editing</p>
            </div>
          </div>
        )}
      </div>

      {addFileDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70">
          <div className="bg-slate-800 rounded-lg p-6 w-full max-w-md border border-slate-700">
            <h3 className="text-xl font-semibold text-white mb-4">Add New File</h3>
            <div className="mb-4">
              <label className="block text-sm font-medium text-slate-300 mb-2">File Path</label>
              <input
                type="text"
                value={newFilePath}
                onChange={(e) => setNewFilePath(e.target.value)}
                placeholder="src/components/Button.tsx"
                className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                autoFocus
                onKeyDown={(e) => e.key === "Enter" && handleAddFile()}
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="ghost" onClick={() => setAddFileDialog(false)}>Cancel</Button>
              <Button onClick={handleAddFile}>Add File</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function getLanguageFromPath(path: string): string {
  const ext = path.split(".").pop()?.toLowerCase();
  const languages: Record<string, string> = {
    ts: "typescript",
    tsx: "typescript",
    js: "javascript",
    jsx: "javascript",
    css: "css",
    scss: "scss",
    json: "json",
    html: "html",
    md: "markdown",
    py: "python",
    rb: "ruby",
    go: "go",
    rs: "rust",
  };
  return languages[ext || ""] || "plaintext";
}
