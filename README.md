# ShikshaAI: Your AI Teaching Companion

ShikshaAI is an AI-powered teaching assistant designed to empower teachers in multi-grade, low-resource environments. It provides a suite of tools to help with content generation, lesson planning, student assessment, and more, with a focus on localization and accessibility.

## Features

- **AI Lesson Planner**: Generate comprehensive, week-long lesson plans for any grade, subject, and topic, complete with daily activities and assessment ideas.
- **Content Generation**: Create hyper-localized, culturally relevant stories and examples in multiple Indian languages to make learning more engaging.
- **Differentiated Worksheets**: Upload a photo of a textbook page and instantly generate worksheets tailored to beginner, intermediate, and advanced levels.
- **Instant Knowledge Base**: Get simple, clear explanations and analogies for any student question, with text-to-speech support to listen to the answers.
- **Visual Aid Designer**: Describe a concept, and the AI will generate a simple, high-contrast line drawing or chart that is easy to replicate on a blackboard.
- **Student Assessment & Progress Tracking**: Manage your student roster, track academic performance by subject, and receive AI-powered suggestions to support individual student needs.
- **Reading Assessment**: Generate grade-appropriate reading passages, listen to students read them, and get instant, constructive feedback on their fluency and pronunciation.
- **Sahayak AI Bot**: A versatile, conversational AI assistant that can explain concepts, create stories, or design visual aids on the fly.

## Tech Stack

- **Framework**: [Next.js](https://nextjs.org/) (with App Router)
- **UI**: [React](https://react.dev/), [TypeScript](https://www.typescriptlang.org/), [Tailwind CSS](https://tailwindcss.com/)
- **Components**: [ShadCN UI](https://ui.shadcn.com/)
- **AI Integration**: [Genkit](https://firebase.google.com/docs/genkit) (from Firebase)
- **Deployment**: [Firebase App Hosting](https://firebase.google.com/docs/hosting)

## Getting Started

Follow these instructions to get the project up and running on your local machine for development and testing purposes.

### Prerequisites

- [Node.js](https://nodejs.org/en) (v20 or later)
- [npm](https://www.npmjs.com/get-npm), [yarn](https://classic.yarnpkg.com/en/docs/install), or [pnpm](https://pnpm.io/installation)
- [Firebase CLI](https://firebase.google.com/docs/cli#install-cli-mac-linux) for deployment

### Setup

1.  **Clone the repository:**
    ```bash
    git clone <your-repository-url>
    cd <repository-directory>
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Set up environment variables:**

    You will need a Gemini API key to use the AI features.

    a. Visit [Google AI Studio](https://aistudio.google.com/app/apikey) to create an API key.

    b. Create a `.env` file in the root of your project and add your API key:
    ```
    GEMINI_API_KEY="your-api-key-here"
    ```

### Running the Development Server

The application consists of two main parts: the Next.js frontend and the Genkit AI flows. You'll need to run both concurrently in separate terminal tabs.

1.  **Start the Next.js development server:**
    This command runs the web application on `http://localhost:9002`.
    ```bash
    npm run dev
    ```

2.  **Start the Genkit development server:**
    This command starts the Genkit flows and provides a development UI on `http://localhost:4000` for inspecting your AI flows.
    ```bash
    npm run genkit:watch
    ```

Once both servers are running, you can open `http://localhost:9002` in your browser to see the app.

## Deployment

This application is configured for easy deployment with **Firebase App Hosting**.

1.  **Install the Firebase CLI** if you haven't already:
    ```bash
    npm install -g firebase-tools
    ```

2.  **Log in to Firebase:**
    ```bash
    firebase login
    ```

3.  **Initialize Firebase in your project:**
    ```bash
    firebase init hosting
    ```
    - When prompted, select an existing Firebase project or create a new one.
    - Choose **App Hosting** as the hosting type.
    - Follow the prompts to configure the hosting settings. The default `apphosting.yaml` file should be sufficient.

4.  **Deploy your application:**
    ```bash
    firebase deploy --only hosting
    ```

The command will provide you with the URL of your deployed application.