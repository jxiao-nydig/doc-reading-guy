# 🤖 The Doc Guy 

> Your docs just found their new BFF! A slick chat interface that lets you talk to your documents like they're old pals.

![The Doc Guy Screenshot](https://via.placeholder.com/800x400?text=The+Doc+Guy+Screenshot)

## 🚀 What's This Magic?

**The Doc Guy** is a smart chat interface that connects to a FastAPI backend, letting you have natural conversations with your documents. Upload PDFs or text files, ask questions about their content, and get intelligent answers - it's that simple and effective!

## ✨ Features

- 📄 **Document Processing** - Upload and process PDF and text documents
- 🔍 **Intelligent Chunking** - Documents are automatically split into semantic sections
- 💬 **Chat Interface** - Natural conversation with your documents
- � **Debugging Tools** - Visualize how documents are processed with the chunk debugging feature
- 📱 **Fully Responsive** - Works on desktop and mobile devices
- 🔒 **Privacy-Focused** - Uses your own API key for secure processing

## 🛠️ Tech Stack

- **Next.js** - React framework for the frontend
- **React** - UI component library
- **TypeScript** - Type-safe JavaScript
- **Tailwind CSS** - Utility-first CSS framework
- **FastAPI Backend** - Python-based API in the `/api` folder
- **OpenAI API** - For intelligent document processing and chat

## 🏃‍♂️ Getting Started

### Prerequisites

- Node.js v14+
- npm, yarn, or pnpm
- Python 3.9+
- OpenAI API Key

### Installation

1. Clone this repo:

```bash
git clone <repo-url>
cd doc-reading-guy
```

2. Install frontend dependencies:

```bash
npm install
# or
yarn install
```

3. Install backend dependencies:

```bash
cd api
pip install -r requirements.txt
cd ..
```

### Running the Application

1. Start the FastAPI backend server (from the project root):

```bash
cd api
uvicorn app:app --reload --port 9000
```

2. In a separate terminal, start the Next.js frontend:

```bash
npm run dev
# or
yarn dev
```

3. Open [http://localhost:3000](http://localhost:3000) in your browser to access the application.

## 📚 How to Use

### Basic Usage

1. **Enter your OpenAI API Key** in the input field at the top of the interface.
2. **Upload Documents** by clicking the "Upload Document" button and selecting PDF or TXT files (up to 10MB).
3. **Chat with your documents** by typing questions in the input field at the bottom of the screen.
4. **View responses** from the AI that incorporate information from your documents.

### Debug Features

We've added special debugging tools to help you understand how documents are processed:

1. After uploading a document, click the **"Debug Chunks"** button next to the file name.
2. A debugging panel will appear showing:
   - A dropdown list of all chunks extracted from the document
   - The content of the selected chunk
   - Information about chunk sizes and content quality

This feature is especially useful for:
- Verifying that document content is being properly extracted
- Understanding how the system divides your document into processable chunks
- Troubleshooting if the AI gives unexpected answers

## 🛠️ Recent Improvements

- **Enhanced PDF Extraction** - Fixed issues with document content extraction to ensure complete text is captured
- **Improved Chunking Logic** - Better handling of document sections with proper content preservation
- **Debugging UI** - Added visual tools to inspect document chunks
- **Increased Chunk Size** - Expanded maximum chunk size from 5000 to 8000 characters for better context
- **Error Handling** - Better fallbacks when section detection isn't optimal

## 💡 Troubleshooting

If you encounter issues with document processing:

1. **Check the Debug Chunks view** to see if content is being properly extracted
2. Ensure your **PDF is text-based** rather than scanned images
3. For **large documents**, try breaking them into smaller files
4. **API Key errors** will be shown in the interface - verify your key is correct

## 📄 License

[MIT License](LICENSE)