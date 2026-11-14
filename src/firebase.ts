import { initializeApp, type FirebaseOptions } from 'firebase/app'
import { connectAuthEmulator, getAuth } from 'firebase/auth'
import {
  connectFirestoreEmulator,
  initializeFirestore,
  persistentLocalCache,
  persistentMultipleTabManager,
} from 'firebase/firestore'

// Web config is public: it identifies the project and grants no access. Access is controlled by
// firestore.rules. See specs/001-foundation-signin/research.md (R8).
const prodConfig: FirebaseOptions = {
  apiKey: 'AIzaSyA5SEl5PPbExOSiEGxbCp3PxCLr5BeTxys',
  authDomain: 'fit-me-today.firebaseapp.com',
  projectId: 'fit-me-today',
  storageBucket: 'fit-me-today.firebasestorage.app',
  messagingSenderId: '876549879845',
  appId: '1:876549879845:web:ba6659370fad338d0de7cc',
}

// In development the app talks only to the local emulators. A `demo-` project ID guarantees it
// can never reach a real project.
const devConfig: FirebaseOptions = {
  apiKey: 'demo-api-key',
  authDomain: 'demo-fitme.firebaseapp.com',
  projectId: 'demo-fitme',
}

const useEmulators = import.meta.env.DEV

export const app = initializeApp(useEmulators ? devConfig : prodConfig)

export const auth = getAuth(app)

export const db = initializeFirestore(app, {
  localCache: persistentLocalCache({ tabManager: persistentMultipleTabManager() }),
})

if (useEmulators) {
  connectAuthEmulator(auth, 'http://127.0.0.1:9099', { disableWarnings: true })
  connectFirestoreEmulator(db, '127.0.0.1', 8080)
}
