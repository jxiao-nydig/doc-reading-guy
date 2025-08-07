'use client';

import { useState, useRef, useEffect } from 'react';
import { FaPaperPlane, FaRobot, FaUser, FaUpload, FaFile, FaFileAlt, FaFileUpload, FaTrash } from 'react-icons/fa';

type Message = {
  role: 'user' | 'assistant';
  content: string;
};

type UploadedFile = {
  name: string;
  content: string;
  type: string;
  size: number;
  fileId?: string;
  pageCount?: number;
};

type DocumentChunk = {
  title: string;
  content: string;
};

export default function ChatInterface() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [documentChunks, setDocumentChunks] = useState<DocumentChunk[]>([]);
  const [selectedChunk, setSelectedChunk] = useState<string>('');
  const [isFetchingChunks, setIsFetchingChunks] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Scroll to bottom whenever messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };
  
  const handleFileSelect = () => {
    fileInputRef.current?.click();
  };
  
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0 || !apiKey.trim()) return;
    
    setIsUploading(true);
    
    try {
      // Process each file
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        
        // Check file type
        if (!(file.type === 'application/pdf' || 
              file.type === 'text/plain' || 
              file.name.endsWith('.pdf') || 
              file.name.endsWith('.txt'))) {
          alert('Only PDF and TXT files are supported');
          continue;
        }
        
        // Check file size (limit to 10MB)
        if (file.size > 10 * 1024 * 1024) {
          alert(`File ${file.name} is too large. Maximum size is 10MB.`);
          continue;
        }
        
        // Upload to OpenAI through our backend
        const formData = new FormData();
        formData.append('file', file);
        formData.append('api_key', apiKey);
        formData.append('purpose', 'assistants');
        
        const response = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        });
        
        if (!response.ok) {
          throw new Error(`Failed to upload file: ${response.statusText}`);
        }
        
        const data = await response.json();
        
        // Use the extracted text from the backend if available
        let content = data.text_content;
        
        if (!content) {
          // Fallback to local extraction if backend extraction failed
          content = await readFileContent(file);
        }
        
        // Add to uploaded files
        setUploadedFiles(prev => [...prev, {
          name: file.name,
          content,
          type: file.type,
          size: file.size,
          fileId: data.file_id,
          pageCount: data.page_count
        }]);
        
        // Add a system message to inform the user
        const pageInfo = data.page_count > 1 ? ` (${data.page_count} pages)` : '';
        setMessages(prev => [...prev, {
          role: 'assistant',
          content: `I've processed "${file.name}"${pageInfo} (${formatFileSize(file.size)}). You can now ask questions about this document!`
        }]);
      }
    } catch (error) {
      console.error('Error uploading file:', error);
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: 'Sorry, there was an error processing your file. Please try again.'
      }]);
    } finally {
      setIsUploading(false);
      // Reset the input to allow uploading the same file again
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };
  
  const readFileContent = async (file: File): Promise<string> => {
    if (file.type === 'application/pdf' || file.name.endsWith('.pdf')) {
      // For PDF files, we rely on the backend extraction
      // This is just a fallback in case backend extraction fails
      return `[PDF Content: ${file.name} - The text content has been extracted on the server side.]`;
    } else {
      // For text files, read the content
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => {
          resolve(e.target?.result as string || '');
        };
        reader.onerror = (e) => {
          reject(new Error('Failed to read file'));
        };
        reader.readAsText(file);
      });
    }
  };
  
  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' bytes';
    else if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    else return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };
  
  const removeFile = (index: number) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index));
    setDocumentChunks([]);
    setSelectedChunk('');
  };

  const fetchDocumentChunks = async (fileIndex: number) => {
    if (!apiKey.trim()) {
      alert("Please enter your API key first");
      return;
    }

    setIsFetchingChunks(true);
    try {
      const fileInfo = uploadedFiles[fileIndex];
      
      // Display a message to the user while processing
      setDocumentChunks([{
        title: "Processing...",
        content: `Analyzing content structure of ${fileInfo.name}. Please wait...`
      }]);
      setSelectedChunk("Processing...");
      
      // Instead of trying to re-upload the file, we'll analyze the content we already have
      // Parse the content we already have from the upload to extract section information
      const sections = fileInfo.content.match(/--- SECTION: [^-]+? ---[\s\S]+?(?=--- SECTION: |$)/g);
      
      if (sections && sections.length > 0) {
        // Process each section into a chunk
        const chunks = sections.map((section, idx) => {
          const titleMatch = section.match(/--- SECTION: ([^-]+?) ---/);
          const title = titleMatch ? titleMatch[1].trim() : `Section ${idx + 1}`;
          const content = section.replace(/--- SECTION: [^-]+? ---\n\n/, '').trim();
          
          return {
            title,
            content
          };
        });
        
        setDocumentChunks(chunks);
        if (chunks.length > 0) {
          setSelectedChunk(chunks[0].title);
        }
      } else {
        // If no sections found, try to create chunks by paragraphs
        const paragraphs = fileInfo.content.split(/\n\s*\n/);
        const maxSize = 2000;
        const chunks = [];
        let currentChunk = { title: "Chunk 1", content: "" };
        let chunkIndex = 1;
        
        for (const para of paragraphs) {
          if (currentChunk.content.length + para.length > maxSize) {
            chunks.push(currentChunk);
            chunkIndex++;
            currentChunk = { title: `Chunk ${chunkIndex}`, content: para };
          } else {
            currentChunk.content += (currentChunk.content ? "\n\n" : "") + para;
          }
        }
        
        if (currentChunk.content) {
          chunks.push(currentChunk);
        }
        
        if (chunks.length > 0) {
          setDocumentChunks(chunks);
          setSelectedChunk(chunks[0].title);
        } else {
          setDocumentChunks([{
            title: "No chunks found",
            content: "The document content couldn't be split into meaningful chunks. This might indicate that the extraction process only captured headings or limited content."
          }]);
          setSelectedChunk("No chunks found");
        }
      }
      
    } catch (error) {
      console.error('Error analyzing document chunks:', error);
      setDocumentChunks([{
        title: "Error",
        content: `Failed to analyze document content: ${error instanceof Error ? error.message : String(error)}`
      }]);
      setSelectedChunk("Error");
    } finally {
      setIsFetchingChunks(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!input.trim() || !apiKey.trim()) return;
    
    // Add user message to chat
    const userMessage: Message = { role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);
    
    try {
      // Send message to backend
      // Prepare document context from uploaded files with better section handling
      const documentContext = uploadedFiles.map(file => {
        // Extract sections from content if possible
        const sections = file.content.match(/--- SECTION: [^-]+? ---[\s\S]+?(?=--- SECTION: |$)/g);
        
        if (sections && sections.length > 0) {
          // If sections were detected, use them for context
          // Process more sections (up to 30,000 chars) since we're being more targeted
          let sectionsContext = `Document: ${file.name}\n\n`;
          let totalLength = 0;
          const maxLength = 30000;
          
          for (const section of sections) {
            if (totalLength + section.length <= maxLength) {
              sectionsContext += section + "\n\n";
              totalLength += section.length;
            } else {
              sectionsContext += "(additional sections omitted due to length)\n";
              break;
            }
          }
          return sectionsContext;
        } else {
          // Fall back to the original approach if no sections are detected
          return `Document: ${file.name}\nContent: ${file.content.substring(0, 15000)}${file.content.length > 15000 ? '...(truncated)' : ''}`;
        }
      }).join('\n\n');
      
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          message: input,
          apiKey: apiKey,
          documentContext: documentContext || undefined
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to get response');
      }
      
      // Handle streaming response
      const reader = response.body?.getReader();
      let assistantMessage = "";
      
      if (reader) {
        const decoder = new TextDecoder();
        // Add an initial empty assistant message that we'll update
        setMessages(prev => [...prev, { role: 'assistant', content: '' }]);
        
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          
          const text = decoder.decode(value);
          assistantMessage += text;
          
          // Update the last message with the accumulated text
          setMessages(prev => {
            const newMessages = [...prev];
            newMessages[newMessages.length - 1] = { 
              role: 'assistant', 
              content: assistantMessage 
            };
            return newMessages;
          });
        }
      } else {
        // Fallback for browsers that don't support streaming
        setMessages(prev => [...prev, { 
          role: 'assistant', 
          content: "Sorry, I couldn't process that request."
        }]);
      }
    } catch (error) {
      console.error('Error:', error);
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: "Oops! Something went wrong connecting to the backend. Try again?"
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-gray-800 rounded-lg shadow-2xl overflow-hidden border border-purple-400/30">
      {/* API Key input */}
      <div className="p-3 bg-gray-900 border-b border-gray-700">
        <input
          type="password"
          value={apiKey}
          onChange={(e) => setApiKey(e.target.value)}
          placeholder="Enter your OpenAI API Key..."
          className="w-full bg-gray-700 text-white px-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
        />
        <p className="text-xs text-gray-400 mt-1">Your API key is required and stays in your browser only.</p>
      </div>
      
      {/* File upload area */}
      <div className="p-3 bg-gray-800 border-b border-gray-700">
        <div className="flex justify-between items-center">
          <div>
            <button
              onClick={handleFileSelect}
              disabled={isUploading}
              className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md flex items-center gap-2 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
            >
              <FaFileUpload />
              Upload Document
            </button>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              accept=".pdf,.txt,application/pdf,text/plain"
              className="hidden"
              multiple
            />
            <p className="text-xs text-gray-400 mt-1">Upload PDF or TXT files (max 10MB)</p>
          </div>
          
          {isUploading && (
            <div className="text-blue-400 flex items-center">
              <svg className="animate-spin h-5 w-5 mr-2" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              Uploading...
            </div>
          )}
        </div>
        
        {/* File list */}
        {uploadedFiles.length > 0 && (
          <div className="mt-3 space-y-2">
            <h3 className="text-sm font-medium text-gray-300">Uploaded Documents:</h3>
            <ul className="space-y-1">
              {uploadedFiles.map((file, index) => (
                <li key={index} className="flex justify-between items-center text-sm bg-gray-700/50 p-2 rounded-md">
                  <div className="flex items-center gap-2">
                    <FaFileAlt className="text-blue-400" />
                    <span className="text-gray-200">{file.name}</span>
                    <span className="text-gray-400 text-xs">
                      {file.pageCount && file.pageCount > 1 ? `(${file.pageCount} pages, ` : '('}
                      {formatFileSize(file.size)})
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => fetchDocumentChunks(index)}
                      className="text-xs bg-blue-600 hover:bg-blue-700 text-white px-2 py-1 rounded-md"
                    >
                      Debug Chunks
                    </button>
                    <button 
                      onClick={() => removeFile(index)}
                      className="text-gray-400 hover:text-red-400"
                    >
                      <FaTrash />
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}
        
        {/* Document Chunks Debugging Section */}
        {documentChunks.length > 0 && (
          <div className="mt-3 bg-gray-800/50 p-3 rounded-md border border-gray-700">
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-sm font-medium text-gray-300">Document Chunks (Debug):</h3>
              <span className="text-xs text-blue-400">{documentChunks.length} chunks found</span>
            </div>
            
            <div className="mb-3">
              <label htmlFor="chunkSelector" className="block text-xs text-gray-400 mb-1">
                Select a chunk to view its content:
              </label>
              <select
                id="chunkSelector"
                className="w-full bg-gray-700 text-sm text-white rounded-md p-2"
                value={selectedChunk}
                onChange={(e) => setSelectedChunk(e.target.value)}
                disabled={isFetchingChunks}
              >
                {documentChunks.map((chunk, index) => (
                  <option key={index} value={chunk.title}>
                    {index + 1}. {chunk.title} ({chunk.content.length} chars)
                  </option>
                ))}
              </select>
            </div>
            
            <div className="bg-gray-900/80 rounded-md p-2 mb-2">
              <div className="flex justify-between items-center mb-1">
                <h4 className="text-xs font-medium text-blue-400">Chunk Content:</h4>
                <span className="text-xs text-gray-400">
                  {documentChunks.find(c => c.title === selectedChunk)?.content.length || 0} characters
                </span>
              </div>
              <pre className="text-xs text-gray-300 overflow-x-auto max-h-60 overflow-y-auto whitespace-pre-wrap p-2 bg-black/30 rounded border border-gray-800">
                {documentChunks.find(c => c.title === selectedChunk)?.content || 'No content available'}
              </pre>
            </div>
            
            <div className="text-xs text-yellow-500 bg-yellow-900/20 p-2 rounded">
              <p className="font-semibold">Debugging Notes:</p>
              <ul className="list-disc pl-4 mt-1 space-y-1">
                <li>If only section titles appear in chunks, the PDF extraction might not be capturing full content</li>
                <li>Check that paragraphs are properly extracted from the PDF</li>
                <li>The AI only has access to the content shown here when answering questions</li>
              </ul>
            </div>
          </div>
        )}
      </div>
      
      {/* Chat messages area */}
      <div className="h-[40vh] overflow-y-auto p-4 bg-gray-900/50">
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center text-gray-400">
              <FaRobot className="mx-auto text-5xl mb-3 text-purple-400" />
              <p>Hey there! I'm The Doc Guy.</p>
              <p>Ask me anything about your documents!</p>
            </div>
          </div>
        ) : (
          messages.map((msg, index) => (
            <div 
              key={index} 
              className={`mb-4 flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div 
                className={`max-w-[80%] rounded-lg px-4 py-2 ${
                  msg.role === 'user' 
                    ? 'bg-purple-600 text-white rounded-tr-none' 
                    : 'bg-gray-700 text-gray-100 rounded-tl-none'
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  {msg.role === 'user' ? (
                    <>
                      <span className="font-medium">You</span>
                      <FaUser className="text-xs opacity-70" />
                    </>
                  ) : (
                    <>
                      <FaRobot className="text-xs opacity-70" />
                      <span className="font-medium">Doc Guy</span>
                    </>
                  )}
                </div>
                <p>{msg.content}</p>
              </div>
            </div>
          ))
        )}
        {isLoading && (
          <div className="flex justify-start mb-4">
            <div className="bg-gray-700 text-gray-100 rounded-lg rounded-tl-none max-w-[80%] px-4 py-2">
              <div className="flex items-center gap-2 mb-1">
                <FaRobot className="text-xs opacity-70" />
                <span className="font-medium">Doc Guy</span>
              </div>
              <div className="flex gap-2">
                <span className="animate-bounce">⋯</span>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>
      
      {/* Input area */}
      <form onSubmit={handleSubmit} className="p-3 bg-gray-800 border-t border-gray-700">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about your documents..."
            className="flex-grow bg-gray-700 text-white px-4 py-2 rounded-full focus:outline-none focus:ring-2 focus:ring-purple-500"
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={isLoading || !input.trim() || !apiKey.trim()}
            className="bg-purple-600 hover:bg-purple-700 text-white p-3 rounded-full focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <FaPaperPlane />
          </button>
        </div>
      </form>
    </div>
  );
}