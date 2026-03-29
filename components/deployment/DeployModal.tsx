"use client";

import { useState } from "react";
import { Modal } from "../ui/Modal";
import { Button } from "../ui/Button";

interface DeployModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDeploy: (projectName: string) => Promise<void>;
  projectName: string;
}

export function DeployModal({ isOpen, onClose, onDeploy, projectName }: DeployModalProps) {
  const [isDeploying, setIsDeploying] = useState(false);
  const [status, setStatus] = useState<"idle" | "building" | "ready" | "error">("idle");
  const [deployUrl, setDeployUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleDeploy = async () => {
    setIsDeploying(true);
    setStatus("building");
    setError(null);

    try {
      await onDeploy(projectName);
      setStatus("ready");
      setDeployUrl(`https://${projectName.toLowerCase().replace(/[^a-z0-9]/g, "-")}.vercel.app`);
    } catch (err) {
      setStatus("error");
      setError(err instanceof Error ? err.message : "Deployment failed");
    } finally {
      setIsDeploying(false);
    }
  };

  const handleClose = () => {
    setStatus("idle");
    setDeployUrl(null);
    setError(null);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Deploy to Vercel" size="lg">
      <div className="space-y-6">
        <div className="bg-slate-700/50 rounded-lg p-4">
          <h4 className="text-sm font-medium text-slate-300 mb-2">Deployment Details</h4>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-slate-400">Project:</span>
              <p className="text-white font-medium">{projectName}</p>
            </div>
            <div>
              <span className="text-slate-400">Platform:</span>
              <p className="text-white font-medium">Vercel</p>
            </div>
          </div>
        </div>

        {status === "idle" && (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-cyan-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
            </div>
            <p className="text-slate-300 mb-4">
              Deploy your app to Vercel with a single click. The process typically takes 2-3 minutes.
            </p>
            <Button onClick={handleDeploy} size="lg">
              Start Deployment
            </Button>
          </div>
        )}

        {status === "building" && (
          <div className="text-center py-8">
            <div className="w-16 h-16 mx-auto mb-4 relative">
              <svg className="animate-spin w-16 h-16 text-cyan-500" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
            </div>
            <p className="text-lg font-medium text-white mb-2">Building your app...</p>
            <p className="text-slate-400 text-sm">This usually takes 2-3 minutes</p>
          </div>
        )}

        {status === "ready" && deployUrl && (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <p className="text-lg font-medium text-white mb-2">Deployment successful!</p>
            <p className="text-slate-400 text-sm mb-6">Your app is now live</p>
            <a
              href={deployUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block px-6 py-3 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg font-medium transition-colors"
            >
              Open Live App
            </a>
          </div>
        )}

        {status === "error" && error && (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <p className="text-lg font-medium text-white mb-2">Deployment failed</p>
            <p className="text-slate-400 text-sm mb-6">{error}</p>
            <Button onClick={() => setStatus("idle")}>Try Again</Button>
          </div>
        )}
      </div>
    </Modal>
  );
}
