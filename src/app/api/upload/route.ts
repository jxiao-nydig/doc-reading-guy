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
    const purpose = formData.get('purpose') as string || 'assistants';

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

    // Forward the file to our FastAPI backend
    const newFormData = new FormData();
    newFormData.append('file', file);
    newFormData.append('api_key', apiKey);
    newFormData.append('purpose', purpose);

    const response = await fetch('http://localhost:9000/api/upload', {
      method: 'POST',
      body: newFormData,
    });

    if (!response.ok) {
      throw new Error(`Backend responded with status: ${response.status}`);
    }

    const data = await response.json();
    
    // Return the backend response with file_id, text_content, and page_count
    return NextResponse.json({
      file_id: data.file_id,
      filename: data.filename,
      purpose: data.purpose,
      bytes: data.bytes,
      text_content: data.text_content,
      page_count: data.page_count
    });
  } catch (error: any) {
    console.error('File upload error:', error);
    return NextResponse.json(
      { error: 'Failed to upload file', details: error.message },
      { status: 500 }
    );
  }
}
