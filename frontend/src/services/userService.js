import { collection, deleteDoc, doc, getDoc, getDocs, setDoc, updateDoc } from 'firebase/firestore';
import { auth, db } from '../lib/firebase';

const usersCollection = collection(db, 'users');
const allUsers = async () => {
  if (!auth.currentUser) return [];
  const currentUser = await getDoc(doc(db, 'users', auth.currentUser.uid));
  if (!currentUser.exists() || currentUser.data().role !== 'admin') return [];
  return (await getDocs(usersCollection)).docs.map((item) => ({ id: item.id, ...item.data() }));
};

export const userService = {
  getUsers: allUsers,
  getUserById: async (userId) => {
    const snapshot = await getDoc(doc(db, 'users', userId));
    return snapshot.exists() ? { id: snapshot.id, ...snapshot.data() } : null;
  },
  toggleUserStatus: async (userId) => {
    const user = await userService.getUserById(userId);
    if (!user) throw new Error('User not found.');
    const status = user.status === 'Active' ? 'Suspended' : 'Active';
    await updateDoc(doc(db, 'users', userId), { status });
    return { ...user, status };
  },
  addUser: async (userData) => {
    if (!auth.currentUser) throw new Error('Sign in before adding a user profile.');
    const id = userData.id || crypto.randomUUID();
    const data = { ...userData, id, role: userData.role || 'user', status: 'Active', registeredAt: new Date().toISOString().split('T')[0] };
    await setDoc(doc(db, 'users', id), data);
    return data;
  },
  deleteUser: async (userId) => {
    await deleteDoc(doc(db, 'users', userId));
    return { success: true, id: userId };
  },
};
