'use client'
import { Form } from '@/components/form'
import { Header } from '@/components/header'

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-8 flex items-center justify-center min-h-[calc(100vh-80px)]">
        <Form />
      </main>
    </div>
  )
}
