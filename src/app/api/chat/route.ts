import {
  AzureAISearchVectorStore,
  AzureAISearchQueryType,
} from "@langchain/community/vectorstores/azure_aisearch";
import { ChatOpenAI, OpenAIEmbeddings } from "@langchain/openai";
import { createStuffDocumentsChain } from "langchain/chains/combine_documents";
import { createRetrievalChain } from "langchain/chains/retrieval";
import { JSONLoader } from "langchain/document_loaders/fs/json";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import { AzureChatOpenAI } from "@langchain/openai";
import { ChatPromptTemplate } from '@langchain/core/prompts'
import { AzureKeyCredential } from "@azure/search-documents";

export async function POST() {

  // Load documents from file
  const loader = new JSONLoader(
    "src/app/api/chat/state_of_the_union.json",
    ["/text"]
  );
  const rawDocuments = await loader.load();
  const splitter = new RecursiveCharacterTextSplitter({
    chunkSize: 1000,
    chunkOverlap: 0,
  });
  const documents = await splitter.splitDocuments(rawDocuments);

  // Create Azure AI Search vector store
  const store = await AzureAISearchVectorStore.fromDocuments(
    documents,
    new OpenAIEmbeddings(),
    {
      search: {
        type: AzureAISearchQueryType.SimilarityHybrid,
      },
    }
  );

  // The first time you run this, the index will be created.
  // You may need to wait a bit for the index to be created before you can perform
  // a search, or you can create the index manually beforehand.

  // Performs a similarity search
  const resultDocuments = await store.similaritySearch(
    "What did the president say about Ketanji Brown Jackson?"
  );

  console.log("Similarity search results:");
  console.log(resultDocuments[0].pageContent);

// Use the store as part of a chain

  let model = new ChatOpenAI({
    model: "gpt-4o",
    temperature: 0,
    openAIApiKey: process.env.NEXT_PUBLIC_AZURE_OPENAI_API_KEY!,
    configuration: {
      baseURL: process.env.NEXT_PUBLIC_AZURE_AISEARCH_ENDPOINT!
    }
});

// const llm = new AzureChatOpenAI({
//   model: "gpt-4o",
//   temperature: 0,
//   maxTokens: undefined,
//   maxRetries: 2,
//   azureOpenAIApiKey: process.env.AZURE_OPENAI_API_KEY,
//   azureOpenAIApiInstanceName: process.env.AZURE_OPENAI_API_INSTANCE_NAME,
//   azureOpenAIApiDeploymentName: process.env.AZURE_OPENAI_API_DEPLOYMENT_NAME,
//   azureOpenAIApiVersion: process.env.AZURE_OPENAI_API_VERSION,
// });

// const aiMsg = await llm.invoke([
//   [
//     "system",
//     "You are a helpful assistant that translates English to French. Translate the user sentence.",
//   ],
//   ["human", "I love programming."],
// ]);
// aiMsg;

// console.log(aiMsg.content);

  const questionAnsweringPrompt = ChatPromptTemplate.fromMessages([
    [
      "system",
      "Answer the user's questions based on the below context:\n\n{context}",
    ],
    ["human", "{input}"],
  ]);

  const combineDocsChain = await createStuffDocumentsChain({
    llm: model,
    prompt: questionAnsweringPrompt,
  });
  
  const chain = await createRetrievalChain({
    retriever: store.asRetriever(),
    combineDocsChain,
  });
  
  const response = await chain.invoke({
    input: "What is the president's top priority regarding prices?",
  });
  
  console.log("Chain response:");
  console.log(response.answer);
}