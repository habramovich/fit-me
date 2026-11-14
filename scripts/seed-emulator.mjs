// Seeds the local Firestore emulator. Run via `npm run seed` (wraps emulators:exec and exports
// the result to ./emulator-data, which `npm run emulators` imports).
// "Bearer owner" is the emulator's admin token: it bypasses security rules. Emulator only.
const host = process.env.FIRESTORE_EMULATOR_HOST ?? '127.0.0.1:8080'
const base = `http://${host}/v1/projects/demo-fitme/databases/(default)/documents`

const invited = ['invited@example.com']

for (const email of invited) {
  const res = await fetch(`${base}/allowlist/${encodeURIComponent(email)}`, {
    method: 'PATCH',
    headers: { Authorization: 'Bearer owner', 'Content-Type': 'application/json' },
    body: JSON.stringify({ fields: { note: { stringValue: 'local test account' } } }),
  })
  if (!res.ok) throw new Error(`Seeding ${email} failed: ${res.status} ${await res.text()}`)
  console.log(`allowlist: ${email}`)
}
