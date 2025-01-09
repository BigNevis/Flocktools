'use client'
import { PublicClientApplication } from "@azure/msal-browser";
import { MsalProvider } from "@azure/msal-react";
import { msalConfig } from "@/config/authConfig";
import LoginForm from '@/components/LoginForm'

const msalInstance = new PublicClientApplication(msalConfig);

export default function Home() {
  return (
    <MsalProvider instance={msalInstance}>
      <div className="fedpa-container flex items-center justify-center min-h-screen">
        <LoginForm />
      </div>
    </MsalProvider>
  )
}

