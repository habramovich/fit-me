export function Status({ message, note }: { message: string; note?: string }) {
  return (
    <main className="auth-screen" aria-busy="true">
      <h1>FitMe</h1>
      <p>{message}</p>
      {note && <p className="note">{note}</p>}
    </main>
  )
}
