# KubraCodess

A personal portfolio and blog built with Astro and Contentful. This website serves as a central hub for my projects, writings, and technical interests.

🔗 Live demo: [kubracodes-tau.vercel.app](https://kubracodes-tau.vercel.app)

---

## ✨ Features

### Portfolio

- Overview of personal projects  
- Descriptions, used technologies, and GitHub links  
- Visually appealing project cards

### Blog

- Blog posts managed via Contentful CMS  
- Dynamically generated pages based on content  
- Categories and tags for easy navigation  
- Markdown support with syntax highlighting  
- Built-in search bar for quick filtering

### Content Management with Contentful

- Intuitive content editing in the cloud  
- Real-time updates without touching code  
- Separation between content and codebase

### About Page

- Information about my current internship  
- Overview of technical skills and tools I work with  
- Insight into my learning journey and goals

### Responsive Design

- Optimized for desktop, tablet, and mobile  
- Dark mode available

---

## 🔧 Technical Details

### Built with

- [Astro](https://astro.build/) – static site generator  
- [Contentful](https://www.contentful.com/) – headless CMS  
- [TypeScript](https://www.typescriptlang.org/) – type safety  
- [Tailwind CSS](https://tailwindcss.com/) – utility-first CSS framework  
- [Markdown](https://www.markdownguide.org/) – used for blog content  
- [Vercel](https://vercel.com/) – hosting and deployment

### Project Structure

```plaintext
KubraCodess/
├── public/              # Static assets
├── src/
│   ├── components/      # Reusable UI components
│   ├── layouts/         # Page layouts
│   ├── pages/           # Route-based pages (Astro)
│   ├── lib/             # Contentful client + helpers
│   ├── types/           # TypeScript interfaces for content
│   └── styles/          # Tailwind and custom styles
├── astro.config.mjs     # Astro configuration
├── contentful.config.js # Contentful setup
└── tsconfig.json        # TypeScript configuration
```

---

## ⚙️ Contentful Integration

### Setup

1. Create a free account at [Contentful](https://www.contentful.com/)  
2. Create a “Space” and content models for blog posts and projects  
3. Add your `CONTENTFUL_SPACE_ID` and `CONTENTFUL_ACCESS_TOKEN` to a `.env` file

```plaintext
CONTENTFUL_SPACE_ID=your_space_id
CONTENTFUL_ACCESS_TOKEN=your_access_token
```

### Fetching Data

Content is fetched using the Contentful API during build time via Astro’s `getStaticPaths` / `getStaticProps`.

---

## 🚀 Getting Started

### Requirements

- Node.js (v16 or higher)  
- npm or yarn  
- Astro CLI

### Installation

```bash
git clone https://github.com/kubra-kzlk/KubraCodess.git
cd KubraCodess
npm install
npm run dev
```

The site will run at `http://localhost:3000`

---

## 🛠️ Development & Best Practices

- TypeScript for safer interfaces  
- Tailwind for efficient styling  
- Clear separation between code and content  
- Async rendering for blog posts and projects  
- Lazy loading and performance optimization

---


