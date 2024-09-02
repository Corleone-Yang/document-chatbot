import { Pinecone } from "@pinecone-database/pinecone";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import * as mammoth from "mammoth";
import { NextResponse } from "next/server";
import { OpenAI } from "openai";
import { extname } from "path";
import { v4 as uuidv4 } from "uuid";

export const config = {
  api: {
    bodyParser: false,
  },
};

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const pc = new Pinecone({
  apiKey: process.env.PINECONE_API_KEY,
});

const index = pc.index("document-reader");

// Function to get embedding using text-embedding-3-small model
async function getEmbedding(text, model = "text-embedding-3-small") {
  text = text.replace("\n", " ");
  const response = await openai.embeddings.create({
    input: [text],
    model: model,
  });
  return response.data[0].embedding;
}

export async function POST(req) {
  const formData = await req.formData();
  const file = formData.get("file");

  if (!file) {
    return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
  }

  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  try {
    let content;
    if (extname(file.name).toLowerCase() === ".docx") {
      // If it's a .docx file, use mammoth to extract text
      const result = await mammoth.extractRawText({ buffer });
      content = result.value;
    } else {
      // For other file types, assume it's text and decode
      content = buffer.toString("utf-8");
    }

    // Perform chunking
    const splitter = new RecursiveCharacterTextSplitter({
      chunkSize: 300,
      chunkOverlap: 20,
      separators: [". ", "! ", "? ", "\n", " ", ""],
    });

    const chunks = await splitter.createDocuments([content]);

    // Create documents with embeddings
    const vectors = await Promise.all(
      chunks.map(async (chunk) => {
        const embedding = await getEmbedding(chunk.pageContent);
        return {
          id: uuidv4(),
          values: embedding,
          metadata: {
            text: chunk.pageContent,
          },
        };
      })
    );

    // Upsert to Pinecone using fileName as namespace
    await index.namespace(file.name).upsert(vectors);

    return NextResponse.json({
      message: "File processed and stored in Pinecone successfully",
      fileName: file.name,
      chunkCount: chunks.length,
    });
  } catch (error) {
    console.error("Error processing file:", error);
    return NextResponse.json(
      { error: "File processing failed", details: error.message },
      { status: 500 }
    );
  }
}

export async function DELETE(req) {
  const { fileName } = await req.json();

  if (!fileName) {
    return NextResponse.json({ error: "Invalid file name" }, { status: 400 });
  }

  try {
    // Delete all vectors in the namespace corresponding to the fileName
    await index.namespace(fileName).deleteAll();

    return NextResponse.json({
      message: "File data deleted successfully from Pinecone",
    });
  } catch (error) {
    console.error("Error deleting file data from Pinecone:", error);
    return NextResponse.json(
      { error: "File data deletion failed", details: error.message },
      { status: 500 }
    );
  }
}
