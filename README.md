# 🤖 The Doc Guy 

> Your docs just found their new BFF! A slick chat interface that lets you talk to your documents like they're old pals.AD
<p align = "center" draggable=”false” ><img src="https://github.com/AI-Maker-Space/LLM-Dev-101/assets/37101144/d1343317-fa2f-41e1-8af1-1dbb18399719" 
     width="200px"
     height="auto"/>
</p>


## <h1 align="center" id="heading"> 👋 Welcome to the AI Engineer Challenge</h1>

## 🤖 Your First Vibe Coding LLM Application

> If you are a novice, and need a bit more help to get your dev environment off the ground, check out this [Setup Guide](docs/GIT_SETUP.md). This guide will walk you through the 'git' setup you need to get started.

> For additional context on LLM development environments and API key setup, you can also check out our [Interactive Dev Environment for LLM Development](https://github.com/AI-Maker-Space/Interactive-Dev-Environment-for-AI-Engineers).

In this repository, we'll walk you through the steps to create a LLM (Large Language Model) powered application with a vibe-coded frontend!

Are you ready? Let's get started!

<details>
  <summary>🖥️ Accessing "gpt-4.1-mini" (ChatGPT) like a developer</summary>

1. Head to [this notebook](https://colab.research.google.com/drive/1sT7rzY_Lb1_wS0ELI1JJfff0NUEcSD72?usp=sharing) and follow along with the instructions!

2. Complete the notebook and try out your own system/assistant messages!

That's it! Head to the next step and start building your application!

</details>


<details>
  <summary>🏗️ Forking & Cloning This Repository</summary>

Before you begin, make sure you have:

1. 👤 A GitHub account (you'll need to replace `YOUR_GITHUB_USERNAME` with your actual username)
2. 🔧 Git installed on your local machine
3. 💻 A code editor (like Cursor, VS Code, etc.)
4. ⌨️ Terminal access (Mac/Linux) or Command Prompt/PowerShell (Windows)
5. 🔑 A GitHub Personal Access Token (for authentication)

Got everything in place? Let's move on!

1. Fork [this](https://github.com/AI-Maker-Space/The-AI-Engineer-Challenge) repo!

     ![image](https://i.imgur.com/bhjySNh.png)

1. Clone your newly created repo.

     ``` bash
     # First, navigate to where you want the project folder to be created
     cd PATH_TO_DESIRED_PARENT_DIRECTORY

     # Then clone (this will create a new folder called The-AI-Engineer-Challenge)
     git clone git@github.com:<YOUR GITHUB USERNAME>/The-AI-Engineer-Challenge.git
     ```

     > Note: This command uses SSH. If you haven't set up SSH with GitHub, the command will fail. In that case, use HTTPS by replacing `git@github.com:` with `https://github.com/` - you'll then be prompted for your GitHub username and personal access token.

2. Verify your git setup:

     ```bash
     # Check that your remote is set up correctly
     git remote -v

     # Check the status of your repository
     git status

     # See which branch you're on
     git branch
     ```

     <!-- > Need more help with git? Check out our [Detailed Git Setup Guide](docs/GIT_SETUP.md) for a comprehensive walkthrough of git configuration and best practices. -->

3. Open the freshly cloned repository inside Cursor!

     ```bash
     cd The-AI-Engineering-Challenge
     cursor .
     ```

4. Check out the existing backend code found in `/api/app.py`

</details>

<details>
  <summary>🔥Setting Up for Vibe Coding Success </summary>

While it is a bit counter-intuitive to set things up before jumping into vibe-coding - it's important to remember that there exists a gradient betweeen AI-Assisted Development and Vibe-Coding. We're only reaching *slightly* into AI-Assisted Development for this challenge, but it's worth it!

1. Check out the rules in `.cursor/rules/` and add theme-ing information like colour schemes in `frontend-rule.mdc`! You can be as expressive as you'd like in these rules!
2. We're going to index some docs to make our application more likely to succeed. To do this - we're going to start with `CTRL+SHIFT+P` (or `CMD+SHIFT+P` on Mac) and we're going to type "custom doc" into the search bar. 

     ![image](https://i.imgur.com/ILx3hZu.png)
3. We're then going to copy and paste `https://nextjs.org/docs` into the prompt.

     ![image](https://i.imgur.com/psBjpQd.png)

4. We're then going to use the default configs to add these docs to our available and indexed documents.

     ![image](https://i.imgur.com/LULLeaF.png)

5. After that - you will do the same with Vercel's documentation. After which you should see:

     ![image](https://i.imgur.com/hjyXhhC.png) 

</details>

<details>
  <summary>😎 Vibe Coding a Front End for the FastAPI Backend</summary>

1. Use `Command-L` or `CTRL-L` to open the Cursor chat console. 

2. Set the chat settings to the following:

     ![image](https://i.imgur.com/LSgRSgF.png)

3. Ask Cursor to create a frontend for your application. Iterate as much as you like!

4. Run the frontend using the instructions Cursor provided. 

> NOTE: If you run into any errors, copy and paste them back into the Cursor chat window - and ask Cursor to fix them!

> NOTE: You have been provided with a backend in the `/api` folder - please ensure your Front End integrates with it!

</details>

<details>
  <summary>🚀 Deploying Your First LLM-powered Application with Vercel</summary>

1. Ensure you have signed into [Vercel](https://vercel.com/) with your GitHub account.

2. Ensure you have `npm` (this may have been installed in the previous vibe-coding step!) - if you need help with that, ask Cursor!

3. Run the command:

     ```bash
     npm install -g vercel
     ```

4. Run the command:

     ```bash
     vercel
     ```

5. Follow the in-terminal instructions. (Below is an example of what you will see!)

     ![image](https://i.imgur.com/D1iKGCq.png)

6. Once the build is completed - head to the provided link and try out your app!

> NOTE: Remember, if you run into any errors - ask Cursor to help you fix them!

</details>

### Vercel Link to Share

You'll want to make sure you share you *domains* hyperlink to ensure people can access your app!

![image](https://i.imgur.com/mpXIgIz.png)

> NOTE: Test this is the public link by trying to open your newly deployed site in an Incognito browser tab!

### 🎉 Congratulations! 

You just deployed your first LLM-powered application! 🚀🚀🚀 Get on linkedin and post your results and experience! Make sure to tag us at @AIMakerspace!

Here's a template to get your post started!

```
🚀🎉 Exciting News! 🎉🚀

🏗️ Today, I'm thrilled to announce that I've successfully built and shipped my first-ever LLM using the powerful combination of , and the OpenAI API! 🖥️

Check it out 👇
[LINK TO APP]

A big shoutout to the @AI Makerspace for all making this possible. Couldn't have done it without the incredible community there. 🤗🙏

Looking forward to building with the community! 🙌✨ Here's to many more creations ahead! 🥂🎉

Who else is diving into the world of AI? Let's connect! 🌐💡

#FirstLLMApp 
```


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
