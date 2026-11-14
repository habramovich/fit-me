export function Placeholder({ title, text }: { title: string; text: string }) {
  return (
    <main className="screen">
      <h1>{title}</h1>
      <div className="card stack-sm">
        <p>
          <strong>Coming soon.</strong>
        </p>
        <p className="muted">{text}</p>
      </div>
    </main>
  )
}
