'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Button } from "@/components/ui/button"

export default function Dashboard() {
  const [user, setUser] = useState<{ nombre?: string; rol: string } | null>(null)

  useEffect(() => {
    const userStr = localStorage.getItem('user')
    if (userStr) {
      setUser(JSON.parse(userStr))
    }
  }, [])

  if (!user) {
    return null
  }

  return (
    <div className="fedpa-container">
      <h1 className="fedpa-title">
        Bienvenido a Flocktools, {user.nombre || (user.rol === 'invitado' ? 'Invitado' : '')}
      </h1>
      <p className="fedpa-text">Tu rol es: {user.rol}</p>
      <ul className="fedpa-list">
        <li>
          <Link href="/introduccion" className="fedpa-link">
            Introducción
          </Link>
        </li>
        <li>
          <Link href="/generar-doc-tecnica/excel-a-markdown" className="fedpa-link">
            Excel a Markdown
          </Link>
        </li>
        {user.rol !== 'invitado' && (
          <li>
            <Link href="/generar-doc-tecnica/generador-excel" className="fedpa-link">
              Generador de Excel
            </Link>
          </li>
        )}
      </ul>
    </div>
  )
}

