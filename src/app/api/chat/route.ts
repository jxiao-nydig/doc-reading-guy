import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { message, apiKey, documentContext, fileIds } = body;

    // Create a system message with document context if available
    let developerMessage = "You are a helpful assistant that answers questions about documents. When answering questions about documents, ALWAYS reference the specific sections from the document to support your answer.";
    
    if (documentContext) {
      developerMessage += "\n\nHere are the document(s) to reference when answering questions. Each section is marked with '--- SECTION: [Section Name] ---'. Use these section names in your answers when referring to specific parts of the document:\n\n" + documentContext;
    }

    // Forward the request to your FastAPI backend
    // FastAPI backend is running on localhost:9000
    const response = await fetch('http://localhost:9000/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        developer_message: developerMessage,
        user_message: message,
        api_key: apiKey,
        model: "gpt-4.1-mini"
      }),
    });

    if (!response.ok) {
      throw new Error(`Backend responded with status: ${response.status}`);
    }

    // Return the streaming response
    const reader = response.body?.getReader();
    const stream = new ReadableStream({
      async start(controller) {
        if (!reader) {
          controller.close();
          return;
        }
        
        try {
          while (true) {
            const { done, value } = await reader.read();
            
            if (done) {
              controller.close();
              break;
            }
            
            controller.enqueue(value);
          }
        } catch (error) {
          console.error('Stream reading error:', error);
          controller.error(error);
        }
      }
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/plain',
      },
    });
  } catch (error: any) {
    console.error('API route error:', error);
    return NextResponse.json(
      { error: 'Failed to process request', details: error.message },
      { status: 500 }
    );
  }
}