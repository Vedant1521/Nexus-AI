import fs from "fs";
import {PDFParse} from "pdf-parse";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import { createVectorStore } from "../utils/vectorStore.js";
import {
  HumanMessage,
  SystemMessage
} from "@langchain/core/messages";

import { getModel }
from "../utils/model.js";
import { QdrantVectorStore } from "@langchain/qdrant";
import { checkAgentLimit } from "../config/agentRateLimit.js";
import { deductCredits } from "../utils/deductCredits.js";

export const pdfRagAgent = async (state) => {

  let collectionName = null;

  try {

    await checkAgentLimit(
      state.userId,
      "pdf_rag"
    );

    await deductCredits(
      state.userId,
      "pdf_rag"
    );

    const buffer =
      fs.readFileSync(
        state.file.path
      );

    const pdf =
      new PDFParse({

        data: buffer

      });

    const result =
      await pdf.getText();

    const text =
      result.text;

    const splitter =
      new RecursiveCharacterTextSplitter({

        chunkSize: 1000,

        chunkOverlap: 200

      });

    const docs =
      await splitter.createDocuments([

        text

      ]);

    collectionName =
`pdf-${Date.now()}`;

    const vectorStore = await createVectorStore(

      collectionName,

      docs

    );

    const relevantDocs =
    await vectorStore.similaritySearch(

      state.prompt,

      5

    );

    const context =
    relevantDocs

    .map(doc=>doc.pageContent)

    .join("\n\n");

    const llm = getModel("pdf-rag");

    const messages=[

      new SystemMessage(`

You are NexusAI PDF Assistant.

Rules:

- Answer ONLY from the uploaded PDF.

- Never make up information.

- If the answer is not present in the PDF, reply:

"I couldn't find this information in the uploaded PDF."

- Use Markdown formatting.

`),

      new HumanMessage(`

Context:

${context}

Question:

${state.prompt}

`)
    ];


    const response =
    await llm.invoke(
      messages
    );


    return {

      ...state,

      response:
      response.content
    };

  }

  finally {

    try {

      if (state.file?.path) {
        fs.unlinkSync(
          state.file.path
        );
      }

      if (collectionName) {
        await QdrantVectorStore.deleteCollection({
          collectionName,
          url: process.env.QDRANT_URL,
          apiKey: process.env.QDRANT_API_KEY
        });
      }

    }

    catch(err) {

      console.log(err.message);

    }

  }

};