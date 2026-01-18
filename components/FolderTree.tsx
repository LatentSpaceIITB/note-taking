'use client';

import { useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { type Folder } from '@/lib/folders';
import { type Lecture } from '@/lib/firestore';
import { useDragDrop } from '@/lib/DragDropContext';

interface FolderTreeProps {
  folders: Folder[];
  lectures: Lecture[];
  onCreateFolder: () => void;
  onRenameFolder: (folderId: string, name: string) => void;
  onDeleteFolder: (folderId: string) => void;
  onMoveLecture: (lectureId: string, folderId: string | null) => void;
}

function LectureItem({
  lecture,
  onMoveLecture
}: {
  lecture: Lecture;
  onMoveLecture?: (lectureId: string, folderId: string | null) => void;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { setDraggedLecture, isDragging, dropTargetFolderId, setDropTargetFolderId } = useDragDrop();
  const isActive = pathname === `/lecture/${lecture.sessionId}`;
  const canDrag = lecture.status === 'completed';

  // Extract title from notes
  let title = 'Untitled';
  if (lecture.notes) {
    const titleMatch = lecture.notes.match(/^#\s*(.+)/m);
    if (titleMatch) {
      title = titleMatch[1].trim();
    }
  }

  const handleClick = () => {
    if (lecture.status === 'completed' && !isDragging) {
      router.push(`/lecture/${lecture.sessionId}`);
    }
  };

  const getStatusIcon = () => {
    switch (lecture.status) {
      case 'uploading':
        return (
          <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse" />
        );
      case 'transcribing':
      case 'cleaning':
        return (
          <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse" />
        );
      case 'failed':
        return (
          <div className="w-2 h-2 bg-red-400 rounded-full" />
        );
      case 'completed':
      default:
        return (
          <svg className="w-4 h-4 text-stone-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        );
    }
  };

  return (
    <motion.div
      className={`
        group relative flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors
        ${isActive
          ? 'bg-stone-200 text-stone-800'
          : lecture.status === 'completed'
            ? 'text-stone-600 hover:text-stone-800 hover:bg-stone-200/50 cursor-pointer'
            : 'text-stone-400 cursor-default'
        }
        ${canDrag ? 'cursor-grab active:cursor-grabbing' : ''}
      `}
      drag={canDrag}
      dragSnapToOrigin
      dragElastic={0.1}
      onDragStart={() => canDrag && setDraggedLecture(lecture)}
      onDragEnd={() => {
        // Check if we have a drop target and move the lecture
        if (dropTargetFolderId && onMoveLecture && lecture.folderId !== dropTargetFolderId) {
          onMoveLecture(lecture.sessionId, dropTargetFolderId);
        }
        setDraggedLecture(null);
        setDropTargetFolderId(null);
      }}
      onClick={handleClick}
      whileDrag={{
        scale: 1.02,
        boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.15)',
        zIndex: 50,
        cursor: 'grabbing',
      }}
    >
      {/* Drag Handle - visible on hover for completed lectures */}
      {canDrag && (
        <div className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1 opacity-0 group-hover:opacity-100 transition-opacity text-stone-400">
          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8h16M4 16h16" />
          </svg>
        </div>
      )}
      {getStatusIcon()}
      <span className="truncate flex-1">{title}</span>
    </motion.div>
  );
}

function FolderItem({
  folder,
  lectures,
  isExpanded,
  onToggle,
  onRename,
  onDelete,
  onMoveLecture,
}: {
  folder: Folder;
  lectures: Lecture[];
  isExpanded: boolean;
  onToggle: () => void;
  onRename: (name: string) => void;
  onDelete: () => void;
  onMoveLecture: (lectureId: string, folderId: string) => void;
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(folder.name);
  const [showMenu, setShowMenu] = useState(false);
  const { isDragging, dropTargetFolderId, setDropTargetFolderId } = useDragDrop();

  const isDropTarget = dropTargetFolderId === folder.id;

  const handleSubmit = () => {
    if (editName.trim() && editName !== folder.name) {
      onRename(editName.trim());
    }
    setIsEditing(false);
  };

  return (
    <div className="group">
      <div
        className={`
          flex items-center gap-2 px-3 py-2 rounded-lg transition-all cursor-pointer
          ${isDropTarget && isDragging
            ? 'bg-teal-100 ring-2 ring-teal-400 ring-dashed scale-[1.02]'
            : isDragging
              ? 'ring-1 ring-teal-300 bg-teal-50/50'
              : 'hover:bg-stone-200/50'
          }
        `}
        onClick={onToggle}
        onMouseEnter={() => isDragging && setDropTargetFolderId(folder.id)}
        onMouseLeave={() => dropTargetFolderId === folder.id && setDropTargetFolderId(null)}
      >
        <svg
          className={`w-4 h-4 text-stone-500 transition-transform ${isExpanded ? 'rotate-90' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>

        <div
          className="w-4 h-4 rounded"
          style={{ backgroundColor: folder.color }}
        />

        {isEditing ? (
          <input
            type="text"
            value={editName}
            onChange={(e) => setEditName(e.target.value)}
            onBlur={handleSubmit}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleSubmit();
              if (e.key === 'Escape') setIsEditing(false);
            }}
            onClick={(e) => e.stopPropagation()}
            className="flex-1 bg-transparent text-stone-800 text-sm outline-none"
            autoFocus
          />
        ) : (
          <span className="flex-1 text-sm text-stone-700 truncate">{folder.name}</span>
        )}

        {/* Drop indicator */}
        {isDropTarget && isDragging && (
          <span className="text-teal-600 text-xs font-medium flex items-center gap-1">
            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Drop
          </span>
        )}

        {!isDropTarget && <span className="text-xs text-stone-500">{lectures.length}</span>}

        <div className="relative">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setShowMenu(!showMenu);
            }}
            className="p-1 rounded opacity-0 group-hover:opacity-100 hover:bg-stone-200 transition-all"
          >
            <svg className="w-4 h-4 text-stone-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
            </svg>
          </button>

          {showMenu && (
            <div
              className="absolute right-0 top-full mt-1 bg-cream-50 border border-stone-200 rounded-lg shadow-xl overflow-hidden z-10"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => {
                  setIsEditing(true);
                  setShowMenu(false);
                }}
                className="flex items-center gap-2 w-full px-4 py-2 text-sm text-stone-600 hover:text-stone-800 hover:bg-stone-100"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                </svg>
                Rename
              </button>
              <button
                onClick={() => {
                  onDelete();
                  setShowMenu(false);
                }}
                className="flex items-center gap-2 w-full px-4 py-2 text-sm text-red-500 hover:text-red-600 hover:bg-stone-100"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                Delete
              </button>
            </div>
          )}
        </div>
      </div>

      {isExpanded && lectures.length > 0 && (
        <div className="ml-4 mt-1 space-y-1 border-l border-stone-200 pl-2">
          {lectures.map((lecture) => (
            <LectureItem key={lecture.sessionId} lecture={lecture} onMoveLecture={onMoveLecture} />
          ))}
        </div>
      )}
    </div>
  );
}

export function FolderTree({
  folders,
  lectures,
  onCreateFolder,
  onRenameFolder,
  onDeleteFolder,
  onMoveLecture,
}: FolderTreeProps) {
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set());

  // Group lectures by folder
  const lecturesByFolder = new Map<string | null, Lecture[]>();
  lecturesByFolder.set(null, []); // Unfiled lectures

  lectures.forEach((lecture) => {
    const folderId = (lecture as Lecture & { folderId?: string }).folderId || null;
    const existing = lecturesByFolder.get(folderId) || [];
    lecturesByFolder.set(folderId, [...existing, lecture]);
  });

  const toggleFolder = (folderId: string) => {
    setExpandedFolders((prev) => {
      const next = new Set(prev);
      if (next.has(folderId)) {
        next.delete(folderId);
      } else {
        next.add(folderId);
      }
      return next;
    });
  };

  const unfiledLectures = lecturesByFolder.get(null) || [];

  return (
    <div className="space-y-1">
      {/* Folders */}
      {folders.map((folder) => (
        <FolderItem
          key={folder.id}
          folder={folder}
          lectures={lecturesByFolder.get(folder.id) || []}
          isExpanded={expandedFolders.has(folder.id)}
          onToggle={() => toggleFolder(folder.id)}
          onRename={(name) => onRenameFolder(folder.id, name)}
          onDelete={() => onDeleteFolder(folder.id)}
          onMoveLecture={(lectureId, folderId) => onMoveLecture(lectureId, folderId)}
        />
      ))}

      {/* Create folder button */}
      <button
        onClick={onCreateFolder}
        className="flex items-center gap-2 w-full px-3 py-2 text-sm text-stone-500 hover:text-stone-700 hover:bg-stone-200/50 rounded-lg transition-colors"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
        New folder
      </button>

      {/* Unfiled lectures */}
      {unfiledLectures.length > 0 && (
        <div className="mt-4 pt-4 border-t border-stone-200">
          <div className="px-3 py-1 text-xs text-stone-500 uppercase tracking-wider">
            Recent
          </div>
          <div className="mt-2 space-y-1">
            {unfiledLectures.slice(0, 10).map((lecture) => (
              <LectureItem key={lecture.sessionId} lecture={lecture} onMoveLecture={onMoveLecture} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
