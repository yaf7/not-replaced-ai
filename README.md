# ⚡ NotReplaced.ai

> **An AI-powered career threat assessment tool built for Hoobit Hacks 2026 (AI Apocalypse Theme).**

![Next.js](https://img.shields.io/badge/Next.js-14+-black?style=for-the-badge&logo=next.js)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4.0-38B2AC?style=for-the-badge&logo=tailwind-css)
![Google Gemini](https://img.shields.io/badge/Google_Gemini-3.0_Flash-4285F4?style=for-the-badge&logo=google)

**Will AI replace you?** NotReplaced.ai is a sleek, modern web application that analyzes any profession to determine its vulnerability to AI automation. Instead of just delivering doom-and-gloom statistics, it provides professionals with an actionable **Survival Roadmap**, recommended **AI Co-pilot tools**, and highlights the **Human Edge** skills they need to master to stay relevant.

---

## ✨ Features

- 🔍 **Instant Analysis:** Enter any job title to get a comprehensive, AI-generated threat report within seconds.
- 📊 **Dynamic Threat Gauge:** A visual representation of the automation risk (SAFE to CRITICAL) with a detailed 5-year timeline.
- 🤖 **AI Co-Pilot Recommendations:** Tailored suggestions for generative AI tools to integrate into your workflow right now.
- 🗺️ **Survival Roadmap:** A step-by-step actionable guide spanning from "Now" to "3 Years" on how to pivot and future-proof your career.
- 🗂️ **Search History:** Automatically saves your recent queries using Local Storage for quick comparisons.
- 🎨 **Premium Cyberpunk UI:** Fully responsive, dark-mode-first aesthetic with glassmorphism, dynamic particle backgrounds, and smooth SVG animations using Lucide React.

---

## 🛠️ Tech Stack

- **Framework:** [Next.js](https://nextjs.org/) (App Router)
- **Styling:** Vanilla CSS + Tailwind CSS v4
- **Icons:** [Lucide React](https://lucide.dev/)
- **AI Engine:** Google Gemini API (`gemini-3-flash-preview`)
- **Deployment:** Vercel

---

## 🚀 Getting Started

To run this project locally, follow these steps:

### 1. Clone the repository
```bash
git clone https://github.com/yaf7/not-replaced-ai.git
cd not-replaced-ai
```

### 2. Install dependencies
```bash
npm install
```

### 3. Set up environment variables
Create a `.env.local` file in the root directory and add your Google Gemini API key:
```env
GEMINI_API_KEY=your_gemini_api_key_here
```

### 4. Run the development server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

---

## 📝 Hoobit Hacks 2026 Disclosure

To comply with the hackathon guidelines (Rule #5), this outlines how Artificial Intelligence is utilized within this project:

1. **Data Generation & Analysis:** The core engine uses the **Google Gemini API**. Threat percentages, timelines, and roadmaps are AI-generated estimations based on aggregated patterns from global economic trends (e.g., World Economic Forum, McKinsey).
2. **Development Process:** AI was utilized during the coding phase (as permitted in the rules) to accelerate UI styling, CSS animations, and Next.js route generation. **AI was NOT used** to conceptualize the core idea, define the problem statement, or write the presentation scripts.

---

## 👨‍💻 Credits

Engineered and designed by **Deyafa Arsetya** for Hoobit Hacks 2026.
