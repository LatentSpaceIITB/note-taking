import {
  collection,
  doc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
  serverTimestamp,
  type Timestamp,
} from 'firebase/firestore';
import { db, isFirebaseConfigured } from './firebase';

export interface Folder {
  id: string;
  name: string;
  color: string;
  order: number;
  createdAt?: Timestamp;
}

const FOLDER_COLORS = [
  '#3B82F6', // blue
  '#8B5CF6', // purple
  '#10B981', // green
  '#F59E0B', // amber
  '#EF4444', // red
  '#EC4899', // pink
  '#06B6D4', // cyan
  '#84CC16', // lime
];

export function getRandomColor(): string {
  return FOLDER_COLORS[Math.floor(Math.random() * FOLDER_COLORS.length)];
}

export async function getFolders(userId: string): Promise<Folder[]> {
  if (!isFirebaseConfigured) {
    console.warn('Firebase not configured');
    return [];
  }

  const foldersRef = collection(db, 'users', userId, 'folders');
  const q = query(foldersRef, orderBy('order', 'asc'));
  const snapshot = await getDocs(q);

  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
  } as Folder));
}

export async function createFolder(
  userId: string,
  name: string,
  color?: string
): Promise<string> {
  if (!isFirebaseConfigured) {
    throw new Error('Firebase not configured');
  }

  const foldersRef = collection(db, 'users', userId, 'folders');
  const existingFolders = await getFolders(userId);
  const maxOrder = existingFolders.reduce((max, f) => Math.max(max, f.order), -1);

  const folderRef = doc(foldersRef);
  const folder = {
    name,
    color: color || getRandomColor(),
    order: maxOrder + 1,
    createdAt: serverTimestamp(),
  };

  await setDoc(folderRef, folder);
  return folderRef.id;
}

export async function updateFolder(
  userId: string,
  folderId: string,
  data: Partial<Pick<Folder, 'name' | 'color' | 'order'>>
): Promise<void> {
  if (!isFirebaseConfigured) {
    throw new Error('Firebase not configured');
  }

  const folderRef = doc(db, 'users', userId, 'folders', folderId);
  await updateDoc(folderRef, data);
}

export async function deleteFolder(userId: string, folderId: string): Promise<void> {
  if (!isFirebaseConfigured) {
    throw new Error('Firebase not configured');
  }

  const folderRef = doc(db, 'users', userId, 'folders', folderId);
  await deleteDoc(folderRef);
}

export async function reorderFolders(
  userId: string,
  folderIds: string[]
): Promise<void> {
  if (!isFirebaseConfigured) {
    throw new Error('Firebase not configured');
  }

  const updates = folderIds.map((id, index) =>
    updateFolder(userId, id, { order: index })
  );

  await Promise.all(updates);
}
