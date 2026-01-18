'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { UserMenu } from './UserMenu';
import { FolderTree } from './FolderTree';
import { useAuth } from '@/lib/AuthContext';
import { subscribeLectures, moveLectureToFolder, type Lecture } from '@/lib/firestore';
import {
  getFolders,
  createFolder,
  updateFolder,
  deleteFolder,
  type Folder,
} from '@/lib/folders';
import { EASING } from '@/lib/animations';

interface SidebarProps {
  isCollapsed: boolean;
  onToggle: () => void;
}

export function Sidebar({ isCollapsed, onToggle }: SidebarProps) {
  const pathname = usePathname();
  const { user } = useAuth();
  const [folders, setFolders] = useState<Folder[]>([]);
  const [lectures, setLectures] = useState<Lecture[]>([]);
  const [loading, setLoading] = useState(true);

  // Load folders
  useEffect(() => {
    if (!user?.uid) return;

    let cancelled = false;

    const loadFolders = async () => {
      try {
        const userFolders = await getFolders(user.uid);
        if (!cancelled) {
          setFolders(userFolders);
        }
      } catch (error) {
        if (!cancelled) {
          console.error('Failed to load folders:', error);
        }
      }
    };

    loadFolders();

    return () => {
      cancelled = true;
    };
  }, [user?.uid]);

  // Subscribe to lectures
  useEffect(() => {
    if (!user?.uid) return;

    const unsubscribe = subscribeLectures(user.uid, (updatedLectures) => {
      setLectures(updatedLectures);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user?.uid]);

  const handleCreateFolder = async () => {
    if (!user) return;

    try {
      await createFolder(user.uid, 'New Folder');
      const newFolders = await getFolders(user.uid);
      setFolders(newFolders);
    } catch (error) {
      console.error('Failed to create folder:', error);
    }
  };

  const handleRenameFolder = async (folderId: string, name: string) => {
    if (!user) return;

    try {
      await updateFolder(user.uid, folderId, { name });
      setFolders((prev) =>
        prev.map((f) => (f.id === folderId ? { ...f, name } : f))
      );
    } catch (error) {
      console.error('Failed to rename folder:', error);
    }
  };

  const handleDeleteFolder = async (folderId: string) => {
    if (!user) return;

    try {
      await deleteFolder(user.uid, folderId);
      setFolders((prev) => prev.filter((f) => f.id !== folderId));
    } catch (error) {
      console.error('Failed to delete folder:', error);
    }
  };

  const handleMoveLecture = async (lectureId: string, folderId: string | null) => {
    if (!user) return;

    try {
      await moveLectureToFolder(user.uid, lectureId, folderId);
      // The lectures will auto-update via the subscription
    } catch (error) {
      console.error('Failed to move lecture:', error);
    }
  };

  // Collapsed sidebar
  if (isCollapsed) {
    return (
      <motion.div
        className="w-[72px] bg-cream-100/80 backdrop-blur-sm border-r border-stone-200 flex flex-col"
        initial={{ width: 288 }}
        animate={{ width: 72 }}
        transition={{ duration: 0.3, ease: EASING.smooth }}
      >
        {/* Toggle button */}
        <button
          onClick={onToggle}
          className="p-4 text-stone-400 hover:text-stone-800 transition-colors"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>

        {/* New Recording */}
        <Link
          href="/record"
          className={`p-3 mx-2 rounded-xl transition-all ${
            pathname === '/record'
              ? 'bg-teal-700 text-white shadow-md'
              : 'text-stone-500 hover:text-teal-700 hover:bg-teal-50'
          }`}
          title="New Recording"
        >
          <svg className="w-6 h-6 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
        </Link>

        {/* Dashboard */}
        <Link
          href="/dashboard"
          className={`p-3 mx-2 mt-2 rounded-xl transition-all ${
            pathname === '/dashboard'
              ? 'bg-stone-200 text-stone-800'
              : 'text-stone-500 hover:text-stone-800 hover:bg-stone-100'
          }`}
          title="Dashboard"
        >
          <svg className="w-6 h-6 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
          </svg>
        </Link>

        <div className="flex-1" />

        {/* User avatar */}
        {user && (
          <div className="p-4 flex justify-center">
            {user.photoURL ? (
              <img
                src={user.photoURL}
                alt={user.displayName || 'User'}
                className="w-9 h-9 rounded-full ring-2 ring-stone-200"
              />
            ) : (
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-teal-500 to-teal-700 flex items-center justify-center text-white text-sm font-semibold shadow-md">
                {user.displayName?.[0] || user.email?.[0] || 'U'}
              </div>
            )}
          </div>
        )}
      </motion.div>
    );
  }

  return (
    <motion.div
      className="w-72 bg-cream-100/80 backdrop-blur-sm border-r border-stone-200 flex flex-col"
      initial={{ width: 72 }}
      animate={{ width: 288 }}
      transition={{ duration: 0.3, ease: EASING.smooth }}
    >
      {/* Header */}
      <div className="p-4 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
          <div className="w-9 h-9 bg-gradient-to-br from-teal-600 to-teal-800 rounded-xl flex items-center justify-center shadow-md">
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14H9V8h2v8zm4 0h-2V8h2v8z"
                fill="white"
              />
            </svg>
          </div>
          <span className="font-bold text-stone-800">Lecture Notes</span>
        </Link>
        <button
          onClick={onToggle}
          className="p-2 text-stone-400 hover:text-stone-800 hover:bg-stone-200 rounded-lg transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
          </svg>
        </button>
      </div>

      {/* New Recording Button */}
      <div className="px-4 mb-4">
        <Link
          href="/record"
          className={`flex items-center justify-center gap-2 w-full px-4 py-3 rounded-xl font-semibold transition-all ${
            pathname === '/record'
              ? 'bg-teal-700 text-white shadow-md'
              : 'bg-teal-900 text-white hover:bg-teal-700 shadow-sm hover:shadow-md'
          }`}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          New Recording
        </Link>
      </div>

      {/* Navigation */}
      <div className="px-4 mb-4">
        <Link
          href="/dashboard"
          className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all ${
            pathname === '/dashboard'
              ? 'bg-stone-200 text-stone-800 font-medium'
              : 'text-stone-600 hover:text-stone-800 hover:bg-stone-100'
          }`}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
          </svg>
          All Lectures
        </Link>
      </div>

      {/* Divider */}
      <div className="mx-4 mb-3 border-t border-stone-200" />

      {/* Folders & Lectures */}
      <div className="flex-1 overflow-y-auto px-4">
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="w-5 h-5 border-2 border-teal-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <FolderTree
            folders={folders}
            lectures={lectures}
            onCreateFolder={handleCreateFolder}
            onRenameFolder={handleRenameFolder}
            onDeleteFolder={handleDeleteFolder}
            onMoveLecture={handleMoveLecture}
          />
        )}
      </div>

      {/* Footer with Home link and User Menu */}
      <div className="p-4 border-t border-stone-200">
        <Link
          href="/"
          className="flex items-center gap-2 px-3 py-2 mb-2 text-sm text-stone-500 hover:text-stone-800 hover:bg-stone-100 rounded-lg transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          About
        </Link>
        <UserMenu />
      </div>
    </motion.div>
  );
}
