import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, Material, Question, ExamResult } from '../types';
import { INITIAL_ADMIN, INITIAL_TEACHER, INITIAL_STUDENTS, INITIAL_MATERIALS, INITIAL_QUESTIONS, INITIAL_RESULTS } from '../data/dummyData';
import { db, handleFirestoreError, OperationType, testFirestoreConnection } from '../services/firebase';
import { collection, doc, setDoc, getDocs, updateDoc, deleteDoc } from 'firebase/firestore';

interface AuthContextType {
  currentUser: User | null;
  users: User[];
  materials: Material[];
  questions: Question[];
  results: ExamResult[];
  testDurationMinutes: number;
  testPassingScore: number;
  login: (username: string, pass: string, expectedRole?: User['role']) => { success: boolean; message?: string; role?: User['role'] };
  logout: () => void;
  switchUser: (userId: string) => void;
  // User Management
  addUser: (userData: Omit<User, 'id' | 'createdAt'>) => Promise<void>;
  updateUser: (userData: User) => Promise<void>;
  deleteUser: (userId: string) => Promise<void>;
  resetPassword: (userId: string, newPass?: string) => Promise<void>;
  // Material Management
  addMaterial: (mat: Omit<Material, 'id' | 'createdAt'>) => Promise<void>;
  updateMaterial: (mat: Material) => Promise<void>;
  deleteMaterial: (matId: string) => Promise<void>;
  // Question Management
  addQuestion: (q: Omit<Question, 'id'>) => Promise<void>;
  updateQuestion: (q: Question) => Promise<void>;
  deleteQuestion: (qId: string) => Promise<void>;
  // Test Settings
  updateTestSettings: (duration: number, passingScore: number) => void;
  // Results
  submitResult: (res: Omit<ExamResult, 'id' | 'tanggal'>) => Promise<void>;
  addTeacherFeedback: (resId: string, feedback: string) => Promise<void>;
  addStudentXP: (userId: string, points: number) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const STORAGE_KEYS = {
  CURRENT_USER: 'pai_waris_current_user',
  USERS: 'pai_waris_users',
  MATERIALS: 'pai_waris_materials',
  QUESTIONS: 'pai_waris_questions',
  RESULTS: 'pai_waris_results',
  TEST_SETTINGS: 'pai_waris_test_settings',
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Initialize state from local cache or dummy seeds
  const [users, setUsers] = useState<User[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.USERS);
    if (saved) {
      try {
        const parsed: User[] = JSON.parse(saved);
        // Ensure INITIAL_ADMIN is always included if missing
        if (!parsed.some(u => u.role === 'admin' || u.username === 'admin')) {
          return [INITIAL_ADMIN, ...parsed];
        }
        return parsed;
      } catch (e) { /* ignore */ }
    }
    return [INITIAL_ADMIN, INITIAL_TEACHER, ...INITIAL_STUDENTS];
  });

  // By default, currentUser is null so the login page appears whenever opening the application
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    // Clean up any legacy auto-login data so the login screen always appears on link open
    try {
      localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
    } catch (e) { /* ignore */ }
    return null;
  });

  const [materials, setMaterials] = useState<Material[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.MATERIALS);
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { /* ignore */ }
    }
    return INITIAL_MATERIALS;
  });

  const [questions, setQuestions] = useState<Question[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.QUESTIONS);
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { /* ignore */ }
    }
    return INITIAL_QUESTIONS;
  });

  const [results, setResults] = useState<ExamResult[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.RESULTS);
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { /* ignore */ }
    }
    return INITIAL_RESULTS;
  });

  const [testDurationMinutes, setTestDurationMinutes] = useState<number>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.TEST_SETTINGS);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return parsed.duration || 20;
      } catch (e) { /* ignore */ }
    }
    return 20;
  });

  const [testPassingScore, setTestPassingScore] = useState<number>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.TEST_SETTINGS);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return parsed.passingScore || 75;
      } catch (e) { /* ignore */ }
    }
    return 75;
  });

  // Sync to LocalStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
  }, [users]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.MATERIALS, JSON.stringify(materials));
  }, [materials]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.QUESTIONS, JSON.stringify(questions));
  }, [questions]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.RESULTS, JSON.stringify(results));
  }, [results]);

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(currentUser));
    } else {
      localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
    }
  }, [currentUser]);

  // Boot connection check & Firestore sync
  useEffect(() => {
    let isMounted = true;
    const initFirestoreSync = async () => {
      const isOnline = await testFirestoreConnection();
      if (!isOnline || !isMounted) return;

      try {
        // Fetch users if existing
        const userSnap = await getDocs(collection(db, 'users'));
        if (userSnap.empty) {
          // Seed users
          for (const u of [INITIAL_ADMIN, INITIAL_TEACHER, ...INITIAL_STUDENTS]) {
            await setDoc(doc(db, 'users', u.id), u);
          }
        } else {
          const remoteUsers: User[] = [];
          userSnap.forEach(d => remoteUsers.push(d.data() as User));
          if (remoteUsers.length > 0 && isMounted) setUsers(remoteUsers);
        }
      } catch (err) {
        handleFirestoreError(err, OperationType.GET, 'users');
      }

      try {
        // Fetch materials
        const matSnap = await getDocs(collection(db, 'materials'));
        if (matSnap.empty) {
          for (const m of INITIAL_MATERIALS) {
            await setDoc(doc(db, 'materials', m.id), m);
          }
        } else {
          const remoteMats: Material[] = [];
          matSnap.forEach(d => remoteMats.push(d.data() as Material));
          if (remoteMats.length > 0 && isMounted) setMaterials(remoteMats);
        }
      } catch (err) {
        handleFirestoreError(err, OperationType.GET, 'materials');
      }

      try {
        // Fetch questions
        const qSnap = await getDocs(collection(db, 'questions'));
        if (qSnap.empty) {
          for (const q of INITIAL_QUESTIONS) {
            await setDoc(doc(db, 'questions', q.id), q);
          }
        } else {
          const remoteQ: Question[] = [];
          qSnap.forEach(d => remoteQ.push(d.data() as Question));
          if (remoteQ.length > 0 && isMounted) setQuestions(remoteQ);
        }
      } catch (err) {
        handleFirestoreError(err, OperationType.GET, 'questions');
      }

      try {
        // Fetch results
        const resSnap = await getDocs(collection(db, 'results'));
        if (resSnap.empty) {
          for (const r of INITIAL_RESULTS) {
            await setDoc(doc(db, 'results', r.id), r);
          }
        } else {
          const remoteRes: ExamResult[] = [];
          resSnap.forEach(d => remoteRes.push(d.data() as ExamResult));
          if (remoteRes.length > 0 && isMounted) setResults(remoteRes);
        }
      } catch (err) {
        handleFirestoreError(err, OperationType.GET, 'results');
      }
    };

    initFirestoreSync();
    return () => { isMounted = false; };
  }, []);

  // Authentication
  const login = (
    username: string,
    pass: string,
    expectedRole?: User['role']
  ): { success: boolean; message?: string; role?: User['role'] } => {
    const trimmed = username.trim().toLowerCase();
    const found = users.find(u => u.username.toLowerCase() === trimmed);
    if (!found) {
      return {
        success: false,
        message: 'Username tidak ditemukan. Pastikan username sudah benar atau terdaftar di sistem.',
      };
    }
    if (found.password && found.password !== pass) {
      return {
        success: false,
        message: 'Password / Kata sandi tidak sesuai. Periksa kembali huruf besar/kecil.',
      };
    }
    if (expectedRole && found.role !== expectedRole) {
      const roleLabelMap: Record<string, string> = {
        admin: 'Administrator',
        guru: 'Guru PAI',
        siswa: 'Siswa',
      };
      const foundLabel = roleLabelMap[found.role] || found.role;
      return {
        success: false,
        message: `Akun ini terdaftar sebagai ${foundLabel}. Silakan gunakan portal/tab "${foundLabel}" untuk masuk.`,
      };
    }
    setCurrentUser(found);
    return { success: true, role: found.role };
  };

  const logout = () => {
    setCurrentUser(null);
  };

  const switchUser = (userId: string) => {
    const found = users.find(u => u.id === userId);
    if (found) setCurrentUser(found);
  };

  // User Management
  const addUser = async (userData: Omit<User, 'id' | 'createdAt'>) => {
    const newUser: User = {
      ...userData,
      id: `usr-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      createdAt: new Date().toISOString(),
      xp: userData.xp || 0,
      level: userData.level || 1,
      badges: userData.badges || ['Pemula Waris'],
    };
    setUsers(prev => [newUser, ...prev]);

    try {
      await setDoc(doc(db, 'users', newUser.id), newUser);
    } catch (e) {
      handleFirestoreError(e, OperationType.WRITE, `users/${newUser.id}`);
    }
  };

  const updateUser = async (userData: User) => {
    setUsers(prev => prev.map(u => (u.id === userData.id ? userData : u)));
    if (currentUser?.id === userData.id) {
      setCurrentUser(userData);
    }

    try {
      await setDoc(doc(db, 'users', userData.id), userData, { merge: true });
    } catch (e) {
      handleFirestoreError(e, OperationType.UPDATE, `users/${userData.id}`);
    }
  };

  const deleteUser = async (userId: string) => {
    setUsers(prev => prev.filter(u => u.id !== userId));
    try {
      await deleteDoc(doc(db, 'users', userId));
    } catch (e) {
      handleFirestoreError(e, OperationType.DELETE, `users/${userId}`);
    }
  };

  const resetPassword = async (userId: string, newPass = '123456') => {
    setUsers(prev => prev.map(u => (u.id === userId ? { ...u, password: newPass } : u)));
    try {
      await updateDoc(doc(db, 'users', userId), { password: newPass });
    } catch (e) {
      handleFirestoreError(e, OperationType.UPDATE, `users/${userId}`);
    }
  };

  // Material Management
  const addMaterial = async (matData: Omit<Material, 'id' | 'createdAt'>) => {
    const newMat: Material = {
      ...matData,
      id: `mat-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    setMaterials(prev => [...prev, newMat]);
    try {
      await setDoc(doc(db, 'materials', newMat.id), newMat);
    } catch (e) {
      handleFirestoreError(e, OperationType.WRITE, `materials/${newMat.id}`);
    }
  };

  const updateMaterial = async (mat: Material) => {
    setMaterials(prev => prev.map(m => (m.id === mat.id ? mat : m)));
    try {
      await setDoc(doc(db, 'materials', mat.id), mat, { merge: true });
    } catch (e) {
      handleFirestoreError(e, OperationType.UPDATE, `materials/${mat.id}`);
    }
  };

  const deleteMaterial = async (matId: string) => {
    setMaterials(prev => prev.filter(m => m.id !== matId));
    try {
      await deleteDoc(doc(db, 'materials', matId));
    } catch (e) {
      handleFirestoreError(e, OperationType.DELETE, `materials/${matId}`);
    }
  };

  // Question Management
  const addQuestion = async (qData: Omit<Question, 'id'>) => {
    const newQ: Question = {
      ...qData,
      id: `q-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    setQuestions(prev => [...prev, newQ]);
    try {
      await setDoc(doc(db, 'questions', newQ.id), newQ);
    } catch (e) {
      handleFirestoreError(e, OperationType.WRITE, `questions/${newQ.id}`);
    }
  };

  const updateQuestion = async (q: Question) => {
    setQuestions(prev => prev.map(item => (item.id === q.id ? q : item)));
    try {
      await setDoc(doc(db, 'questions', q.id), q, { merge: true });
    } catch (e) {
      handleFirestoreError(e, OperationType.UPDATE, `questions/${q.id}`);
    }
  };

  const deleteQuestion = async (qId: string) => {
    setQuestions(prev => prev.filter(item => item.id !== qId));
    try {
      await deleteDoc(doc(db, 'questions', qId));
    } catch (e) {
      handleFirestoreError(e, OperationType.DELETE, `questions/${qId}`);
    }
  };

  // Test Settings
  const updateTestSettings = (duration: number, passingScore: number) => {
    setTestDurationMinutes(duration);
    setTestPassingScore(passingScore);
    localStorage.setItem(
      STORAGE_KEYS.TEST_SETTINGS,
      JSON.stringify({ duration, passingScore })
    );
  };

  // Submit Result
  const submitResult = async (resData: Omit<ExamResult, 'id' | 'tanggal'>) => {
    const now = new Date();
    const formattedDate = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

    const newRes: ExamResult = {
      ...resData,
      id: `res-${Date.now()}`,
      tanggal: formattedDate,
    };
    setResults(prev => [newRes, ...prev]);

    try {
      await setDoc(doc(db, 'results', newRes.id), newRes);
    } catch (e) {
      handleFirestoreError(e, OperationType.WRITE, `results/${newRes.id}`);
    }
  };

  const addTeacherFeedback = async (resId: string, feedback: string) => {
    setResults(prev => prev.map(r => (r.id === resId ? { ...r, feedbackGuru: feedback } : r)));
    try {
      await updateDoc(doc(db, 'results', resId), { feedbackGuru: feedback });
    } catch (e) {
      handleFirestoreError(e, OperationType.UPDATE, `results/${resId}`);
    }
  };

  const addStudentXP = async (userId: string, points: number) => {
    setUsers(prev =>
      prev.map(u => {
        if (u.id === userId) {
          const currentXp = u.xp || 0;
          const nextXp = currentXp + points;
          const nextLevel = Math.floor(nextXp / 150) + 1;
          const updatedBadges = [...(u.badges || [])];
          if (nextXp >= 300 && !updatedBadges.includes('Pakar Furudh')) {
            updatedBadges.push('Pakar Furudh');
          }
          if (nextXp >= 500 && !updatedBadges.includes('Master Faraidh')) {
            updatedBadges.push('Master Faraidh');
          }
          return {
            ...u,
            xp: nextXp,
            level: nextLevel,
            badges: updatedBadges,
          };
        }
        return u;
      })
    );

    if (currentUser?.id === userId) {
      const currentXp = currentUser.xp || 0;
      const nextXp = currentXp + points;
      const nextLevel = Math.floor(nextXp / 150) + 1;
      const updatedBadges = [...(currentUser.badges || [])];
      if (nextXp >= 300 && !updatedBadges.includes('Pakar Furudh')) {
        updatedBadges.push('Pakar Furudh');
      }
      if (nextXp >= 500 && !updatedBadges.includes('Master Faraidh')) {
        updatedBadges.push('Master Faraidh');
      }
      setCurrentUser({
        ...currentUser,
        xp: nextXp,
        level: nextLevel,
        badges: updatedBadges,
      });
    }

    try {
      const user = users.find(u => u.id === userId);
      if (user) {
        await updateDoc(doc(db, 'users', userId), {
          xp: (user.xp || 0) + points,
          level: Math.floor(((user.xp || 0) + points) / 150) + 1,
        });
      }
    } catch (e) {
      // ignore
    }
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        users,
        materials,
        questions,
        results,
        testDurationMinutes,
        testPassingScore,
        login,
        logout,
        switchUser,
        addUser,
        updateUser,
        deleteUser,
        resetPassword,
        addMaterial,
        updateMaterial,
        deleteMaterial,
        addQuestion,
        updateQuestion,
        deleteQuestion,
        updateTestSettings,
        submitResult,
        addTeacherFeedback,
        addStudentXP,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
