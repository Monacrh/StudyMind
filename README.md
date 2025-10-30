## StudyMind 🤖

StudyMind is a web application designed to assist your learning process. This application leverages Google Chrome's experimental built-in AI (Gemini Nano) APIs to provide various study tools that are privacy-first and offline-capable.

The app features a retro-inspired UI and is designed to process text input and files (like PDFs) to perform various AI actions on them.

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
