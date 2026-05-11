// src/context/AuthProvider.js
import React, { createContext, useState, useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from './firebase';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        console.log('=== AUTH DEBUG ===');
        console.log('Logged in UID:', firebaseUser.uid);
        console.log('Logged in Email:', firebaseUser.email);
        try {
          const userDoc = await getDoc(doc(db, "users", firebaseUser.uid));
          console.log('Firestore doc exists:', userDoc.exists());
          if (userDoc.exists()) {
            const userData = userDoc.data();
            console.log('Firestore data:', JSON.stringify(userData));
            console.log('Role found:', userData.role);
            setUser(firebaseUser);
            setRole(userData.role);
          } else {
            console.warn('No Firestore doc found for UID:', firebaseUser.uid);
            // Still set user so they don't get logged out silently
            setUser(firebaseUser);
            setRole(null);
          }
        } catch (error) {
          console.error('Error getting user role:', error);
          setUser(firebaseUser);
          setRole(null);
        }
      } else {
        setUser(null);
        setRole(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  return (
    <AuthContext.Provider value={{ user, role, loading }}>
      {children}
    </AuthContext.Provider>
  );
};