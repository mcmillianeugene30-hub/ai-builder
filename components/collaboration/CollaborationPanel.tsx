"use client";

import type { PresenceState } from "@/lib/realtime";

interface CollaborationPanelProps {
  presences: Record<string, PresenceState[]>;
  currentUserId: string;
}

export function CollaborationPanel({ presences, currentUserId }: CollaborationPanelProps) {
  const allPresences = Object.values(presences).flat();
  const collaborators = allPresences.filter((p) => p.userId !== currentUserId);

  return (
    <div className="border-l border-slate-700 bg-slate-850 w-64 flex flex-col">
      <div className="p-4 border-b border-slate-700">
        <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider">
          Collaborators
        </h3>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        {collaborators.length === 0 ? (
          <div className="text-center text-slate-500 text-sm py-8">
            <svg className="w-10 h-10 mx-auto mb-2 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            <p>No one else is viewing this project</p>
          </div>
        ) : (
          <div className="space-y-3">
            {collaborators.map((presence, index) => (
              <div
                key={`${presence.userId}-${index}`}
                className="flex items-center gap-3 p-3 bg-slate-800 rounded-lg"
              >
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold text-white"
                  style={{ backgroundColor: presence.color }}
                >
                  {presence.userName.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white truncate">
                    {presence.userName}
                  </p>
                  {presence.activeFile && (
                    <p className="text-xs text-slate-400 truncate">
                      Editing {presence.activeFile}
                    </p>
                  )}
                </div>
                <div className="w-2 h-2 bg-green-500 rounded-full" />
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="p-4 border-t border-slate-700">
        <button className="w-full px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg text-sm font-medium transition-colors">
          Invite Collaborator
        </button>
      </div>
    </div>
  );
}
