import Chat from '@/app/api/components/Chat'


export const runtime = 'edge';

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <Chat></Chat>
    </main>
  );
}
