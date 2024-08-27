'use client'
import { Input } from '@/components/Input'
import { useChat } from "ai/react"
import { useRef, useEffect } from 'react'

export default function Chat() {
    const { messages, input, handleInputChange, handleSubmit } = useChat({
        api: '../api/chat'
    });

    return (
        <main className="flex flex-col w-full h-screen max-h-dvh bg-background">

            <header className="p-4 border-b w-full max-w-3xl mx-auto">
                <h1 className="text-2xl font-bold">AI Chat</h1>
            </header>

            <section className="p-4">
            <form onSubmit={handleSubmit}>
                <input
                    className="fixed bottom-0 w-full max-w-md p-2 mb-8 border border-gray-300 rounded shadow-xl"
                    value={input}
                    placeholder="Say something..."
                    onChange={handleInputChange}
                />
            </form>
            </section>

            <section className="container px-0 pb-10 flex flex-col flex-grow gap-4 mx-auto max-w-3xl">
                <ul className="h-1 p-4 flex-grow bg-muted/50 rounded-lg overflow-y-auto flex flex-col gap-4">
                    {messages.map(m => (
                       <div key={m.id} className='whitespace-pre-wrap'>
                            {m.role === 'user' ? 'User: ' : 'AI: '}
                            {m.content}
                       </div>
                    ))}
                </ul >
            </section> 
        </main>
    )
}