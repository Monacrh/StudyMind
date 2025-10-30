## StudyMind 🤖

StudyMind AI is a web-based study assistant that helps students efficiently process and understand academic materials. Built with Chrome's experimental Built-in AI APIs, it provides comprehensive AI-powered study tools while keeping all data processing completely local and private.

The app features a retro-inspired UI and is designed to process text input and files (like PDFs) to perform various AI actions on them.

## ❗ The Problem
Students in non-English speaking countries face significant barriers to academic success:

- Language Barrier: Processing English academic materials takes 3-5x longer than for native speakers
- Privacy Concerns: Existing AI tools require uploading sensitive academic work to cloud servers
- Accessibility Issues: Cloud-based assistants need stable internet—unavailable for many students
- Cost Barriers: Subscription fees and API costs are unsustainable for students

Real Impact: A typical Indonesian STEM student spends 4-6 hours reading a single 20-page English research paper, then another 2-3 hours creating study materials.

## ✨ The Solution
StudyMind AI leverages Chrome's Built-in AI APIs to provide a comprehensive, privacy-respecting study assistant that:

- Processes content locally using on-device AI models (Gemini Nano)
- Works completely offline after initial page load
- Supports multiple input formats (PDFs, images, audio, text)
- Provides 6 AI-powered study tools that can run simultaneously
- Delivers results instantly with copy-to-clipboard functionality

## ✨ Key Features
Based on the components and services in this project, here are its primary functions:
- 📝 Summarize: Creates summaries from long text in various formats (key points, TL;DR, etc.).
- ❓ Generate Questions: Generates a list of questions (multiple-choice, essay, etc.) from the provided material to aid in studying.
- 🌐 Translate: Translates text between various languages, with support for auto-detection.
-  ✏️ Proofread: Checks and corrects grammar, spelling, and punctuation errors in a text.
- 🚀 Improve Writing: Rewrites text to change its tone (formal/casual), length (shorter/longer), or format.
- 🤔 Explain: Provides simple explanations for complex concepts in various styles (e.g., ELI5, analogies, step-by-step).
- 📄 PDF Text Extraction: Can upload PDF files and automatically extract their text content for AI processing.

## 🛠️ Tech Stack
- Framework: Next.js (running with Turbopack)
- Language: TypeScript
- UI: React
- Styling: Tailwind CSS
- Icons: Lucide React
- PDF Parsing: PDF.js
- Core AI: Chrome Built-in AI (Gemini Nano) API

## 🚀 Getting Started

First, Clone the repository:
```bash
git clone https://github.com/Monacrh/StudyMind.git
cd StudyMind
```
Second, install dependencies
```
npm install
```
Third, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

### 🔗 Live Demo: study-mind-nine.vercel.app
### 🎥 Demo Video: Watch on YouTube
### 🏆 Built for Chrome Built-in AI Challenge 2025
