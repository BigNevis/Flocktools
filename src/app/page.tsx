import Link from 'next/link'

export default function Home() {
  return (
    <div className="fedpa-container">
      <h1 className="fedpa-title">Bienvenido a Fedpatools</h1>
      <p className="fedpa-text">Selecciona una opción para comenzar:</p>
      <ul className="fedpa-list">
        <li>
          <Link href="/introduccion" className="fedpa-link">
            Introducción
          </Link>
        </li>
        <li>
          <Link href="/documentacion-tecnica/excel-a-markdown" className="fedpa-link">
            Excel a Markdown
          </Link>
        </li>
      </ul>
    </div>
  )
}

