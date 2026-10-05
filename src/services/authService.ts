import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
} from 'firebase/auth'

import {
  doc,
  getDoc,
  setDoc,
  serverTimestamp,
} from 'firebase/firestore'

import { auth, db } from './firebase'
import type { UserProfile } from '../types/UserProfile'

interface RegisterData {
  fullName: string
  username: string
  email: string
  universityCode: string
  password: string
}

export async function registerUser(
  data: RegisterData
): Promise<UserProfile> {
  const credential = await createUserWithEmailAndPassword(
    auth,
    data.email,
    data.password
  )

  const profile: UserProfile = {
    uid: credential.user.uid,
    fullName: data.fullName,
    username: data.username,
    email: data.email,
    universityCode: data.universityCode,
  }

  await setDoc(
    doc(db, 'users', credential.user.uid),
    {
      ...profile,
      createdAt: serverTimestamp(),
    }
  )

  return profile
}

export async function loginUser(
  email: string,
  password: string
): Promise<UserProfile> {
  const credential = await signInWithEmailAndPassword(
    auth,
    email,
    password
  )

  const userDocument = await getDoc(
    doc(db, 'users', credential.user.uid)
  )

  if (!userDocument.exists()) {
    throw new Error('User profile not found.')
  }

  return userDocument.data() as UserProfile
}

export async function logoutUser() {
  await signOut(auth)
}

export function subscribeToAuthState(
  callback: (user: UserProfile | null) => void
) {
  return onAuthStateChanged(auth, async (firebaseUser) => {
    if (!firebaseUser) {
      callback(null)
      return
    }

    const userDocument = await getDoc(
      doc(db, 'users', firebaseUser.uid)
    )

    if (!userDocument.exists()) {
      callback(null)
      return
    }

    callback(userDocument.data() as UserProfile)
  })
}