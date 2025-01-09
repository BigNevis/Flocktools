'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import FormularioServicio from '@/components/FormularioServicio'
import { useToast } from "@/components/ui/use-toast"

export default function EditarServicioPage({ params }: { params: { id: string } }) {
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    setIsLoading(false)
  }, [])

  const handleCancel = () => {
    router.push('/generar-doc-tecnica/generador-excel')
  }

  const handleSave = async (servicio: any) => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`http://localhost:3004/api/servicios/${params.id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(servicio)
      })

      if (response.ok) {
        toast({
          title: "Servicio actualizado",
          description: "El servicio se ha actualizado correctamente.",
        })
        router.push('/generar-doc-tecnica/generador-excel')
      } else {
        throw new Error('Error al actualizar el servicio')
      }
    } catch (error) {
      console.error('Error al guardar el servicio:', error)
      toast({
        title: "Error",
        description: "No se pudo actualizar el servicio. Por favor, intente nuevamente.",
        variant: "destructive",
      })
    }
  }

  if (isLoading) {
    return <div>Cargando...</div>
  }

  if (error) {
    return <div>Error: {error}</div>
  }

  return (
    <FormularioServicio
      modo="editar"
      servicioId={parseInt(params.id)}
      onCancel={handleCancel}
      onSave={handleSave}
    />
  )
}

