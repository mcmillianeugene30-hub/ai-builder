export type EditorAction =
  | { type: 'LOAD_PROJECT'; files: Array<{ path: string; content: string }>; projectName: string }
  | { type: 'UPDATE_FILE_CONTENT'; path: string; content: string }
  | { type: 'SET_ACTIVE_FILE'; path: string }
  | { type: 'ADD_FILE'; path: string; content: string }
  | { type: 'DELETE_FILE'; path: string }
  | { type: 'RENAME_FILE'; oldPath: string; newPath: string };

export interface EditorState {
  files: Array<{ path: string; content: string }>;
  activeFileIndex: number;
  projectName: string;
  isDirty: boolean;
  lastSaved: Date | null;
}

export function editorReducer(state: EditorState, action: EditorAction): EditorState {
  switch (action.type) {
    case 'LOAD_PROJECT':
      return {
        ...state,
        files: action.files,
        activeFileIndex: 0,
        projectName: action.projectName,
        isDirty: false,
        lastSaved: null,
      };

    case 'UPDATE_FILE_CONTENT':
      return {
        ...state,
        files: state.files.map((f) =>
          f.path === action.path ? { ...f, content: action.content } : f
        ),
        isDirty: true,
      };

    case 'SET_ACTIVE_FILE':
      return {
        ...state,
        activeFileIndex: state.files.findIndex((f) => f.path === action.path),
      };

    case 'ADD_FILE':
      return {
        ...state,
        files: [...state.files, { path: action.path, content: action.content }],
        activeFileIndex: state.files.length,
      };

    case 'DELETE_FILE': {
      const newFiles = state.files.filter((f) => f.path !== action.path);
      return {
        ...state,
        files: newFiles,
        activeFileIndex: Math.min(state.activeFileIndex, newFiles.length - 1),
      };
    }

    case 'RENAME_FILE':
      return {
        ...state,
        files: state.files.map((f) =>
          f.path === action.oldPath ? { ...f, path: action.newPath } : f
        ),
      };

    default:
      return state;
  }
}

export const initialEditorState: EditorState = {
  files: [],
  activeFileIndex: -1,
  projectName: '',
  isDirty: false,
  lastSaved: null,
};
