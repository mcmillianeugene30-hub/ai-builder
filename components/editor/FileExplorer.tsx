"use client";

import type { ProjectFile } from "@/lib/types";

interface FileExplorerProps {
  files: ProjectFile[];
  activeFileIndex: number;
  onFileSelect: (index: number) => void;
  onAddFile: () => void;
  onDeleteFile: (index: number) => void;
}

export function FileExplorer({ files, activeFileIndex, onFileSelect, onAddFile, onDeleteFile }: FileExplorerProps) {
  const getFileIcon = (path: string) => {
    const ext = path.split(".").pop()?.toLowerCase();
    const icons: Record<string, string> = {
      ts: "text-blue-400",
      tsx: "text-blue-400",
      js: "text-yellow-400",
      jsx: "text-yellow-400",
      css: "text-pink-400",
      json: "text-green-400",
      html: "text-orange-400",
      md: "text-slate-400",
    };
    return icons[ext || ""] || "text-slate-400";
  };

  const getFileCategory = (path: string) => {
    if (path.startsWith("frontend/")) return "Frontend";
    if (path.startsWith("backend/")) return "Backend";
    if (path.startsWith("shared/")) return "Shared";
    return "Other";
  };

  const groupedFiles = files.reduce((acc, file, index) => {
    const category = getFileCategory(file.path);
    if (!acc[category]) acc[category] = [];
    acc[category].push({ file, index });
    return acc;
  }, {} as Record<string, Array<{ file: ProjectFile; index: number }>>);

  return (
    <div className="h-full flex flex-col bg-slate-850 border-r border-slate-700">
      <div className="p-4 border-b border-slate-700">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider">Files</h3>
          <button
            onClick={onAddFile}
            className="p-1.5 rounded hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
            title="Add file"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          </button>
        </div>
        <div className="flex items-center gap-2">
          <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
          </svg>
          <span className="text-sm text-slate-400">{files.length} files</span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-2">
        {Object.entries(groupedFiles).map(([category, items]) => (
          <div key={category} className="mb-4">
            <div className="text-xs font-medium text-slate-500 uppercase tracking-wider px-2 py-1 mb-1">
              {category}
            </div>
            {items.map(({ file, index }) => (
              <div
                key={file.path}
                className={`flex items-center justify-between group px-2 py-1.5 rounded cursor-pointer mb-0.5 ${
                  activeFileIndex === index ? "bg-cyan-900/50 text-cyan-400" : "text-slate-300 hover:bg-slate-700"
                }`}
                onClick={() => onFileSelect(index)}
              >
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  <svg
                    className={`w-4 h-4 shrink-0 ${getFileIcon(file.path)}`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <span className="text-sm truncate">{file.path.replace("frontend/", "").replace("backend/", "")}</span>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteFile(index);
                  }}
                  className="p-1 rounded opacity-0 group-hover:opacity-100 hover:bg-slate-600 text-slate-400 hover:text-red-400 transition-all"
                  title="Delete file"
                >
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        ))}
        {files.length === 0 && (
          <div className="text-center py-8 text-slate-500 text-sm">
            <svg className="w-12 h-12 mx-auto mb-2 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            No files yet
          </div>
        )}
      </div>
    </div>
  );
}
