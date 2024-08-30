import { DefaultAzureCredential, getBearerTokenProvider } from '@azure/identity';
import { Embeddings } from '@langchain/core/embeddings';
import { BaseChatModel } from '@langchain/core/language_models/chat_models';
import { VectorStore } from '@langchain/core/vectorstores';
import { AIChatCompletionRequest, AIChatCompletionDelta } from '@microsoft/ai-chat-protocol';
import { AzureOpenAIEmbeddings, AzureChatOpenAI } from '@langchain/openai';
import { AzureCosmosDBNoSQLVectorStore } from '@langchain/azure-cosmosdb';
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import {
  AzureAISearchVectorStore,
  AzureAISearchQueryType,
} from "@langchain/community/vectorstores/azure_aisearch";
import { TextLoader } from "langchain/document_loaders/fs/text";

export async function POST(req: Request){
  const requestBody = (await req.json()) as AIChatCompletionRequest;
  const { messages } = requestBody;


  let embeddings: Embeddings;
  let model: BaseChatModel;
  let store: VectorStore;

  const loader = new TextLoader("src/app/api/chat/state_of_the_union.txt");
  const rawDocuments = await loader.load();
  const splitter = new RecursiveCharacterTextSplitter({
    chunkSize: 1000,
    chunkOverlap: 0,
  });
  const documents = await splitter.splitDocuments(rawDocuments);


  const credentials = new DefaultAzureCredential();
  const azureOpenAiScope = 'https://cognitiveservices.azure.com/.default';
  const azureADTokenProvider = getBearerTokenProvider(credentials, azureOpenAiScope);

      // Initialize models and vector database
  embeddings = new AzureOpenAIEmbeddings({ azureADTokenProvider });
    model = new AzureChatOpenAI({
    // Controls randomness. 0 = deterministic, 1 = maximum randomness
    temperature: 0.7,
    azureADTokenProvider,
  });
  store = await AzureAISearchVectorStore.fromDocuments(
    documents,
    new AzureOpenAIEmbeddings(), 
    {
      search: {
        type: AzureAISearchQueryType.SimilarityHybrid,
      },
    }
  );
}