import JSZip from 'jszip';
import { saveAs } from 'file-saver';

export async function exportNextJsMultiPage(data, templateId) {
  const zip = new JSZip();

  // 1. Data file
  zip.file("data.json", JSON.stringify(data, null, 2));

  // 2. package.json
  const packageJson = {
    "name": "portfolio-export",
    "version": "0.1.0",
    "private": true,
    "scripts": {
      "dev": "next dev",
      "build": "next build",
      "start": "next start",
      "lint": "next lint"
    },
    "dependencies": {
      "react": "^18",
      "react-dom": "^18",
      "next": "14.2.3",
      "lucide-react": "^0.378.0"
    },
    "devDependencies": {
      "typescript": "^5",
      "@types/node": "^20",
      "@types/react": "^18",
      "@types/react-dom": "^18",
      "postcss": "^8",
      "tailwindcss": "^3.4.1"
    }
  };
  zip.file("package.json", JSON.stringify(packageJson, null, 2));

  // 3. Tailwind config
  zip.file("tailwind.config.ts", `import type { Config } from "tailwindcss";
const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: { extend: {} },
  plugins: [],
};
export default config;`);

  zip.file("postcss.config.mjs", `/** @type {import('postcss-load-config').Config} */
const config = { plugins: { tailwindcss: {}, autoprefixer: {} } };
export default config;`);

  // 4. Global CSS
  zip.file("app/globals.css", `@tailwind base;
@tailwind components;
@tailwind utilities;

body {
  background-color: #f8fafc;
  color: #0f172a;
}`);

  // 5. Layout
  zip.file("app/layout.tsx", `import type { Metadata } from "next";
import "./globals.css";
import Link from "next/link";

export const metadata: Metadata = {
  title: "${data.header?.name || 'Portfolio'}",
  description: "${data.header?.tagline || 'My personal portfolio'}",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <nav className="p-6 border-b border-gray-200 flex gap-6 justify-center bg-white font-bold">
          <Link href="/" className="hover:text-blue-600">Home</Link>
          <Link href="/about" className="hover:text-blue-600">About</Link>
          <Link href="/projects" className="hover:text-blue-600">Projects</Link>
          <Link href="/contact" className="hover:text-blue-600">Contact</Link>
        </nav>
        <main className="min-h-screen">
          {children}
        </main>
      </body>
    </html>
  );
}`);

  // 6. Pages
  // Home
  zip.file("app/page.tsx", `import data from '../data.json';

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] text-center px-4">
      <h1 className="text-5xl md:text-7xl font-black mb-6">{data.header?.name || 'Your Name'}</h1>
      <p className="text-2xl text-gray-600 mb-4">{data.header?.title || 'Software Engineer'}</p>
      <p className="text-lg text-gray-500 max-w-2xl">{data.header?.tagline}</p>
    </div>
  );
}`);

  // About
  zip.file("app/about/page.tsx", `import data from '../../data.json';

export default function About() {
  return (
    <div className="max-w-4xl mx-auto p-8 py-20">
      <h1 className="text-4xl font-black mb-8">About Me</h1>
      <p className="text-lg leading-relaxed whitespace-pre-wrap mb-12">{data.about}</p>
      
      <h2 className="text-2xl font-bold mb-6">Skills & Tech Stack</h2>
      <div className="flex flex-wrap gap-3">
        {(Array.isArray(data.skills) ? data.skills : []).map((skill: string, i: number) => (
          <span key={i} className="px-4 py-2 bg-white border border-gray-200 rounded-full shadow-sm font-medium">
            {skill}
          </span>
        ))}
      </div>
    </div>
  );
}`);

  // Projects
  zip.file("app/projects/page.tsx", `import data from '../../data.json';

export default function Projects() {
  return (
    <div className="max-w-6xl mx-auto p-8 py-20">
      <h1 className="text-4xl font-black mb-12 text-center">Featured Projects</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {(Array.isArray(data.projects) ? data.projects : []).map((proj: any, i: number) => (
          <div key={i} className="bg-white border border-gray-200 p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow">
            <h3 className="text-xl font-bold mb-3">{proj.name}</h3>
            <p className="text-gray-600 mb-6">{proj.description}</p>
            <div className="flex flex-wrap gap-2 mt-auto">
              {(Array.isArray(proj.techStack) ? proj.techStack : []).map((tech: string, j: number) => (
                <span key={j} className="text-xs bg-gray-100 px-2 py-1 rounded">{tech}</span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}`);

  // Contact
  zip.file("app/contact/page.tsx", `import data from '../../data.json';

export default function Contact() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
      <h1 className="text-4xl font-black mb-8">Get In Touch</h1>
      <div className="flex flex-col gap-4 text-xl">
        {data.contact?.email && <a href={\`mailto:\${data.contact.email}\`} className="hover:text-blue-600">📧 {data.contact.email}</a>}
        {data.contact?.github && <a href={data.contact.github} target="_blank" className="hover:text-blue-600">💻 GitHub Profile</a>}
        {data.contact?.linkedin && <a href={data.contact.linkedin} target="_blank" className="hover:text-blue-600">💼 LinkedIn Profile</a>}
      </div>
    </div>
  );
}`);

  // Generate ZIP and trigger download
  const blob = await zip.generateAsync({ type: "blob" });
  saveAs(blob, "portfolio-nextjs-multipage.zip");
}
