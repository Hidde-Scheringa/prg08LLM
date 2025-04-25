import { AzureChatOpenAI, AzureOpenAIEmbeddings } from "@langchain/openai";
import { FaissStore } from "@langchain/community/vectorstores/faiss";

const model = new AzureChatOpenAI({ temperature: 1 });

const embeddings = new AzureOpenAIEmbeddings({
    azureOpenAIApiEmbeddingsDeploymentName: process.env.AZURE_EMBEDDING_DEPLOYMENT_NAME
  });

let vectorStore = await FaissStore.load("textVectorDB", embeddings);

async function askQuestion(prompt){
    const relevantDocs = await vectorStore.similaritySearch(prompt, 3);
    console.log("-----------------------------------------------------");

    console.log("i found these 3 texts for your prompt")
    console.log(relevantDocs[0]);
    console.log(relevantDocs[1]);
    console.log(relevantDocs[2]);
    console.log("-----------------------------------------------------");
    const context = relevantDocs.map(doc => doc.pageContent).join("\n\n");
    console.log( context); 
  
    //Chat
    const response = await model.invoke([
      ["system", "You will get a context and a question. Use only the context to answer the question"],
      ["user", `context: ${context}, question: ${prompt}`],
    ]);
  
    console.log("---------------------------");
    console.log(response.content);
  }
  
//   await loadHamsterStory();
//   await askQuestion("who is the hero of this story?");
await askQuestion("who is the pokemon trainer");


