import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    // Check if the request is multipart/form-data
    if (!request.headers.get('content-type')?.includes('multipart/form-data')) {
      return NextResponse.json(
        { error: 'Content-Type must be multipart/form-data' },
        { status: 400 }
      );
    }

    // Get the form data
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const apiKey = formData.get('api_key') as string;
    const maxChunkSize = formData.get('max_chunk_size') as string || '5000';
    const overlap = formData.get('overlap') as string || '200';

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    if (!apiKey) {
      return NextResponse.json(
        { error: 'API key is required' },
        { status: 400 }
      );
    }

    // Forward the file to our FastAPI backend using the chunk API endpoint
    const newFormData = new FormData();
    newFormData.append('file', file);
    newFormData.append('api_key', apiKey);
    newFormData.append('max_chunk_size', maxChunkSize);
    newFormData.append('overlap', overlap);

    const response = await fetch('http://localhost:9000/api/chunk', {
      method: 'POST',
      body: newFormData,
    });

    if (!response.ok) {
      throw new Error(`Backend responded with status: ${response.status}`);
    }

    const data = await response.json();
    
    // Return the chunked document data
    return NextResponse.json(data);
  } catch (error: any) {
    console.error('File chunking error:', error);
    return NextResponse.json(
      { error: 'Failed to chunk file', details: error.message },
      { status: 500 }
    );
  }
}
