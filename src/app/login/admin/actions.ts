'use server';

import { db } from '@/lib/firebase';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import bcrypt from 'bcryptjs';

/**
 * Checks if an email is pre-authorized for State Admin access.
 * Returns information about whether it's the first login.
 */
export async function checkEmailAuthorized(email: string) {
  if (!email) return { authorized: false, error: 'Email is required' };

  try {
    const adminRef = doc(db, 'admins', email.toLowerCase());
    const adminSnap = await getDoc(adminRef);

    if (!adminSnap.exists()) {
      return { authorized: false, error: 'Invalid Email' };
    }

    const data = adminSnap.data();
    const isFirstLogin = !data.hashedPassword;

    return { 
      authorized: true, 
      isFirstLogin,
      name: data.name || ''
    };
  } catch (error) {
    console.error('Error checking authorization:', error);
    return { authorized: false, error: 'System error. Please try again.' };
  }
}

/**
 * Handles the actual login or first-time setup logic.
 */
export async function adminLoginAction(formData: any) {
  const { email, password, name, isFirstLogin } = formData;

  try {
    const adminRef = doc(db, 'admins', email.toLowerCase());
    const adminSnap = await getDoc(adminRef);

    if (!adminSnap.exists()) {
      return { success: false, error: 'Access denied' };
    }

    const data = adminSnap.data();

    if (isFirstLogin) {
      // First time login: Securely hash and save the password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);
      
      await updateDoc(adminRef, {
        hashedPassword,
        name: name || 'State Admin',
        lastLogin: new Date().toISOString()
      });

      return { success: true };
    } else {
      // Subsequent login: Compare provided password with stored hash
      const isValid = await bcrypt.compare(password, data.hashedPassword);
      
      if (!isValid) {
        return { success: false, error: 'Incorrect Password' };
      }

      await updateDoc(adminRef, {
        lastLogin: new Date().toISOString()
      });

      return { success: true };
    }
  } catch (error) {
    console.error('Login error:', error);
    return { success: false, error: 'Authentication failed' };
  }
}
