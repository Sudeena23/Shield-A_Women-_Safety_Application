import { addDoc, collection, deleteDoc, doc, getDocs, updateDoc, writeBatch } from 'firebase/firestore';
import { auth, db } from '../lib/firebase';

const guardiansCollection = () => {
  if (!auth.currentUser) return null;
  return collection(db, 'users', auth.currentUser.uid, 'guardians');
};

const list = async () => {
  const reference = guardiansCollection();
  if (!reference) return [];
  return (await getDocs(reference)).docs.map((item) => ({ id: item.id, ...item.data() }));
};

export const guardianService = {
  getGuardians: list,

  addGuardian: async (guardianData) => {
    if (!auth.currentUser) throw new Error('Sign in to manage guardians.');
    const currentGuardians = await list();
    const data = {
      name: guardianData.name,
      phone: guardianData.phone,
      relationship: guardianData.relationship || 'Friend',
      isPrimary: Boolean(guardianData.isPrimary),
      status: 'Online',
      avatarBg: guardianData.avatarBg || 'bg-[#9e6133]',
      lastActive: 'Just now',
    };
    if (data.isPrimary) await Promise.all(currentGuardians.filter((g) => g.isPrimary).map((g) => updateDoc(doc(guardiansCollection(), g.id), { isPrimary: false })));
    const created = await addDoc(guardiansCollection(), data);
    return { id: created.id, ...data };
  },

  updateGuardian: async (id, guardianData) => {
    if (!auth.currentUser) throw new Error('Sign in to manage guardians.');
    const { id: ignored, ...data } = guardianData;
    if (data.isPrimary) await guardianService.setPrimaryGuardian(id);
    await updateDoc(doc(guardiansCollection(), id), data);
    return { id, ...data };
  },

  deleteGuardian: async (id) => {
    if (!auth.currentUser) throw new Error('Sign in to manage guardians.');
    await deleteDoc(doc(guardiansCollection(), id));
    return { success: true, id };
  },

  setPrimaryGuardian: async (id) => {
    if (!auth.currentUser) throw new Error('Sign in to manage guardians.');
    const batch = writeBatch(db);
    (await list()).forEach((guardian) => batch.update(doc(guardiansCollection(), guardian.id), { isPrimary: guardian.id === id }));
    await batch.commit();
    return list();
  },
};
