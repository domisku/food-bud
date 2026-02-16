## Usage

Those templates dependencies are maintained via [pnpm](https://pnpm.io) via `pnpm up -Lri`.

This is the reason you see a `pnpm-lock.yaml`. That being said, any package manager will work. This file can be safely be removed once you clone a template.

```bash
$ npm install # or pnpm install or yarn install
```

## Setup

1. Copy `.env.example` to `.env` and fill in your environment variables:
   - Firebase configuration variables (`VITE_FIREBASE_*`)
   - Google Gemini API key (`VITE_GEMINI_API_KEY`) for AI-powered category suggestions

```bash
cp .env.example .env
# Edit .env with your actual API keys
```

## Features

- 📱 Progressive Web Application (PWA) - installable on mobile devices
- 🍽️ Create and manage dishes with rich text descriptions
- 🏷️ Organize dishes with custom categories
- 🤖 **AI-Powered Category Suggestions** - Get intelligent category recommendations using Google Gemini AI
- 🔍 Filter dishes by categories
- 🔐 Secure authentication with Firebase Auth

### Learn more on the [Solid Website](https://solidjs.com) and come chat with us on our [Discord](https://discord.com/invite/solidjs)

## Available Scripts

In the project directory, you can run:

### `npm dev` or `npm start`

Runs the app in the development mode.<br>
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

The page will reload if you make edits.<br>

### `npm run build`

Builds the app for production to the `dist` folder.<br>
It correctly bundles Solid in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.<br>
Your app is ready to be deployed!

## Deployment

You can deploy the `dist` folder to any static host provider (netlify, surge, now, etc.)
