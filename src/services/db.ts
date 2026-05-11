import { db, OperationType, handleFirestoreError } from '../firebase/config';
import { collection, doc, setDoc, updateDoc, deleteDoc, getDocs, query, where, onSnapshot } from 'firebase/firestore';
import { Child } from '../types';

export const childrenRef = collection(db, 'children');

export const getChildrenQuery = (userId: string) => query(childrenRef, where('ownerId', '==', userId));

export const subscribeToChildren = (userId: string, callback: (children: Child[]) => void) => {
  const q = getChildrenQuery(userId);
  return onSnapshot(q, (snapshot) => {
    const kids = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Child));
    callback(kids);
  }, (error) => {
    handleFirestoreError(error, OperationType.LIST, 'children');
  });
};

export const addChild = async (child: Omit<Child, 'id'>) => {
  try {
    const newDoc = doc(childrenRef);
    await setDoc(newDoc, child);
    return newDoc.id;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, 'children');
  }
};

export const updateChild = async (id: string, updates: Partial<Omit<Child, 'id' | 'ownerId' | 'createdAt'>>) => {
  try {
    const docRef = doc(childrenRef, id);
    await updateDoc(docRef, { ...updates, updatedAt: Date.now() });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `children/${id}`);
  }
};

export const deleteChildRecord = async (id: string) => {
  try {
    const docRef = doc(childrenRef, id);
    await deleteDoc(docRef);
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `children/${id}`);
  }
};
