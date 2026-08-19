import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
} from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { auth, db } from '../lib/firebase';

const profileRef = (uid) => doc(db, 'users', uid);

const toProfile = (firebaseUser, data = {}) => ({
  id: firebaseUser.uid,
  name: data.name || firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'Shield User',
  email: firebaseUser.email || data.email || '',
  phone: data.phone || '',
  role: data.role || 'user',
  emergencyPin: data.emergencyPin || '9911',
  bloodGroup: data.bloodGroup || 'O+',
  medicalNotes: data.medicalNotes || '',
  avatarBg: data.avatarBg || 'bg-[#9e6133]',
  status: data.status || 'Active',
  registeredAt: data.registeredAt || new Date().toISOString().split('T')[0],
});

const loadProfile = async (firebaseUser) => {
  const reference = profileRef(firebaseUser.uid);
  const snapshot = await getDoc(reference);
  if (snapshot.exists()) return toProfile(firebaseUser, snapshot.data());

  const profile = toProfile(firebaseUser);
  await setDoc(reference, { ...profile, id: firebaseUser.uid });
  return profile;
};

export const authService = {
  login: async (email, password) => {
    const credential = await signInWithEmailAndPassword(auth, email.trim(), password);
    const user = await loadProfile(credential.user);
    return { success: true, token: await credential.user.getIdToken(), user };
  },

  register: async (userData) => {
    const credential = await createUserWithEmailAndPassword(
      auth,
      userData.email.trim(),
      userData.password
    );
    const user = toProfile(credential.user, userData);
    // Roles are always created as "user". Promote administrators only through
    // trusted server-side tooling or the Firebase console.
    user.role = 'user';
    await setDoc(profileRef(credential.user.uid), { ...user, id: credential.user.uid });
    return { success: true, token: await credential.user.getIdToken(), user };
  },

  logout: () => signOut(auth),

  getCurrentUser: async () => (auth.currentUser ? loadProfile(auth.currentUser) : null),

  updateProfile: async (userIdOrUser, updateData) => {
    const userId = typeof userIdOrUser === 'object' ? userIdOrUser.id : userIdOrUser;
    const data = typeof userIdOrUser === 'object' ? userIdOrUser : updateData;
    if (!auth.currentUser || auth.currentUser.uid !== userId) {
      throw new Error('You can only update your own profile.');
    }
    const { id, email, role, ...safeData } = data;
    await updateDoc(profileRef(userId), safeData);
    return loadProfile(auth.currentUser);
  },
};
