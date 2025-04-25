import {AzureChatOpenAI, AzureOpenAIEmbeddings} from "@langchain/openai";
import { AIMessage, HumanMessage, SystemMessage } from "@langchain/core/messages";
import express from 'express';
import cors from 'cors';
import fetch from 'node-fetch'; // nodig als je Node < 18 gebruikt
import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import {RecursiveCharacterTextSplitter} from "langchain/text_splitter";
import {FaissStore} from "@langchain/community/vectorstores/faiss";


const model = new AzureChatOpenAI({
    temperature: 1,
    verbose: false,
});

let vectorStore;

const embeddings = new AzureOpenAIEmbeddings({
    // temperature: 0,
    // azureOpenAIApiEmbeddingsDeploymentName: process.env.AZURE_EMBEDDING_DEPLOYMENT_NAME
});
// async function loadPDFFile() {
//     const loader = new PDFLoader("./public/DnD_BasicRules_2018.pdf");
//     const docs = await loader.load();
//     const textSplitter = new RecursiveCharacterTextSplitter({ chunkSize: 1000, chunkOverlap: 200 });
//     const splitDocs = await textSplitter.splitDocuments(docs);
//     console.log(`Document split into ${splitDocs.length} chunks. Now saving into vector store`);
//     vectorStore = await FaissStore.fromDocuments(splitDocs, embeddings);
//     await vectorStore.save("./vectordatabase")
//     console.log("vectorstore created and saved")
// }

vectorStore = await FaissStore.load("../server/vectordatabase", embeddings); // dezelfde naam van de directory
const relevantDocs = await vectorStore.similaritySearch("Summarize this document",3);
const context = relevantDocs.map(doc => doc.pageContent).join("\n\n");

// loadPDFFile();



let conversationHistory = [
    new SystemMessage(`
You are playing a DnD party of 4.

When the dungeon master interacts with you:
- you are not the dungeon master.
- use the DnD rules from this document ${context}.
- Speak in the first person as your character.
- Always perform initiative rolls, ability checks, and attack rolls when needed.
- Use realistic dice rolls (1d20 for checks/attacks/initiative, adding modifiers based on class and stats you invent).
- Be honest about rolls — not every check will succeed.
- Track EXP gained after battles and distribute it fairly across the party.
- After battles, randomly pick loot using the D&D 5e API loot tables (or similar items).
- Clearly describe what loot is found and who claims it.
- Roleplay group discussions about loot and decisions.
- Keep track of ongoing status: health, conditions, spells, etc.
- At the start of combat, roll initiative for each party member and order them accordingly.
- When a party members HP hits 0, it will die you can revive the member, but it gains only a few hitpoints back.
- After an encounter, narrate the battle outcome, distribute EXP, and describe the loot found.
- Stay fully in character — don't refer to yourself as 'the party's tank' or 'the rogue' — always by character name.
- Stay true to D&D mechanics and probabilities.
`)
];


const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

async function getRandomLoot(count = 2) {
    try {
        const response = await fetch('https://www.dnd5eapi.co/api/equipment');
        const data = await response.json();

        const lootItems = [];
        for (let i = 0; i < count; i++) {
            const item = data.results[Math.floor(Math.random() * data.results.length)];
            lootItems.push(item.name);
        }

        return lootItems;
    } catch (error) {
        console.error("Fout bij loot ophalen:", error);
        return ["een paar oude munten"];
    }
}
app.get('/', (req, res) => {
    res.json({message: "welcome to the server"})
})

app.post('/', async (req, res) => {
    const prompt = req.body.prompt;
    console.log("the user asked for " + prompt);

    const result = await returnInput(prompt);
    res.json({ message: result });
});

async function returnInput(prompt) {
    console.log("returnInput received prompt:", prompt);


    let extendedPrompt = prompt;

    const lootTriggers = ['chest', 'loot', 'search', 'body', 'treasure', 'open the box', 'inspect the crate'];

    if (lootTriggers.some(trigger => prompt.toLowerCase().includes(trigger))) {
        const loot = await getRandomLoot();
        extendedPrompt += `(tell the loot you see ${loot.join(', ')}. inside.
        Devide the loot over the party members.)`;
    }

    conversationHistory.push(new HumanMessage(extendedPrompt));

    const answer = await model.invoke(conversationHistory);
    conversationHistory.push(new AIMessage(answer.content));

    console.log(conversationHistory);

    return `${answer.content}`;
}


app.listen(3000, () => console.log(`Server running on http://localhost:3000`));
