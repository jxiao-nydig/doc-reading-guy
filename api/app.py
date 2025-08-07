# Import required FastAPI components for building the API
from fastapi import FastAPI, HTTPException, UploadFile, File, Form
from fastapi.responses import StreamingResponse, JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

# Import required libraries
import os
import tempfile
import uuid
from typing import Optional, List

# Import PDF processing libraries
import PyPDF2

# For OpenAI API
from openai import OpenAI

# Initialize FastAPI application with a title
app = FastAPI(title="OpenAI Chat API")

# Configure CORS (Cross-Origin Resource Sharing) middleware
# This allows the API to be accessed from different domains/origins
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows requests from any origin
    allow_credentials=True,  # Allows cookies to be included in requests
    allow_methods=["*"],  # Allows all HTTP methods (GET, POST, etc.)
    allow_headers=["*"],  # Allows all headers in requests
)

# Define the data model for chat requests using Pydantic
# This ensures incoming request data is properly validated
class ChatRequest(BaseModel):
    developer_message: str  # Message from the developer/system
    user_message: str      # Message from the user
    model: Optional[str] = "gpt-4.1-mini"  # Optional model selection with default
    api_key: str          # OpenAI API key for authentication
    thread_id: Optional[str] = None  # Thread ID for continuing conversations

# Define a model for file upload responses
class FileUploadResponse(BaseModel):
    file_id: str
    filename: str
    purpose: str
    bytes: int
    text_content: Optional[str] = None
    page_count: Optional[int] = None

# Define the main chat endpoint that handles POST requests
@app.post("/api/chat")
async def chat(request: ChatRequest):
    try:
        # Initialize OpenAI client with the provided API key
        client = OpenAI(api_key=request.api_key)
        
        # Create an async generator function for streaming responses
        async def generate():
            # Prepare messages with document context if available
            messages = [
                {"role": "system", "content": request.developer_message},
                {"role": "user", "content": request.user_message}
            ]
            
            # Create a streaming chat completion request
            stream = client.chat.completions.create(
                model=request.model,
                messages=messages,
                stream=True,  # Enable streaming response
                # The document content is already embedded in the developer_message
            )
            
            # Yield each chunk of the response as it becomes available
            for chunk in stream:
                if chunk.choices[0].delta.content is not None:
                    yield chunk.choices[0].delta.content

        # Return a streaming response to the client
        return StreamingResponse(generate(), media_type="text/plain")
    
    except Exception as e:
        # Handle any errors that occur during processing
        raise HTTPException(status_code=500, detail=str(e))

# Add file upload endpoint - simplified version that focuses only on text extraction
@app.post("/api/upload")
async def upload_file(
    file: UploadFile = File(...),
    api_key: str = Form(...)
):
    try:
        # Create a temporary file to store the uploaded content
        with tempfile.NamedTemporaryFile(delete=False) as temp:
            # Write the file content to the temporary file
            content = await file.read()
            temp.write(content)
            temp_path = temp.name
        
        # Extract text if it's a PDF file
        text_content = None
        page_count = None
        
        if file.filename.lower().endswith('.pdf'):
            text_content, page_count = extract_text_from_pdf(temp_path)
        
        # For non-PDF text files, read the content directly
        elif file.filename.lower().endswith('.txt'):
            with open(temp_path, 'r', errors='ignore') as f:
                text_content = f.read()
            page_count = 1
        
        # Clean up the temporary file
        os.unlink(temp_path)
        
        # Generate a simple file ID just for frontend reference
        file_id = str(uuid.uuid4())
        
        # Return the file information with extracted text
        # This is what the frontend needs - the text content and metadata
        return FileUploadResponse(
            file_id=file_id,
            filename=file.filename,
            purpose="text-extraction-only",
            bytes=len(content),
            text_content=text_content,
            page_count=page_count
        )
        
    except Exception as e:
        # Handle any errors that occur during processing
        raise HTTPException(status_code=500, detail=str(e))

def extract_text_from_pdf(pdf_path):
    """Extract text content from a PDF file with section detection."""
    try:
        text_content = ""
        page_count = 0
        sections = {}
        full_text = ""
        
        import re
        
        # Regular expressions for common section/heading patterns
        section_patterns = [
            # Chapter/Section patterns (e.g., "Chapter 1: Introduction", "Section 2.1")
            r'^(?:chapter|section)\s+(\d+(?:\.\d+)?)(?:\s*:\s*|\s+)(.+)$',
            # Numbered headings (e.g., "1. Introduction", "2.1 Methods")
            r'^(\d+(?:\.\d+)?)\s+(.+)$',
            # All caps headings often used as section titles
            r'^([A-Z][A-Z\s]{4,})$',
            # Common heading keywords
            r'^(introduction|background|methodology|methods|results|discussion|conclusion|references|appendix)$'
        ]
        
        # Open the PDF file
        with open(pdf_path, 'rb') as file:
            # Create a PDF reader object
            pdf_reader = PyPDF2.PdfReader(file)
            page_count = len(pdf_reader.pages)
            
            # First pass: Extract all text from the document
            for page_num in range(page_count):
                page = pdf_reader.pages[page_num]
                page_text = page.extract_text() or f"[No extractable text on page {page_num + 1}]"
                full_text += f"\n\n----- PAGE {page_num + 1} -----\n\n"
                full_text += page_text
            
            # If extraction is failing, try a different approach - just create a single section
            if len(full_text.strip()) < 100 and page_count > 0:
                return f"\n\n--- SECTION: Full Document ---\n\n{full_text}", page_count
            
            # Second pass: Split the full text into sections
            current_section = "Document Start"
            sections[current_section] = ""
            
            # Process text line by line to detect section headings
            lines = full_text.split('\n')
            line_idx = 0
            
            while line_idx < len(lines):
                line = lines[line_idx].strip()
                line_idx += 1
                
                if not line:  # Skip empty lines
                    continue
                    
                # Check for section headings
                is_heading = False
                section_title = None
                
                for pattern in section_patterns:
                    match = re.match(pattern, line, re.IGNORECASE)
                    if match:
                        if len(match.groups()) > 1:
                            section_title = f"{match.group(1)}: {match.group(2)}"
                        else:
                            section_title = match.group(1)
                        is_heading = True
                        print(f"Detected section heading: {section_title}")
                        break
                
                # Also check for short lines that might be headings (heuristic)
                if not is_heading and len(line) < 50 and line.strip().istitle() and line_idx > 1 and line_idx < len(lines) - 1:
                    # Line is short, title case, and has text before and after it - likely a heading
                    section_title = line
                    is_heading = True
                
                # Handle section change or add content to current section
                if is_heading and section_title:
                    current_section = section_title
                    if current_section not in sections:
                        sections[current_section] = ""
                    sections[current_section] += f"\n\n## {current_section}\n\n"
                else:
                    # Add content to current section
                    sections[current_section] += line + "\n"
            
            # Add a fallback section with the entire document if sections are too small
            total_content_length = sum(len(content) for content in sections.values())
            if total_content_length < 100 or len(sections) <= 1:
                sections = {"Full Document": full_text}
            
            # Combine all sections with clear markers
            for section_name, section_content in sections.items():
                text_content += f"\n\n--- SECTION: {section_name} ---\n\n"
                text_content += section_content.strip() + "\n\n"
                
        return text_content, page_count
        
    except Exception as e:
        print(f"Error extracting text from PDF: {e}")
        return f"[Error extracting text: {str(e)}]", 0

def chunk_document_by_sections(text_content, max_chunk_size=8000, overlap=500):
    """
    Split the document into chunks based on sections.
    
    Args:
        text_content: The extracted text with section markers
        max_chunk_size: Maximum size of each chunk in characters
        overlap: Overlap between chunks in characters
        
    Returns:
        List of chunks with section information
    """
    # Split by section markers
    import re
    
    # Look for section markers like "--- SECTION: Introduction ---"
    section_splits = re.split(r'\n\n---\s*SECTION:\s*([^-]+)\s*---\n\n', text_content)
    
    # First item might be text before any section marker
    chunks = []
    current_chunk = {"title": "Document Start", "content": ""}
    
    if not section_splits or len(section_splits) <= 1:
        # If no sections found, create a single chunk with the entire content
        chunks = [{"title": "Full Document", "content": text_content}]
        return chunks
    
    if section_splits[0].strip() and not section_splits[0].strip().startswith('---'):
        current_chunk["content"] = section_splits[0]
    
    # Process each section
    for i in range(1, len(section_splits), 2):
        if i < len(section_splits):
            section_title = section_splits[i].strip()
            section_content = section_splits[i+1] if i+1 < len(section_splits) else ""
            
            # Make sure the section has actual content
            if not section_content.strip():
                continue
                
            # Format section content for readability
            formatted_section = f"\n\n## {section_title}\n\n{section_content.strip()}\n\n"
            
            # If adding this section would exceed max_chunk_size, start a new chunk
            if len(current_chunk["content"]) + len(formatted_section) > max_chunk_size and current_chunk["content"]:
                chunks.append(current_chunk)
                # Start new chunk with overlap from previous content if needed
                overlap_content = ""
                if overlap > 0 and current_chunk["content"]:
                    overlap_content = current_chunk["content"][-overlap:]
                current_chunk = {
                    "title": section_title,
                    "content": overlap_content + formatted_section
                }
            else:
                # Add to current chunk
                current_chunk["content"] += formatted_section
    
    # Don't forget the last chunk
    if current_chunk["content"]:
        chunks.append(current_chunk)
    
    # If no chunks were created, or all chunks are too small, something went wrong with section detection
    # Create a single chunk with the entire document content
    if not chunks or all(len(chunk["content"]) < 200 for chunk in chunks):
        return [{"title": "Full Document", "content": text_content}]
    
    # For chunks that are still too large, split them further
    final_chunks = []
    for chunk in chunks:
        if len(chunk["content"]) > max_chunk_size:
            # Split by paragraphs
            paragraphs = re.split(r'\n\s*\n', chunk["content"])
            sub_chunks = []
            sub_chunk = {"title": chunk["title"], "content": ""}
            
            for para in paragraphs:
                if len(sub_chunk["content"]) + len(para) > max_chunk_size and sub_chunk["content"]:
                    sub_chunks.append(sub_chunk)
                    overlap_content = ""
                    if overlap > 0:
                        overlap_content = sub_chunk["content"][-overlap:]
                    sub_chunk = {
                        "title": f"{chunk['title']} (continued)",
                        "content": overlap_content + para + "\n\n"
                    }
                else:
                    sub_chunk["content"] += para + "\n\n"
            
            if sub_chunk["content"]:
                sub_chunks.append(sub_chunk)
            
            final_chunks.extend(sub_chunks)
        else:
            final_chunks.append(chunk)
            
    # Final check to ensure we have meaningful chunks
    if not final_chunks:
        return [{"title": "Document Content", "content": text_content}]
        
    return final_chunks
    
    return final_chunks

@app.post("/api/chunk")
async def chunk_document(
    file: UploadFile = File(...),
    api_key: str = Form(...),
    max_chunk_size: int = Form(5000),
    overlap: int = Form(200)
):
    """
    Process a document and return it chunked by sections.
    This endpoint demonstrates the section-based chunking capability.
    """
    try:
        # Create a temporary file to store the uploaded content
        with tempfile.NamedTemporaryFile(delete=False) as temp:
            content = await file.read()
            temp.write(content)
            temp_path = temp.name
        
        # Process based on file type
        if file.filename.lower().endswith('.pdf'):
            # Extract text with section detection
            text_content, page_count = extract_text_from_pdf(temp_path)
            
            # Chunk the document by sections
            chunks = chunk_document_by_sections(text_content, max_chunk_size, overlap)
            
            # Clean up temp file
            os.unlink(temp_path)
            
            return {
                "filename": file.filename,
                "page_count": page_count,
                "chunk_count": len(chunks),
                "chunks": chunks
            }
            
        elif file.filename.lower().endswith('.txt'):
            # For text files, read the content and apply simple chunking
            with open(temp_path, 'r', errors='ignore') as f:
                text_content = f.read()
            
            # Apply paragraph-based chunking for text files
            chunks = []
            import re
            paragraphs = re.split(r'\n\s*\n', text_content)
            
            current_chunk = {"title": "Text Document", "content": ""}
            for para in paragraphs:
                if len(current_chunk["content"]) + len(para) > max_chunk_size and current_chunk["content"]:
                    chunks.append(current_chunk)
                    # Start new chunk with overlap
                    overlap_content = ""
                    if overlap > 0:
                        overlap_content = current_chunk["content"][-overlap:]
                    current_chunk = {
                        "title": "Text Document (continued)",
                        "content": overlap_content + para + "\n\n"
                    }
                else:
                    current_chunk["content"] += para + "\n\n"
            
            if current_chunk["content"]:
                chunks.append(current_chunk)
            
            # Clean up temp file
            os.unlink(temp_path)
            
            return {
                "filename": file.filename,
                "page_count": 1,
                "chunk_count": len(chunks),
                "chunks": chunks
            }
        else:
            # Unsupported file type
            os.unlink(temp_path)
            raise HTTPException(status_code=400, detail="Unsupported file type. Only PDF and TXT files are supported.")
            
    except Exception as e:
        print(f"Error in chunk_document: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# Debug endpoint to check PDF extraction
@app.post("/api/debug-extraction")
async def debug_extraction(file: UploadFile = File(...)):
    """
    Debug endpoint that returns the raw extracted text from a PDF.
    Useful for troubleshooting PDF extraction issues.
    """
    try:
        # Create a temporary file to store the uploaded content
        with tempfile.NamedTemporaryFile(delete=False) as temp:
            content = await file.read()
            temp.write(content)
            temp_path = temp.name
        
        if file.filename.lower().endswith('.pdf'):
            text_content, page_count = extract_text_from_pdf(temp_path)
            
            # Clean up temp file
            os.unlink(temp_path)
            
            # Count sections
            section_count = text_content.count("--- SECTION:")
            
            return {
                "filename": file.filename,
                "page_count": page_count,
                "section_count": section_count,
                "char_count": len(text_content),
                "word_count": len(text_content.split()),
                "text_sample": text_content[:1000] + "...(truncated)",
                "full_text": text_content  # Return the full extracted text
            }
        else:
            os.unlink(temp_path)
            return {"error": "Only PDF files are supported by this debug endpoint"}
            
    except Exception as e:
        print(f"Error in debug extraction: {e}")
        return {"error": str(e)}

# Define the health check endpoint to verify API status
@app.get("/api/health")
async def health_check():
    return {"status": "ok"}

# Entry point for running the application directly
if __name__ == "__main__":
    import uvicorn
    # Start the server on all network interfaces (0.0.0.0) on port 8000
    uvicorn.run(app, host="0.0.0.0", port=8000)
