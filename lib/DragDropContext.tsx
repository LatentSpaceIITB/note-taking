'use client';

import { createContext, useContext, useState, type ReactNode } from 'react';
import type { Lecture } from './firestore';

interface DragDropContextType {
  draggedLecture: Lecture | null;
  setDraggedLecture: (lecture: Lecture | null) => void;
  isDragging: boolean;
  dropTargetFolderId: string | null;
  setDropTargetFolderId: (folderId: string | null) => void;
}

const DragDropContext = createContext<DragDropContextType | null>(null);

export function DragDropProvider({ children }: { children: ReactNode }) {
  const [draggedLecture, setDraggedLecture] = useState<Lecture | null>(null);
  const [dropTargetFolderId, setDropTargetFolderId] = useState<string | null>(null);

  return (
    <DragDropContext.Provider
      value={{
        draggedLecture,
        setDraggedLecture,
        isDragging: draggedLecture !== null,
        dropTargetFolderId,
        setDropTargetFolderId,
      }}
    >
      {children}
    </DragDropContext.Provider>
  );
}

export function useDragDrop() {
  const context = useContext(DragDropContext);
  if (!context) {
    throw new Error('useDragDrop must be used within DragDropProvider');
  }
  return context;
}
