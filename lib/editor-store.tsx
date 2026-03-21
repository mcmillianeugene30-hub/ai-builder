'use client'

import {
  createContext,
  useContext,
  useReducer,
  type ReactNode,
} from 'react'
import type { Project } from './types'

type EditorState = {
  project: Project | null
  activeFileIndex: number
  isSaving: boolean
  lastSavedAt: Date | null
  error: string | null
  loading: boolean
}

type EditorAction =
  | { type: 'LOAD_PROJECT'; project: Project }
  | { type: 'SET_ACTIVE_FILE'; index: number }
  | { type: 'UPDATE_FILE_CONTENT'; index: number; content: string }
  | { type: 'SET_SAVING'; isSaving: boolean }
  | { type: 'SET_LAST_SAVED'; date: Date }
  | { type: 'SET_ERROR'; error: string | null }
  | { type: 'SET_LOADING'; loading: boolean }

type EditorContextValue = Omit<EditorState, 'error'> & {
  error: string | null
  loadProject: (project: Project) => void
  setActiveFile: (index: number) => void
  updateFileContent: (index: number, content: string) => void
  setSaving: (isSaving: boolean) => void
  setLastSaved: (date: Date) => void
  setError: (error: string | null) => void
  setLoading: (loading: boolean) => void
}

const EditorContext = createContext<EditorContextValue | null>(null)

const initialState: EditorState = {
  project: null,
  activeFileIndex: 0,
  isSaving: false,
  lastSavedAt: null,
  error: null,
  loading: false,
}

function editorReducer(state: EditorState, action: EditorAction): EditorState {
  switch (action.type) {
    case 'LOAD_PROJECT':
      return { ...state, project: action.project, activeFileIndex: 0, error: null, loading: false }
    case 'SET_ACTIVE_FILE':
      return { ...state, activeFileIndex: action.index }
    case 'UPDATE_FILE_CONTENT': {
      if (!state.project) return state
      const files = [...state.project.files]
      files[action.index] = { ...files[action.index], content: action.content }
      return {
        ...state,
        project: { ...state.project, files },
      }
    }
    case 'SET_SAVING':
      return { ...state, isSaving: action.isSaving }
    case 'SET_LAST_SAVED':
      return { ...state, lastSavedAt: action.date }
    case 'SET_ERROR':
      return { ...state, error: action.error }
    case 'SET_LOADING':
      return { ...state, loading: action.loading }
    default:
      return state
  }
}

export function EditorProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(editorReducer, initialState)

  return (
    <EditorContext.Provider
      value={{
        project: state.project,
        activeFileIndex: state.activeFileIndex,
        isSaving: state.isSaving,
        lastSavedAt: state.lastSavedAt,
        error: state.error,
        loading: state.loading,
        loadProject: (project) => dispatch({ type: 'LOAD_PROJECT', project }),
        setActiveFile: (index) => dispatch({ type: 'SET_ACTIVE_FILE', index }),
        updateFileContent: (index, content) =>
          dispatch({ type: 'UPDATE_FILE_CONTENT', index, content }),
        setSaving: (isSaving) => dispatch({ type: 'SET_SAVING', isSaving }),
        setLastSaved: (date) => dispatch({ type: 'SET_LAST_SAVED', date }),
        setError: (error) => dispatch({ type: 'SET_ERROR', error }),
        setLoading: (loading) => dispatch({ type: 'SET_LOADING', loading }),
      }}
    >
      {children}
    </EditorContext.Provider>
  )
}

export function useEditor(): EditorContextValue {
  const ctx = useContext(EditorContext)
  if (!ctx) throw new Error('useEditor must be used inside EditorProvider')
  return ctx
}
