'use server';

import { db } from '@/lib/firebase';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import bcrypt from 'bcryptjs';

/**
 * Checks if an email is pre-authorized for State Admin access.
 * Handles the "allow move to password field" requirement.
 */
export async function checkEmailAuthorized(email: string) {
  if (!email) return { authorized: false, error: 'Email is required' };

  try {
    const adminRef = doc(db, 'admins', email.toLowerCase().trim());
    const adminSnap = await getDoc(adminRef);

    // Specifically allow the pre-approved email
    const isMasterEmail = email.toLowerCase().trim() === 'yogendra1yogi@gmail.com';

    if (!adminSnap.exists()) {
      if (isMasterEmail) {
        return { authorized: true, isFirstLogin: true };
      }
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
 * Handles first-time password setup (hashing) or subsequent login validation.
 */
export async function adminLoginAction(formData: { email: string; password: string; name?: string; isFirstLogin: boolean }) {
  const { email, password, name, isFirstLogin } = formData;

  try {
    const adminRef = doc(db, 'admins', email.toLowerCase().trim());
    const adminSnap = await getDoc(adminRef);

    // Seed/Create document if it's the first login for the master email
    if (!adminSnap.exists()) {
      if (email.toLowerCase().trim() === 'yogendra1yogi@gmail.com') {
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        
        await setDoc(adminRef, {
          email: email.toLowerCase().trim(),
          hashedPassword,
          name: name || 'State Admin',
          createdAt: new Date().toISOString(),
          lastLogin: new Date().toISOString()
        });
        return { success: true };
      }
      return { success: false, error: 'Access denied' };
    }

    const data = adminSnap.data();

    if (isFirstLogin || !data.hashedPassword) {
      // First time login: Securely hash and save the password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);
      
      await updateDoc(adminRef, {
        hashedPassword,
        name: name || data.name || 'State Admin',
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
