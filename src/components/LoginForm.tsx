'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useMsal } from '@azure/msal-react'
import { loginRequest } from '@/config/authConfig'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'

const LoginForm = () => {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const { instance } = useMsal()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      const response = await fetch('http://localhost:3004/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })

      if (response.ok) {
        const data = await response.json()
        localStorage.setItem('token', data.token)
        localStorage.setItem('user', JSON.stringify(data.user))
        router.push('/dashboard')
      } else {
        const errorData = await response.json()
        setError(errorData.message || 'Credenciales inválidas')
      }
    } catch (error) {
      console.error('Error durante el inicio de sesión:', error)
      setError('Error al iniciar sesión. Por favor, intente de nuevo.')
    }

    setIsLoading(false)
  }

  const handleGuestLogin = () => {
    localStorage.setItem('user', JSON.stringify({ rol: 'invitado' }))
    router.push('/dashboard')
  }

  const handleMicrosoftLogin = async () => {
    try {
      const result = await instance.loginPopup(loginRequest)
      if (result) {
        console.log('Microsoft login result:', result)
        const response = await fetch('http://localhost:3004/api/auth/microsoft-login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            accessToken: result.accessToken,
            idToken: result.idToken,
            account: result.account
          }),
        })

        if (response.ok) {
          const data = await response.json()
          localStorage.setItem('token', data.token)
          localStorage.setItem('user', JSON.stringify(data.user))
          router.push('/dashboard')
        } else {
          const errorData = await response.json()
          console.error('Error response:', errorData)
          setError(errorData.error || 'Error al iniciar sesión con Microsoft')
        }
      }
    } catch (error) {
      console.error('Error durante el inicio de sesión con Microsoft:', error)
      setError('Error al iniciar sesión con Microsoft. Por favor, intente de nuevo.')
    }
  }

  return (
    <Card className="fedpa-card w-[350px]">
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-center">Flocktools</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="tu@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="fedpa-input"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Contraseña</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="fedpa-input"
            />
          </div>
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          <Button type="submit" disabled={isLoading} className="w-full fedpa-button">
            {isLoading ? 'Iniciando sesión...' : 'Iniciar sesión'}
          </Button>
        </form>
        <div className="mt-4">
          <Button onClick={handleGuestLogin} variant="outline" className="w-full">
            Entrar como invitado
          </Button>
        </div>
        <div className="mt-4">
          <Button onClick={handleMicrosoftLogin} variant="outline" className="w-full">
            Iniciar sesión con Microsoft
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

export default LoginForm

