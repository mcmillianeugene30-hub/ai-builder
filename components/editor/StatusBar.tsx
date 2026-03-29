interface StatusBarProps {
  projectName: string;
  fileName?: string;
  language?: string;
  isDirty?: boolean;
  lastSaved?: Date | null;
}

export function StatusBar({ projectName, fileName, language, isDirty, lastSaved }: StatusBarProps) {
  const formatLastSaved = (date: Date | null | undefined) => {
    if (!date) return "Not saved";
    return `Saved ${new Date(date).toLocaleTimeString()}`;
  };

  return (
    <div className="bg-slate-850 border-t border-slate-700 px-4 py-2 flex items-center justify-between text-xs text-slate-400">
      <div className="flex items-center gap-4">
        <span className="font-medium text-white">{projectName}</span>
        {fileName && (
          <>
            <span className="text-slate-600">|</span>
            <span>{fileName}</span>
          </>
        )}
        {language && (
          <>
            <span className="text-slate-600">|</span>
            <span className="px-2 py-0.5 bg-slate-700 rounded text-xs">{language}</span>
          </>
        )}
        {isDirty && (
          <>
            <span className="text-slate-600">|</span>
            <span className="text-amber-400 font-medium">Unsaved changes</span>
          </>
        )}
      </div>
      <div>
        {formatLastSaved(lastSaved)}
      </div>
    </div>
  );
}
