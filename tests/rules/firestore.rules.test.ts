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

describe('exercise marks (002 rows 17–22)', () => {
  const mark = (m: string) => ({ mark: m, updatedAt: new Date() })

  it('17. A can set a valid mark on own record', async () => {
    await assertSucceeds(
      setDoc(doc(as(A), 'users', A.uid, 'exerciseMarks', 'dead-bug'), mark('favourite')),
    )
    await assertSucceeds(
      setDoc(doc(as(A), 'users', A.uid, 'exerciseMarks', 'dead-bug'), mark('notForMe')),
    )
  })

  it('18. A cannot set an invalid mark or extra fields', async () => {
    await assertFails(setDoc(doc(as(A), 'users', A.uid, 'exerciseMarks', 'dead-bug'), mark('love')))
    await assertFails(
      setDoc(doc(as(A), 'users', A.uid, 'exerciseMarks', 'dead-bug'), {
        ...mark('favourite'),
        extra: 1,
      }),
    )
  })

  it('19. A can delete own mark', async () => {
    const ref = doc(as(A), 'users', A.uid, 'exerciseMarks', 'dead-bug')
    await assertSucceeds(setDoc(ref, mark('favourite')))
    await assertSucceeds(deleteDoc(ref))
  })

  it('20. A can get and list own marks', async () => {
    await assertSucceeds(getDoc(doc(as(A), 'users', A.uid, 'exerciseMarks', 'dead-bug')))
    await assertSucceeds(getDocs(collection(as(A), 'users', A.uid, 'exerciseMarks')))
  })

  it("21. A cannot read or write B's marks", async () => {
    await assertFails(getDoc(doc(as(A), 'users', B.uid, 'exerciseMarks', 'x')))
    await assertFails(getDocs(collection(as(A), 'users', B.uid, 'exerciseMarks')))
    await assertFails(setDoc(doc(as(A), 'users', B.uid, 'exerciseMarks', 'x'), mark('favourite')))
  })

  it('22. an uninvited user cannot write marks', async () => {
    await assertFails(setDoc(doc(as(U), 'users', U.uid, 'exerciseMarks', 'x'), mark('favourite')))
  })
})

describe('sessions (002 rows 23–27)', () => {
  const item = { exerciseId: 'dead-bug', version: 'standard', outcome: 'done', rating: 'right' }
  const session = (n: number) => ({
    schemaVersion: 1,
    routine: 'sample',
    startedAt: new Date(),
    endedAt: null,
    items: Array.from({ length: n }, () => item),
  })

  it('23. A can create and update own session', async () => {
    const ref = doc(as(A), 'users', A.uid, 'sessions', 's1')
    await assertSucceeds(setDoc(ref, session(0)))
    await assertSucceeds(updateDoc(ref, { items: [item, item], endedAt: new Date() }))
  })

  it('24. A cannot create a session with more than 50 items', async () => {
    await assertFails(setDoc(doc(as(A), 'users', A.uid, 'sessions', 's1'), session(51)))
  })

  it('25. A cannot delete a session', async () => {
    const ref = doc(as(A), 'users', A.uid, 'sessions', 's1')
    await assertSucceeds(setDoc(ref, session(1)))
    await assertFails(deleteDoc(ref))
  })

  it('26. A can get and list own sessions', async () => {
    await assertSucceeds(getDoc(doc(as(A), 'users', A.uid, 'sessions', 's1')))
    await assertSucceeds(getDocs(collection(as(A), 'users', A.uid, 'sessions')))
  })

  it("27. A cannot read or write B's sessions", async () => {
    await assertFails(getDoc(doc(as(A), 'users', B.uid, 'sessions', 's1')))
    await assertFails(setDoc(doc(as(A), 'users', B.uid, 'sessions', 's1'), session(0)))
  })

  it('28. other subcollections under a user are denied', async () => {
    await assertFails(setDoc(doc(as(A), 'users', A.uid, 'notes', 'x'), { a: 1 }))
    await assertFails(getDoc(doc(as(A), 'users', A.uid, 'notes', 'x')))
  })
})

describe('profile (003 rows 29–30)', () => {
  it('29. A can save a profile map on own record; B cannot', async () => {
    const profile = { schemaVersion: 1, goals: ['mobility'], techniques: { yoga: 'lots' } }
    await assertSucceeds(setDoc(doc(as(A), 'users', A.uid), { profile }, { merge: true }))
    await assertFails(setDoc(doc(as(B), 'users', A.uid), { profile }, { merge: true }))
  })

  it('30. the profile must be a map', async () => {
    await assertFails(setDoc(doc(as(A), 'users', A.uid), { profile: 'mobility' }, { merge: true }))
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
