import { useState, useEffect } from 'react';
import { db } from '../firebase';
import { doc, updateDoc, increment } from 'firebase/firestore';
import { useAuth } from './useAuth';

export const useXP = () => {
  const { user, profile } = useAuth();

  const addXP = async (amount: number) => {
    if (!user || !profile) return;
    
    const userRef = doc(db, 'users', user.uid);
    const newXP = profile.xp + amount;
    const nextLevelXP = profile.level * 1000;
    
    const updates: any = {
      xp: increment(amount),
      points: increment(amount / 10) // 10% of XP as points
    };

    if (newXP >= nextLevelXP) {
      updates.level = increment(1);
    }

    await updateDoc(userRef, updates);
  };

  const addSteps = async (steps: number) => {
    if (!user) return;
    const userRef = doc(db, 'users', user.uid);
    await updateDoc(userRef, {
      totalSteps: increment(steps),
      xp: increment(steps / 10) // 1 XP per 10 steps
    });
  };

  return { addXP, addSteps };
};
