import Chat from '@/app/api/components/Chat'
import { AzureChatOpenAI } from "@langchain/openai";

export default async function Home() {

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <Chat></Chat>
    </main>
  );
}
