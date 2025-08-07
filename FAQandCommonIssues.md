# Frequently Asked Questions

If you run into an issue, please feel free to submit a PR or Issue and we can add to this doc!

## File Upload Questions

### What file types are supported?
Currently, the application supports:
- PDF files (`.pdf`)
- Plain text files (`.txt`)

The system automatically detects the file type and processes it accordingly.

### Is there a file size limit?
Yes, there is a 10MB file size limit enforced in the frontend. This is to ensure reasonable processing times and avoid overloading the system.

## Text Processing Limitations

### What happens with very large documents?
Currently, the system has these limitations:

1. **Frontend truncation**: Documents over 10,000 characters are truncated in the prompt sent to the AI model.
2. **Model context window**: Most AI models have a context window of 16-32k tokens, which limits how much text can be processed at once.

### How can I process larger documents effectively?
For the best results with large documents:
- Split large documents into smaller, logical sections before uploading
- Ask specific questions that focus on particular sections of the document
- Consider implementing the improved chunking strategy described below

## Implemented Chunking Strategy

We've implemented an advanced section-based chunking strategy:

1. **Section-based chunking**: Documents are automatically split by detected section headings (chapters, numbered sections, etc.)
2. **Smart section detection**: The system uses pattern matching and heuristics to identify section boundaries in PDFs
3. **Structure preservation**: Document structure is maintained by preserving section titles and boundaries
4. **Configurable parameters**: Chunk size and overlap are adjustable

To use this advanced chunking:
- Upload your document using the `/api/chunk` endpoint
- The system will return the document split into logical sections
- You can then select the most relevant sections for your query

## Future Enhancements

To further improve document handling:
1. **Embedding-based retrieval**: Use vector embeddings to find relevant sections when a question is asked
2. **Dynamic context building**: Only include the most relevant chunks in each prompt
3. **Hybrid retrieval**: Combine section-based chunking with embedding-based retrieval

These enhancements would allow for processing arbitrarily large documents while maintaining high-quality responses.
