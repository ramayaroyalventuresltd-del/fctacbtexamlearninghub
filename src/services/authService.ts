import { UserProfile, UserRole } from '../types';
import { getTierForGradeLevel } from '../data/cadresAndLevels';
import { db, auth, handleFirestoreError, OperationType } from '../lib/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as fbSignOut,
  onAuthStateChanged,
  User as FirebaseUser
} from 'firebase/auth';

const CURRENT_USER_STORAGE_KEY = 'fcta_cbt_auth_user';

// Built-in credential maps as instructed by the user brief
export const DEFAULT_ACCOUNTS = {
  superadmin: {
    username: 'Freelander',
    password: '654321',
    email: 'freelander@fcta.gov.ng',
    role: 'superadmin' as UserRole,
    fullName: 'Freelander (Super Administrator)',
    staffId: 'FCTA/HQ/SA/001',
    cadre: 'Administrative Officer',
    gradeLevel: 'GL 17',
    difficultyTier: 4,
    mustChangePassword: true
  },
  admin: {
    username: 'system',
    password: '123456',
    email: 'system@fcta.gov.ng',
    role: 'admin' as UserRole,
    fullName: 'System Administrator',
    staffId: 'FCTA/ICT/SYS/002',
    cadre: 'Computer / IT Officer (Systems Analyst)',
    gradeLevel: 'GL 15',
    difficultyTier: 4,
    mustChangePassword: true
  }
};

// Registered local cache of users (seeded with default admins + demo candidate)
const LOCAL_USERS_KEY = 'fcta_cbt_user_directory';

function getStoredUserDirectory(): Record<string, { user: UserProfile; passwordHash: string }> {
  let dir: Record<string, { user: UserProfile; passwordHash: string }> | null = null;
  try {
    const raw = localStorage.getItem(LOCAL_USERS_KEY);
    if (raw) {
      dir = JSON.parse(raw);
    }
  } catch (e) {
    console.error(e);
  }

  // Initial seed if not present
  if (!dir) {
    dir = {
      freelander: {
        user: {
          id: 'user_freelander_superadmin',
          username: 'Freelander',
          fullName: 'Freelander (Super Administrator)',
          email: 'freelander@fcta.gov.ng',
          staffId: 'FCTA/HQ/SA/001',
          role: 'superadmin',
          cadre: 'Administrative Officer',
          gradeLevel: 'GL 17',
          difficultyTier: 4,
          mustChangePassword: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        passwordHash: '654321'
      },
      system: {
        user: {
          id: 'user_system_admin',
          username: 'system',
          fullName: 'System Administrator',
          email: 'system@fcta.gov.ng',
          staffId: 'FCTA/ICT/SYS/002',
          role: 'admin',
          cadre: 'Computer / IT Officer (Systems Analyst)',
          gradeLevel: 'GL 15',
          difficultyTier: 4,
          mustChangePassword: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        passwordHash: '123456'
      },
      ibrahim: {
        user: {
          id: 'user_demo_candidate',
          username: 'ibrahim',
          fullName: 'Ibrahim Danladi',
          email: 'i.danladi@fcta.gov.ng',
          staffId: 'FCTA/AGS/2019/4412',
          role: 'candidate',
          cadre: 'Administrative Officer',
          gradeLevel: 'GL 09',
          difficultyTier: 2,
          mustChangePassword: false,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        passwordHash: 'password123'
      }
    };
  }

  // Enforce mandatory password change for default administrators if not yet changed
  if (dir.freelander) {
    if (!dir.freelander.user.passwordChangedAt && dir.freelander.passwordHash === '654321') {
      dir.freelander.user.mustChangePassword = true;
    }
  }
  if (dir.system) {
    if (!dir.system.user.passwordChangedAt && dir.system.passwordHash === '123456') {
      dir.system.user.mustChangePassword = true;
    }
  }

  localStorage.setItem(LOCAL_USERS_KEY, JSON.stringify(dir));
  return dir;
}

function saveUserDirectory(dir: Record<string, { user: UserProfile; passwordHash: string }>) {
  try {
    localStorage.setItem(LOCAL_USERS_KEY, JSON.stringify(dir));
  } catch (e) {
    console.error(e);
  }
}

// Get currently authenticated session
export function getCurrentSessionUser(): UserProfile | null {
  try {
    const raw = localStorage.getItem(CURRENT_USER_STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error(e);
  }
  return null;
}

// Set active session
export function setCurrentSessionUser(user: UserProfile | null) {
  if (user) {
    localStorage.setItem(CURRENT_USER_STORAGE_KEY, JSON.stringify(user));
  } else {
    localStorage.removeItem(CURRENT_USER_STORAGE_KEY);
  }
}

// Attempt Firebase Auth sign-in or fallback gracefully to local synced directory
async function syncWithFirebaseAuth(email: string, pass: string): Promise<string | null> {
  try {
    const userCred = await signInWithEmailAndPassword(auth, email, pass);
    return userCred.user.uid;
  } catch (err: any) {
    // If user does not exist in Firebase Auth yet, try creating it
    if (err?.code === 'auth/user-not-found' || err?.code === 'auth/invalid-credential') {
      try {
        const newCred = await createUserWithEmailAndPassword(auth, email, pass);
        return newCred.user.uid;
      } catch (createErr) {
        // Can fail if password is too short or email formatted specifically
      }
    }
    return null;
  }
}

// Log in via username OR email
export async function loginUser(identifier: string, password: string): Promise<UserProfile> {
  const cleanId = identifier.trim().toLowerCase();
  const dir = getStoredUserDirectory();

  // Search by username or email
  let foundKey = Object.keys(dir).find(
    (k) => k.toLowerCase() === cleanId || dir[k].user.email.toLowerCase() === cleanId
  );

  // Check built-in Freelander
  if (cleanId === 'freelander' || cleanId === 'freelander@fcta.gov.ng') {
    const expected = dir['freelander']?.passwordHash || '654321';
    if (password !== expected) {
      throw new Error('Invalid password for Super Administrator Freelander.');
    }
    const user = dir['freelander'].user;
    setCurrentSessionUser(user);
    // Background Firebase Auth sync
    syncWithFirebaseAuth(user.email, expected + '_secure').catch(() => {});
    return user;
  }

  // Check built-in system
  if (cleanId === 'system' || cleanId === 'system@fcta.gov.ng') {
    const expected = dir['system']?.passwordHash || '123456';
    if (password !== expected) {
      throw new Error('Invalid password for System Administrator.');
    }
    const user = dir['system'].user;
    setCurrentSessionUser(user);
    // Background Firebase Auth sync
    syncWithFirebaseAuth(user.email, expected + '_secure').catch(() => {});
    return user;
  }

  if (!foundKey) {
    throw new Error('User not found. Please register first or check your Staff Username/Email.');
  }

  const account = dir[foundKey];
  if (account.passwordHash !== password) {
    throw new Error('Incorrect password. Please verify and try again.');
  }

  setCurrentSessionUser(account.user);

  // Sync with Firestore profile if online
  try {
    await setDoc(doc(db, 'users', account.user.id), account.user, { merge: true });
  } catch (e) {
    // Non-blocking
  }

  return account.user;
}

// Candidate Registration
export async function registerCandidate(params: {
  fullName: string;
  staffId: string;
  username: string;
  email: string;
  password: string;
  cadre: string;
  gradeLevel: string;
}): Promise<UserProfile> {
  const cleanUsername = params.username.trim().toLowerCase();
  const dir = getStoredUserDirectory();

  if (dir[cleanUsername]) {
    throw new Error(`Username "${params.username}" is already taken. Please choose another.`);
  }

  const tier = getTierForGradeLevel(params.gradeLevel);
  const userId = `cand_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;

  const newUser: UserProfile = {
    id: userId,
    username: params.username.trim(),
    fullName: params.fullName.trim(),
    email: params.email.trim().toLowerCase(),
    staffId: params.staffId.trim().toUpperCase(),
    role: 'candidate',
    cadre: params.cadre,
    gradeLevel: params.gradeLevel,
    difficultyTier: tier,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  // Save to directory
  dir[cleanUsername] = {
    user: newUser,
    passwordHash: params.password
  };
  saveUserDirectory(dir);
  setCurrentSessionUser(newUser);

  // Background sync with Firebase
  try {
    await setDoc(doc(db, 'users', newUser.id), newUser);
  } catch (e) {
    console.warn('Firestore user write note:', e);
  }

  syncWithFirebaseAuth(newUser.email, params.password).catch(() => {});

  return newUser;
}

// Logout
export async function logoutUser(): Promise<void> {
  setCurrentSessionUser(null);
  try {
    await fbSignOut(auth);
  } catch {
    // Ignore
  }
}

// Change password (mandatory on first login for Super Administrator and System Administrator)
export async function changeUserPassword(
  userId: string,
  currentPassword: string,
  newPassword: string
): Promise<UserProfile> {
  const trimmedNew = newPassword.trim();
  if (trimmedNew.length < 6) {
    throw new Error('New password must contain at least 6 characters for official security compliance.');
  }

  const dir = getStoredUserDirectory();
  // Find key corresponding to this userId
  const foundKey = Object.keys(dir).find((k) => dir[k].user.id === userId);
  if (!foundKey) {
    throw new Error('User profile not found in directory.');
  }

  const account = dir[foundKey];
  if (account.passwordHash !== currentPassword) {
    throw new Error('Current password is incorrect. Please verify your existing password.');
  }

  if (currentPassword === trimmedNew) {
    throw new Error('New password cannot be identical to the initial default password.');
  }

  account.passwordHash = trimmedNew;
  account.user.mustChangePassword = false;
  account.user.passwordChangedAt = new Date().toISOString();
  account.user.updatedAt = new Date().toISOString();

  saveUserDirectory(dir);
  setCurrentSessionUser(account.user);

  // Sync to Firestore if available
  try {
    await setDoc(
      doc(db, 'users', account.user.id),
      {
        ...account.user,
        mustChangePassword: false,
        passwordChangedAt: account.user.passwordChangedAt
      },
      { merge: true }
    );
  } catch (err) {
    console.warn('Notice saving updated password state to Firestore:', err);
  }

  return account.user;
}

// Retrieve all registered staff/candidates for administrator review
export function getAllRegisteredUsers(): UserProfile[] {
  const dir = getStoredUserDirectory();
  return Object.values(dir).map((item) => item.user);
}

// Administrative password reset for staff/candidates
export function adminResetUserPassword(userId: string, tempPassword: string = 'password123'): boolean {
  const dir = getStoredUserDirectory();
  const foundKey = Object.keys(dir).find((k) => dir[k].user.id === userId);
  if (!foundKey) return false;
  dir[foundKey].passwordHash = tempPassword;
  dir[foundKey].user.updatedAt = new Date().toISOString();
  saveUserDirectory(dir);
  return true;
}
