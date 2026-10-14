import {
  createUserWithEmailAndPassword,
  deleteUser,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  type UserCredential,
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

async function removeIncompleteAccount(
  credential: UserCredential
) {
  try {
    await deleteUser(credential.user)
  } catch {
    await signOut(auth).catch(() => undefined)
  }
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

  try {
    await setDoc(
      doc(db, 'users', credential.user.uid),
      {
        ...profile,
        createdAt: serverTimestamp(),
      }
    )
  } catch (error) {
    await removeIncompleteAccount(credential)

    throw new Error(
      'Your profile could not be saved. Please try again.',
      { cause: error }
    )
  }

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
    await signOut(auth)
    throw new Error('User profile not found.')
  }

  return userDocument.data() as UserProfile
}

export async function logoutUser() {
  await signOut(auth)
}

export function subscribeToAuthState(
  callback: (user: UserProfile | null) => void,
  onError?: (message: string) => void
) {
  let revision = 0

  const unsubscribe = onAuthStateChanged(
    auth,
    async (firebaseUser) => {
      const currentRevision = ++revision

      if (!firebaseUser) {
        callback(null)
        return
      }

      try {
        const userDocument = await getDoc(
          doc(db, 'users', firebaseUser.uid)
        )

        if (currentRevision !== revision) {
          return
        }

        if (!userDocument.exists()) {
          callback(null)
          onError?.('Your user profile could not be found.')
          return
        }

        callback(userDocument.data() as UserProfile)
      } catch {
        if (currentRevision !== revision) {
          return
        }

        callback(null)
        onError?.('Could not restore your session.')
      }
    },
    () => {
      revision += 1
      callback(null)
      onError?.('Could not verify your session.')
    }
  )

  return () => {
    revision += 1
    unsubscribe()
  }
}

