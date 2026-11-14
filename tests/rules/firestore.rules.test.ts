// Access matrix from specs/001-foundation-signin/contracts/firestore-access.md.
// Run with `npm run test:rules` (starts the Firestore emulator; needs Java 21).
import {
  assertFails,
  assertSucceeds,
  initializeTestEnvironment,
  type RulesTestEnvironment,
} from '@firebase/rules-unit-testing'
import { deleteDoc, doc, getDoc, getDocs, collection, setDoc, updateDoc } from 'firebase/firestore'
import { readFileSync } from 'node:fs'
import { afterAll, beforeAll, beforeEach, describe, it } from 'vitest'

let env: RulesTestEnvironment

const A = { uid: 'alice', email: 'alice@example.com' }
const B = { uid: 'bob', email: 'bob@example.com' }
const U = { uid: 'uninvited', email: 'stranger@example.com' }
const X = { uid: 'unverified', email: 'carol@example.com' }
const M = { uid: 'mixed', email: 'Mixed.Case@Example.com' }

const record = (email: string) => ({
  schemaVersion: 1,
  displayName: 'Someone',
  email,
  lastSignInAt: new Date(),
})

function as(p: { uid: string; email: string }, verified = true) {
  return env.authenticatedContext(p.uid, { email: p.email, email_verified: verified }).firestore()
}

beforeAll(async () => {
  env = await initializeTestEnvironment({
    projectId: 'demo-fitme',
    firestore: { rules: readFileSync('firestore.rules', 'utf8') },
  })
})

afterAll(async () => {
  await env.cleanup()
})

beforeEach(async () => {
  await env.clearFirestore()
  await env.withSecurityRulesDisabled(async (ctx) => {
    const db = ctx.firestore()
    for (const email of [A.email, B.email, X.email, M.email.toLowerCase()]) {
      await setDoc(doc(db, 'allowlist', email), {})
    }
    await setDoc(doc(db, 'users', A.uid), record(A.email))
    await setDoc(doc(db, 'users', B.uid), record(B.email))
  })
})

describe('invited user A', () => {
  it('1. can get own record', async () => {
    await assertSucceeds(getDoc(doc(as(A), 'users', A.uid)))
  })

  it('2. can set and update own record', async () => {
    const db = as(A)
    await assertSucceeds(setDoc(doc(db, 'users', A.uid), record(A.email), { merge: true }))
    await assertSucceeds(updateDoc(doc(db, 'users', A.uid), { displayName: 'Alice' }))
  })

  it('2b. can create own record on first sign-in', async () => {
    await env.withSecurityRulesDisabled((ctx) => deleteDoc(doc(ctx.firestore(), 'users', A.uid)))
    await assertSucceeds(setDoc(doc(as(A), 'users', A.uid), record(A.email), { merge: true }))
  })

  it('3. cannot delete own record', async () => {
    await assertFails(deleteDoc(doc(as(A), 'users', A.uid)))
  })

  it("4. cannot get B's record", async () => {
    await assertFails(getDoc(doc(as(A), 'users', B.uid)))
  })

  it("5. cannot set or update B's record", async () => {
    const db = as(A)
    await assertFails(setDoc(doc(db, 'users', B.uid), record(A.email)))
    await assertFails(updateDoc(doc(db, 'users', B.uid), { displayName: 'hacked' }))
    await assertFails(setDoc(doc(db, 'users', 'brand-new-uid'), record(A.email)))
  })

  it('6. cannot list users', async () => {
    await assertFails(getDocs(collection(as(A), 'users')))
  })

  it('7. can get own allowlist entry', async () => {
    await assertSucceeds(getDoc(doc(as(A), 'allowlist', A.email)))
  })

  it("8. cannot get B's allowlist entry", async () => {
    await assertFails(getDoc(doc(as(A), 'allowlist', B.email)))
  })

  it('9. cannot list the allowlist', async () => {
    await assertFails(getDocs(collection(as(A), 'allowlist')))
  })

  it('10. cannot create, update or delete allowlist entries', async () => {
    const db = as(A)
    await assertFails(setDoc(doc(db, 'allowlist', 'friend@example.com'), {}))
    await assertFails(setDoc(doc(db, 'allowlist', A.email), { note: 'me' }))
    await assertFails(deleteDoc(doc(db, 'allowlist', A.email)))
  })
})

describe('uninvited user U', () => {
  it('11. cannot get or set own record', async () => {
    const db = as(U)
    await assertFails(getDoc(doc(db, 'users', U.uid)))
    await assertFails(setDoc(doc(db, 'users', U.uid), record(U.email)))
  })

  it('12. can get own (missing) allowlist entry', async () => {
    await assertSucceeds(getDoc(doc(as(U), 'allowlist', U.email)))
  })
})

describe('unverified user X', () => {
  it('13. cannot get or set own record even though the email is invited', async () => {
    const db = as(X, false)
    await assertFails(getDoc(doc(db, 'users', X.uid)))
    await assertFails(setDoc(doc(db, 'users', X.uid), record(X.email)))
  })
})

describe('signed-out visitor', () => {
  it('14. cannot get any record or allowlist entry', async () => {
    const db = env.unauthenticatedContext().firestore()
    await assertFails(getDoc(doc(db, 'users', A.uid)))
    await assertFails(getDoc(doc(db, 'allowlist', A.email)))
  })
})

describe('email case', () => {
  it('15. mixed-case account email matches a lowercased allowlist entry', async () => {
    const db = as(M)
    await assertSucceeds(getDoc(doc(db, 'allowlist', M.email.toLowerCase())))
    await assertSucceeds(setDoc(doc(db, 'users', M.uid), record(M.email), { merge: true }))
    await assertSucceeds(getDoc(doc(db, 'users', M.uid)))
  })
})

describe('everything else', () => {
  it('16. any other collection is denied', async () => {
    const db = as(A)
    await assertFails(getDoc(doc(db, 'other', 'x')))
    await assertFails(setDoc(doc(db, 'other', 'x'), { a: 1 }))
    await assertFails(getDoc(doc(db, 'users', A.uid, 'sub', 'x')))
    await assertFails(setDoc(doc(db, 'users', A.uid, 'sub', 'x'), { a: 1 }))
  })
})
