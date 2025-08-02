# Near Health — Landing Page

Landing page for [Near Health](https://near.health), built with React + Vite.

## Prerequisites

- [Node.js](https://nodejs.org/) v18 or higher
- npm (comes with Node.js)

## Setup

```bash
# Install dependencies
npm install

# Copy environment file
cp .env.example .env
```

## Development

```bash
npm run dev
```

Opens at [http://localhost:5173](http://localhost:5173)

## Production Build

```bash
# Generate static files
npm run build

# Preview the production build locally
npm run preview
```

The build output goes to the `dist/` folder. Deploy this folder to any static hosting provider (Netlify, Vercel, GitHub Pages, S3, etc.).

## Project Structure

```
├── public/
│   └── assets/          # Videos, images, icons, Lottie files
├── src/
│   ├── App.jsx          # Root component
│   ├── App.css          # All styles
│   ├── main.jsx         # Entry point
│   ├── components/      # One component per page section
│   └── hooks/           # React hooks (scroll, animations)
├── index.html           # HTML template
├── vite.config.js       # Vite configuration
└── package.json
```
