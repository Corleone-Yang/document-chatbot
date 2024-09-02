import { Pinecone } from "@pinecone-database/pinecone";
import { NextResponse } from "next/server";
import { OpenAI } from "openai";

let settings = {
  isRAGEnabled: false,
  numChunks: 0,
  fileName: "",
};

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const pc = new Pinecone({
  apiKey: process.env.PINECONE_API_KEY,
});

const index = pc.index("document-reader");

const systemPrompt = `You are an AI-powered document reader assistant based on RAG architecture.
1. If there is a document, answer questions based on the chunks of RAG. If not, act as a normal chatbot.
2. For mathematical expressions, equations, and parameters, ensure they are correctly formatted using LaTeX syntax:
   - Use \`$...$\` for inline math (e.g., \`$x^2 + y^2 = z^2$\`) and \`$$...$$\` for block math.
   - For fractions, use \`\\frac{numerator}{denominator}\`.
   - For derivatives, use \`\\frac{\\partial u}{\\partial t}\` or \`\\frac{du}{dt}\` for partial and ordinary derivatives respectively.
   - Use \`\\text{...}\` for including non-math text within formulas.
   - Use appropriate LaTeX commands for Greek letters (e.g., \`$\\alpha$\`, \`$\\beta$\`, etc.).
   - Ensure superscripts \`^{}\` and subscripts \`_{}\` are properly formatted.
   - For scientific notation and units, format using \`\\times\` and \`\\text{...}\` for the units.
3. For code snippets, use Markdown syntax, enclosing the code in triple backticks (\`\`\`) followed by the language identifier.`;

async function getEmbedding(text, model = "text-embedding-3-small") {
  text = text.replace("\n", " ");
  const response = await openai.embeddings.create({
    input: [text],
    model: model,
  });
  console.log(
    "Embedding generated:",
    response.data[0].embedding.slice(0, 5) + "..."
  );
  return response.data[0].embedding;
}

async function queryPinecone(embedding, fileName) {
  console.log(`Querying Pinecone for file: ${fileName}`);
  const queryResponse = await index.namespace(fileName).query({
    vector: embedding,
    topK: settings.numChunks,
    includeMetadata: true,
  });

  const formattedChunks = queryResponse.matches.map((match) => ({
    text: match.metadata.text,
    score: match.score,
  }));
  console.log("Formatted Chunks:", JSON.stringify(formattedChunks, null, 2));

  return formattedChunks;
}

export async function POST(request) {
  console.log("POST request received");
  let { messages, fileName, relevantChunks } = await request.json();
  console.log("Current settings:", JSON.stringify(settings));
  console.log("Received fileName:", fileName);

  if (!fileName && settings.fileName) {
    console.log(
      `fileName is missing in request. Using settings.fileName: ${settings.fileName}`
    );
    fileName = settings.fileName;
  }

  if (!fileName && settings.isRAGEnabled) {
    console.error(
      "fileName is still missing after fallback. Cannot proceed with RAG."
    );
    return NextResponse.json(
      { error: "fileName is required for RAG" },
      { status: 400 }
    );
  }

  console.log("Using fileName:", fileName);

  const lastMessage = messages[messages.length - 1].content;
  console.log("Last message:", lastMessage);

  try {
    if (settings.isRAGEnabled && !relevantChunks) {
      console.log("RAG is enabled, querying Pinecone");
      const embedding = await getEmbedding(lastMessage);
      relevantChunks = await queryPinecone(embedding, fileName);

      // Send relevant chunks to ChunkDialog
      const chunkDialogResponse = new NextResponse(
        JSON.stringify({ relevantChunks })
      );
      chunkDialogResponse.headers.set("Content-Type", "application/json");
      chunkDialogResponse.headers.set("X-Is-Chunk-Dialog", "true");
      return chunkDialogResponse;
    }

    // Generate GPT response
    const ragContext =
      settings.isRAGEnabled && relevantChunks && relevantChunks.length > 0
        ? `Here are the relevant chunks of information:\n${relevantChunks
            .map((chunk) => chunk.text)
            .join(
              "\n\n"
            )}\n\nPlease use this information to answer the user's question.`
        : "";

    const fullSystemPrompt = `${systemPrompt}\n\n${ragContext}`;

    console.log("Calling OpenAI API");
    const completion = await openai.chat.completions.create({
      messages: [{ role: "system", content: fullSystemPrompt }, ...messages],
      model: "gpt-4o-mini",
      stream: true,
    });

    const stream = new ReadableStream({
      async start(controller) {
        const encoder = new TextEncoder();
        try {
          for await (const chunk of completion) {
            const content = chunk.choices[0]?.delta?.content;
            if (content) {
              const text = encoder.encode(content);
              controller.enqueue(text);
            }
          }
        } catch (error) {
          console.error("Error in stream processing:", error);
          controller.error(error);
        } finally {
          controller.close();
        }
      },
    });

    const response = new NextResponse(stream);
    response.headers.set("Content-Type", "text/event-stream");
    response.headers.set("Cache-Control", "no-cache");
    response.headers.set("Connection", "keep-alive");

    return response;
  } catch (error) {
    console.error("Error in POST request processing:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PUT(request) {
  const { isRAGEnabled, numChunks, fileName } = await request.json();
  console.log("Updating settings:", { isRAGEnabled, numChunks, fileName });
  if (isRAGEnabled !== undefined) settings.isRAGEnabled = isRAGEnabled;
  if (numChunks !== undefined) settings.numChunks = numChunks;
  if (fileName !== undefined) settings.fileName = fileName;
  console.log("Updated settings:", settings);
  return NextResponse.json({
    message: "Settings updated successfully",
    settings,
  });
}

export async function PATCH(request) {
  const { numChunks } = await request.json();
  console.log("Updating numChunks:", numChunks);
  if (numChunks !== undefined) {
    settings.numChunks = numChunks;
    console.log("Updated numChunks:", settings.numChunks);
    return NextResponse.json({
      message: "Number of chunks updated successfully",
      numChunks: settings.numChunks,
    });
  }
  return NextResponse.json({ error: "Invalid request" }, { status: 400 });
}
