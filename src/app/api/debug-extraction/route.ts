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

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    // Forward the file to our FastAPI backend
    const newFormData = new FormData();
    newFormData.append('file', file);

    const response = await fetch('http://localhost:9000/api/debug-extraction', {
      method: 'POST',
      body: newFormData,
    });

    if (!response.ok) {
      throw new Error(`Backend responded with status: ${response.status}`);
    }

    const data = await response.json();
    
    // Return the debug extraction data
    return NextResponse.json(data);
  } catch (error: any) {
    console.error('Debug extraction error:', error);
    return NextResponse.json(
      { error: 'Failed to debug extract file', details: error.message },
      { status: 500 }
    );
  }
}
