# Document Chunking Strategy Example

This file contains example code for implementing a more advanced document chunking strategy that could be added to the application in the future.

```python
# This would be added to app.py or a separate document_processing.py file

import re
from typing import List, Dict, Any
import numpy as np
from sentence_transformers import SentenceTransformer

class DocumentProcessor:
    def __init__(self):
        # Load embedding model for semantic search
        self.model = SentenceTransformer('all-MiniLM-L6-v2')
        
    def chunk_document(self, text: str, chunk_size: int = 1000, overlap: int = 200) -> List[str]:
        """
        Split a document into overlapping chunks of text.
        
        Args:
            text: The document text
            chunk_size: Target size of each chunk in characters
            overlap: Overlap between chunks in characters
            
        Returns:
            List of text chunks
        """
        # First try to split on double newlines (paragraphs)
        paragraphs = re.split(r'\n\s*\n', text)
        
        chunks = []
        current_chunk = ""
        
        for para in paragraphs:
            # If adding this paragraph would exceed chunk size, store current chunk and start a new one
            if len(current_chunk) + len(para) > chunk_size and current_chunk:
                chunks.append(current_chunk)
                # Keep some overlap for context
                current_chunk = current_chunk[-overlap:] if overlap > 0 else ""
            
            # Add paragraph to current chunk
            current_chunk += (para + "\n\n")
        
        # Don't forget the last chunk
        if current_chunk:
            chunks.append(current_chunk)
            
        return chunks
    
    def create_embeddings(self, chunks: List[str]) -> np.ndarray:
        """Create embeddings for each chunk for later similarity search"""
        return self.model.encode(chunks)
    
    def find_relevant_chunks(self, query: str, chunks: List[str], embeddings: np.ndarray, top_k: int = 3) -> List[str]:
        """Find the most relevant chunks for a query using cosine similarity"""
        query_embedding = self.model.encode(query)
        
        # Calculate cosine similarity
        similarities = np.dot(embeddings, query_embedding) / (
            np.linalg.norm(embeddings, axis=1) * np.linalg.norm(query_embedding)
        )
        
        # Get indices of top k chunks
        top_indices = np.argsort(-similarities)[:top_k]
        
        # Return the relevant chunks
        return [chunks[i] for i in top_indices]
    
    def process_document_for_query(self, document_text: str, query: str) -> str:
        """
        Process a document and find relevant sections for a specific query
        
        Args:
            document_text: The full document text
            query: User question
            
        Returns:
            Relevant document chunks to include in the prompt
        """
        # Split document into chunks
        chunks = self.chunk_document(document_text)
        
        # Create embeddings for all chunks
        embeddings = self.create_embeddings(chunks)
        
        # Find chunks most relevant to query
        relevant_chunks = self.find_relevant_chunks(query, chunks, embeddings)
        
        # Combine relevant chunks for context
        context = "\n\n--- Relevant Document Sections ---\n\n"
        context += "\n\n".join(relevant_chunks)
        
        return context

# Example usage in the chat endpoint:
"""
@app.post("/api/chat")
async def chat(request: ChatRequest):
    try:
        # Initialize OpenAI client with the provided API key
        client = OpenAI(api_key=request.api_key)
        
        # Initialize document processor
        doc_processor = DocumentProcessor()
        
        # Process document context from uploaded documents based on the query
        document_context = ""
        for file in uploaded_files:  # (This would need to be stored in a database or session)
            relevant_content = doc_processor.process_document_for_query(
                file.content, 
                request.user_message
            )
            document_context += f"Document: {file.name}\n{relevant_content}\n\n"
        
        # Create messages with relevant document context
        messages = [
            {"role": "system", "content": request.developer_message + "\n\n" + document_context},
            {"role": "user", "content": request.user_message}
        ]
        
        # Create streaming response as before...
"""
```

To implement this approach, you would need to add the following to your requirements.txt:

```
sentence-transformers>=2.2.0
numpy>=1.20.0
```

This approach enables the application to handle documents of any size by only including the most relevant chunks in the context window, selected dynamically based on the user's question.
