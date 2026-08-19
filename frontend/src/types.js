/**
 * Data structures used across Shield Safety App
 * 
 * Beginner friendly JavaScript schemas and sample defaults.
 */

// Sample default user structure
export const defaultUser = {
  id: '',
  name: '',
  email: '',
  phone: '',
  emergencyPin: '9911',
  avatarBg: 'bg-red-600',
  bloodGroup: 'O+',
  medicalNotes: ''
};

// Sample default guardian structure
export const defaultGuardian = {
  id: '',
  name: '',
  phone: '',
  relationship: '',
  isPrimary: false,
  status: 'Online',
  avatarBg: 'bg-blue-500',
  lastActive: 'Just now'
};
