import { UserProfile, UserRole } from '../types';
import { getTierForGradeLevel } from '../data/cadresAndLevels';
import { db, auth } from '../lib/firebase';
import {
  doc,
  getDoc,
  setDoc,
  collection,
  getDocs,
  deleteDoc,
  query,
  where
} from 'firebase/firestore';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as fbSignOut
} from 'firebase/auth';

const CURRENT_USER_STORAGE_KEY = 'fcta_cbt_auth_user';
const LOCAL_USERS_KEY = 'fcta_cbt_user_directory';

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

export interface StoredAccount {
  user: UserProfile;
  passwordHash: string;
}

export function getStoredUserDirectory(): Record<string, StoredAccount> {
  let dir: Record<string, StoredAccount> | null = null;
  try {
    const raw = localStorage.getItem(LOCAL_USERS_KEY);
    if (raw) {
      dir = JSON.parse(raw);
    }
  } catch (e) {
    console.error('Error reading local user directory:', e);
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

  // Ensure default accounts exist with their baseline properties
  if (!dir.freelander) {
    dir.freelander = {
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
    };
  }

  if (!dir.system) {
    dir.system = {
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
    };
  }

  localStorage.setItem(LOCAL_USERS_KEY, JSON.stringify(dir));
  return dir;
}

export function saveUserDirectory(dir: Record<string, StoredAccount>): void {
  try {
    localStorage.setItem(LOCAL_USERS_KEY, JSON.stringify(dir));
  } catch (e) {
    console.error('Error saving local user directory:', e);
  }
}

// Get currently authenticated session
export function getCurrentSessionUser(): UserProfile | null {
  try {
    const raw = localStorage.getItem(CURRENT_USER_STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error('Error reading session user:', e);
  }
  return null;
}

// Set active session
export function setCurrentSessionUser(user: UserProfile | null): void {
  if (user) {
    localStorage.setItem(CURRENT_USER_STORAGE_KEY, JSON.stringify(user));
  } else {
    localStorage.removeItem(CURRENT_USER_STORAGE_KEY);
  }
}

// Sync session with Firebase Auth
async function authenticateWithFirebaseAuth(
  email: string,
  pass: string
): Promise<string | null> {
  try {
    const userCred = await signInWithEmailAndPassword(auth, email, pass);
    return userCred.user.uid;
  } catch (err: any) {
    // If user does not exist in Firebase Auth yet, try creating it
    if (
      err?.code === 'auth/user-not-found' ||
      err?.code === 'auth/invalid-credential' ||
      err?.code === 'auth/invalid-login-credentials'
    ) {
      try {
        const newCred = await createUserWithEmailAndPassword(auth, email, pass);
        return newCred.user.uid;
      } catch (createErr: any) {
        // Non-fatal if account creation has network or email-already-in-use constraint
        console.warn('Firebase Auth user creation notice:', createErr?.message);
      }
    }
    return null;
  }
}

// Normalize strings for matching
function normalizeText(val: string): string {
  return val.trim().toLowerCase();
}

function normalizeStaffId(val: string): string {
  return val.replace(/[\/\s\-_.]/g, '').toLowerCase();
}

// Find user in directory by any identifier (Username, Email, Staff ID)
export function findUserInDirectory(identifier: string): { key: string; account: StoredAccount } | null {
  const dir = getStoredUserDirectory();
  const clean = normalizeText(identifier);
  const cleanStaff = normalizeStaffId(identifier);

  for (const [key, account] of Object.entries(dir)) {
    const u = account.user;
    if (
      normalizeText(key) === clean ||
      normalizeText(u.username) === clean ||
      normalizeText(u.email) === clean ||
      normalizeText(u.staffId) === clean ||
      (cleanStaff && normalizeStaffId(u.staffId) === cleanStaff)
    ) {
      return { key, account };
    }
  }

  return null;
}

// LOG IN USER (Supports Username, Email, and FCTA Staff / File No.)
export async function loginUser(identifier: string, password: string): Promise<UserProfile> {
  const cleanId = normalizeText(identifier);
  if (!cleanId) {
    throw new Error('Please enter your Staff Username, Email, or FCTA Staff/File No.');
  }
  if (!password) {
    throw new Error('Please enter your password.');
  }

  const dir = getStoredUserDirectory();
  let found = findUserInDirectory(identifier);

  // If not found in local cache and online, attempt query in Firestore
  if (!found && typeof navigator !== 'undefined' && navigator.onLine) {
    try {
      // 1. Try finding by username
      const qUser = query(collection(db, 'users'), where('username', '==', identifier.trim()));
      let snap = await getDocs(qUser);

      // 2. Try finding by email
      if (snap.empty) {
        const qEmail = query(collection(db, 'users'), where('email', '==', cleanId));
        snap = await getDocs(qEmail);
      }

      // 3. Try finding by staffId
      if (snap.empty) {
        const qStaff = query(
          collection(db, 'users'),
          where('staffId', '==', identifier.trim().toUpperCase())
        );
        snap = await getDocs(qStaff);
      }

      if (!snap.empty) {
        const cloudUser = snap.docs[0].data() as UserProfile;
        const newKey = normalizeText(cloudUser.username);
        // Add to local directory with provided password as hash for future sessions
        dir[newKey] = {
          user: cloudUser,
          passwordHash: password
        };
        saveUserDirectory(dir);
        found = { key: newKey, account: dir[newKey] };
      }
    } catch (err) {
      console.warn('Notice checking user in Firestore:', err);
    }
  }

  // Handle special built-in superadmin Freelander
  if (cleanId === 'freelander' || cleanId === 'freelander@fcta.gov.ng' || cleanId === 'fcta/hq/sa/001') {
    const expected = dir['freelander']?.passwordHash || DEFAULT_ACCOUNTS.superadmin.password;
    if (password !== expected) {
      throw new Error('Invalid password for Super Administrator Freelander.');
    }
    const user = dir['freelander'].user;
    setCurrentSessionUser(user);
    authenticateWithFirebaseAuth(user.email, password).catch(() => {});
    return user;
  }

  // Handle special built-in admin system
  if (cleanId === 'system' || cleanId === 'system@fcta.gov.ng' || cleanId === 'fcta/ict/sys/002') {
    const expected = dir['system']?.passwordHash || DEFAULT_ACCOUNTS.admin.password;
    if (password !== expected) {
      throw new Error('Invalid password for System Administrator.');
    }
    const user = dir['system'].user;
    setCurrentSessionUser(user);
    authenticateWithFirebaseAuth(user.email, password).catch(() => {});
    return user;
  }

  if (!found) {
    throw new Error(
      'Account not found. Please verify your Staff File No., Username, or Official Email, or complete new registration.'
    );
  }

  const { account } = found;
  if (account.passwordHash !== password) {
    throw new Error('Incorrect password. Please verify and try again.');
  }

  setCurrentSessionUser(account.user);

  // Authenticate in Firebase Auth and sync Firestore in background
  authenticateWithFirebaseAuth(account.user.email, password).catch(() => {});
  if (typeof navigator !== 'undefined' && navigator.onLine) {
    try {
      await setDoc(
        doc(db, 'users', account.user.id),
        { ...account.user, updatedAt: new Date().toISOString() },
        { merge: true }
      );
    } catch (e) {
      // Non-blocking
    }
  }

  return account.user;
}

// CANDIDATE REGISTRATION
export async function registerCandidate(params: {
  fullName: string;
  staffId: string;
  username: string;
  email: string;
  password: string;
  cadre: string;
  gradeLevel: string;
}): Promise<UserProfile> {
  const cleanFullName = params.fullName.trim();
  const cleanStaffId = params.staffId.trim().toUpperCase();
  const cleanUsername = params.username.trim().toLowerCase();
  const rawEmail = params.email?.trim() || `${cleanUsername}@fcta.gov.ng`;
  const cleanEmail = rawEmail.toLowerCase();
  const cleanPassword = params.password;

  if (!cleanFullName || cleanFullName.length < 3) {
    throw new Error('Full Name must be at least 3 characters.');
  }

  if (!cleanStaffId || cleanStaffId.length < 3) {
    throw new Error('FCTA Staff / File Number is required.');
  }

  if (!cleanUsername || cleanUsername.length < 3) {
    throw new Error('Desired Username must be at least 3 characters.');
  }

  if (/\s/.test(cleanUsername)) {
    throw new Error('Username cannot contain spaces. Use alphanumeric characters and underscores only.');
  }

  if (!cleanPassword || cleanPassword.length < 6) {
    throw new Error('Password must be at least 6 characters.');
  }

  // Simple email sanity check
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(cleanEmail)) {
    throw new Error('Please provide a valid email address (e.g. officer@fcta.gov.ng).');
  }

  const dir = getStoredUserDirectory();

  // Check duplicate username
  const existingUsername = Object.values(dir).find(
    (a) => normalizeText(a.user.username) === cleanUsername
  );
  if (existingUsername) {
    throw new Error(`Username "${params.username.trim()}" is already registered. Please choose another.`);
  }

  // Check duplicate staff ID
  const existingStaffId = Object.values(dir).find(
    (a) => normalizeStaffId(a.user.staffId) === normalizeStaffId(cleanStaffId)
  );
  if (existingStaffId) {
    throw new Error(
      `FCTA Staff / File No. "${cleanStaffId}" is already registered to ${existingStaffId.user.fullName}.`
    );
  }

  // Check duplicate email
  const existingEmail = Object.values(dir).find(
    (a) => normalizeText(a.user.email) === cleanEmail
  );
  if (existingEmail) {
    throw new Error(`Email "${cleanEmail}" is already registered. Please sign in instead.`);
  }

  // Attempt Firebase Auth sign up first so UID matches security rules
  let firebaseUid: string | null = null;
  if (typeof navigator !== 'undefined' && navigator.onLine) {
    try {
      firebaseUid = await authenticateWithFirebaseAuth(cleanEmail, cleanPassword);
    } catch (fbErr: any) {
      console.warn('Firebase Auth registration note:', fbErr?.message);
    }
  }

  const tier = getTierForGradeLevel(params.gradeLevel);
  const userId = firebaseUid || `cand_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

  const newUser: UserProfile = {
    id: userId,
    username: params.username.trim(),
    fullName: cleanFullName,
    email: cleanEmail,
    staffId: cleanStaffId,
    role: 'candidate',
    cadre: params.cadre,
    gradeLevel: params.gradeLevel,
    difficultyTier: tier,
    mustChangePassword: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  // Save to directory under username key
  dir[cleanUsername] = {
    user: newUser,
    passwordHash: cleanPassword
  };
  saveUserDirectory(dir);

  // Initialize initial candidate progress in local storage
  const initialProg = {
    id: userId,
    userId,
    currentCycle: 1,
    unlockedSet: 1,
    passedSets: [],
    completedCycles: 0,
    answeredQuestionIds: [],
    setBestScores: {},
    updatedAt: new Date().toISOString()
  };
  try {
    localStorage.setItem(`fcta_cbt_prog_${userId}`, JSON.stringify(initialProg));
  } catch (e) {
    // Non-blocking
  }

  // Save to Firestore if online
  if (typeof navigator !== 'undefined' && navigator.onLine) {
    try {
      await setDoc(doc(db, 'users', newUser.id), newUser);
      await setDoc(doc(db, 'progress', newUser.id), initialProg);
    } catch (e) {
      console.warn('Firestore user write note:', e);
    }
  }

  setCurrentSessionUser(newUser);
  return newUser;
}

// LOGOUT
export async function logoutUser(): Promise<void> {
  setCurrentSessionUser(null);
  try {
    await fbSignOut(auth);
  } catch {
    // Ignore
  }
}

// CHANGE PASSWORD
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

  // Update Firestore user document
  if (typeof navigator !== 'undefined' && navigator.onLine) {
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
  }

  return account.user;
}

// ==========================================
// USER MANAGEMENT CONSOLE API
// ==========================================

// Get list of all registered users (merges local directory with Firestore)
export async function getAllUsers(): Promise<UserProfile[]> {
  const dir = getStoredUserDirectory();
  const localList = Object.values(dir).map((a) => a.user);

  // If online, fetch users collection from Firestore to merge any cloud users
  if (typeof navigator !== 'undefined' && navigator.onLine) {
    try {
      const snap = await getDocs(collection(db, 'users'));
      if (!snap.empty) {
        snap.forEach((d) => {
          const cloudUser = d.data() as UserProfile;
          if (cloudUser && cloudUser.username) {
            const key = normalizeText(cloudUser.username);
            if (!dir[key]) {
              dir[key] = {
                user: cloudUser,
                passwordHash: 'fcta2026' // default placeholder if created remotely
              };
            } else {
              // Update with cloud profile if newer
              dir[key].user = { ...dir[key].user, ...cloudUser };
            }
          }
        });
        saveUserDirectory(dir);
        return Object.values(dir).map((a) => a.user);
      }
    } catch (err) {
      console.warn('Notice loading users from Firestore:', err);
    }
  }

  return localList;
}

// Sync users from Firestore explicitly
export async function syncUsersFromFirestore(): Promise<UserProfile[]> {
  const dir = getStoredUserDirectory();
  let count = 0;

  if (typeof navigator !== 'undefined' && navigator.onLine) {
    try {
      const snap = await getDocs(collection(db, 'users'));
      snap.forEach((d) => {
        const u = d.data() as UserProfile;
        if (u && u.username) {
          const key = normalizeText(u.username);
          if (!dir[key]) {
            dir[key] = { user: u, passwordHash: 'fcta2026' };
          } else {
            dir[key].user = { ...dir[key].user, ...u };
          }
          count++;
        }
      });
      saveUserDirectory(dir);
    } catch (e) {
      console.warn('Failed syncing users from firestore:', e);
    }
  }

  return Object.values(dir).map((a) => a.user);
}

// Admin Create User (Can create Candidate, Admin, or Superadmin)
export async function createUserByAdmin(params: {
  fullName: string;
  staffId: string;
  username: string;
  email: string;
  password: string;
  role: UserRole;
  cadre: string;
  gradeLevel: string;
  mustChangePassword?: boolean;
}): Promise<UserProfile> {
  const cleanFullName = params.fullName.trim();
  const cleanStaffId = params.staffId.trim().toUpperCase();
  const cleanUsername = params.username.trim().toLowerCase();
  const cleanEmail = (params.email?.trim() || `${cleanUsername}@fcta.gov.ng`).toLowerCase();
  const cleanPassword = params.password.trim();

  if (!cleanFullName || cleanFullName.length < 3) {
    throw new Error('Full Name must be at least 3 characters.');
  }
  if (!cleanStaffId) {
    throw new Error('FCTA Staff / File No. is required.');
  }
  if (!cleanUsername) {
    throw new Error('Username is required.');
  }
  if (/\s/.test(cleanUsername)) {
    throw new Error('Username cannot contain spaces.');
  }
  if (!cleanPassword || cleanPassword.length < 6) {
    throw new Error('Initial password must be at least 6 characters.');
  }

  const dir = getStoredUserDirectory();

  // Check conflicts
  if (dir[cleanUsername]) {
    throw new Error(`Username "${params.username}" is already in use.`);
  }

  const existingStaff = Object.values(dir).find(
    (a) => normalizeStaffId(a.user.staffId) === normalizeStaffId(cleanStaffId)
  );
  if (existingStaff) {
    throw new Error(`Staff / File No. "${cleanStaffId}" is already assigned to ${existingStaff.user.fullName}.`);
  }

  const tier = getTierForGradeLevel(params.gradeLevel);
  const userId = `user_${params.role}_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;

  const newUser: UserProfile = {
    id: userId,
    username: params.username.trim(),
    fullName: cleanFullName,
    email: cleanEmail,
    staffId: cleanStaffId,
    role: params.role,
    cadre: params.cadre,
    gradeLevel: params.gradeLevel,
    difficultyTier: tier,
    mustChangePassword: params.mustChangePassword ?? true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  dir[cleanUsername] = {
    user: newUser,
    passwordHash: cleanPassword
  };
  saveUserDirectory(dir);

  // Initialize progress if candidate
  if (params.role === 'candidate') {
    const initialProg = {
      id: userId,
      userId,
      currentCycle: 1,
      unlockedSet: 1,
      passedSets: [],
      completedCycles: 0,
      answeredQuestionIds: [],
      setBestScores: {},
      updatedAt: new Date().toISOString()
    };
    try {
      localStorage.setItem(`fcta_cbt_prog_${userId}`, JSON.stringify(initialProg));
      if (typeof navigator !== 'undefined' && navigator.onLine) {
        await setDoc(doc(db, 'progress', userId), initialProg);
      }
    } catch {
      // Non-blocking
    }
  }

  // Sync to Firestore
  if (typeof navigator !== 'undefined' && navigator.onLine) {
    try {
      await setDoc(doc(db, 'users', userId), newUser);
    } catch (e) {
      console.warn('Firestore user creation warning:', e);
    }
  }

  return newUser;
}

// Admin Update User
export async function updateUserByAdmin(
  userId: string,
  updates: Partial<UserProfile>
): Promise<UserProfile> {
  const dir = getStoredUserDirectory();
  const foundKey = Object.keys(dir).find((k) => dir[k].user.id === userId);
  if (!foundKey) {
    throw new Error('User not found in directory.');
  }

  const current = dir[foundKey].user;
  const gradeLevel = updates.gradeLevel || current.gradeLevel;
  const tier = updates.gradeLevel ? getTierForGradeLevel(gradeLevel) : (updates.difficultyTier ?? current.difficultyTier);

  const updatedUser: UserProfile = {
    ...current,
    ...updates,
    gradeLevel,
    difficultyTier: tier,
    updatedAt: new Date().toISOString()
  };

  dir[foundKey].user = updatedUser;
  saveUserDirectory(dir);

  // If updating current active session user, update session
  const currentSession = getCurrentSessionUser();
  if (currentSession && currentSession.id === userId) {
    setCurrentSessionUser(updatedUser);
  }

  // Sync to Firestore
  if (typeof navigator !== 'undefined' && navigator.onLine) {
    try {
      await setDoc(doc(db, 'users', userId), updatedUser, { merge: true });
    } catch (e) {
      console.warn('Firestore user update warning:', e);
    }
  }

  return updatedUser;
}

// Admin Reset Password
export async function resetUserPasswordByAdmin(
  userId: string,
  newPassword: string,
  mustChangePassword: boolean = true
): Promise<void> {
  const trimmed = newPassword.trim();
  if (trimmed.length < 6) {
    throw new Error('Password must be at least 6 characters.');
  }

  const dir = getStoredUserDirectory();
  const foundKey = Object.keys(dir).find((k) => dir[k].user.id === userId);
  if (!foundKey) {
    throw new Error('User not found in directory.');
  }

  dir[foundKey].passwordHash = trimmed;
  dir[foundKey].user.mustChangePassword = mustChangePassword;
  dir[foundKey].user.updatedAt = new Date().toISOString();
  saveUserDirectory(dir);

  // If modifying current session user, update session
  const currentSession = getCurrentSessionUser();
  if (currentSession && currentSession.id === userId) {
    setCurrentSessionUser(dir[foundKey].user);
  }

  // Update in Firestore
  if (typeof navigator !== 'undefined' && navigator.onLine) {
    try {
      await setDoc(
        doc(db, 'users', userId),
        {
          mustChangePassword,
          updatedAt: new Date().toISOString()
        },
        { merge: true }
      );
    } catch (e) {
      console.warn('Firestore password reset warning:', e);
    }
  }
}

// Admin Delete User
export async function deleteUserByAdmin(userId: string): Promise<void> {
  const dir = getStoredUserDirectory();
  const foundKey = Object.keys(dir).find((k) => dir[k].user.id === userId);
  if (!foundKey) {
    throw new Error('User not found in directory.');
  }

  // Safety: Prevent deleting Freelander (the default superadmin)
  if (foundKey.toLowerCase() === 'freelander' || dir[foundKey].user.username.toLowerCase() === 'freelander') {
    throw new Error('Security Violation: The primary Super Administrator Freelander cannot be deleted.');
  }

  delete dir[foundKey];
  saveUserDirectory(dir);

  // Clean local progress / attempt caches
  try {
    localStorage.removeItem(`fcta_cbt_prog_${userId}`);
    localStorage.removeItem(`fcta_cbt_att_${userId}`);
  } catch {
    // Non-blocking
  }

  // Delete from Firestore
  if (typeof navigator !== 'undefined' && navigator.onLine) {
    try {
      await deleteDoc(doc(db, 'users', userId));
    } catch (e) {
      console.warn('Firestore user deletion warning:', e);
    }
  }
}

// Export users as CSV
export function exportUsersCSV(users: UserProfile[]): string {
  const headers = [
    'User ID',
    'Full Name',
    'FCTA Staff / File No.',
    'Username',
    'Email',
    'Role',
    'Cadre',
    'Grade Level',
    'Difficulty Tier',
    'Must Change Password',
    'Registered At'
  ];

  const rows = users.map((u) => [
    `"${u.id}"`,
    `"${u.fullName.replace(/"/g, '""')}"`,
    `"${u.staffId}"`,
    `"${u.username}"`,
    `"${u.email}"`,
    `"${u.role.toUpperCase()}"`,
    `"${u.cadre.replace(/"/g, '""')}"`,
    `"${u.gradeLevel}"`,
    `"Tier ${u.difficultyTier}"`,
    `"${u.mustChangePassword ? 'YES' : 'NO'}"`,
    `"${u.createdAt || ''}"`
  ]);

  return [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
}
