export interface StyleSettings {
  fontFamily: string;
  fontSize: number;
  lineHeight: number;
  paragraphSpacing: number;
  textColor: string;
  headingColor: string;
  backgroundColor: string;
  accentColor: string;
}

export const defaultSettings: StyleSettings = {
  fontFamily: 'Inter',
  fontSize: 16,
  lineHeight: 1.6,
  paragraphSpacing: 1.5,
  textColor: '#1f2937',  // tailwind gray-800
  headingColor: '#111827', // tailwind gray-900
  backgroundColor: '#ffffff',
  accentColor: '#3b82f6', // tailwind blue-500
};

export const fontOptions = [
  { name: 'Inter (Sans)', value: 'Inter' },
  { name: 'Space Grotesk (Sans)', value: '"Space Grotesk", sans-serif' },
  { name: 'Merriweather (Serif)', value: 'Merriweather, serif' },
  { name: 'Playfair Display (Serif)', value: '"Playfair Display", serif' },
  { name: 'JetBrains Mono (Monospace)', value: '"JetBrains Mono", monospace' },
  { name: 'System Sans', value: 'system-ui, -apple-system, sans-serif' },
];

export const defaultMarkdown = `# My Document

This is an **excellent** markdown-to-pdf converter utilizing React, standard web APIs, and KaTeX!

## Features
- **Live Preview:** See changes seamlessly as you type!
- **Rich Formatting:** Headers, lists, *italics*, and **bold** text.
- **Custom Styling:** Use the sidebar to tweak fonts, sizes, and colors.
- **PDF Export:** Click exactly one button to get an immediate, pristine PDF!

### Math (KaTeX)
Here's a standard formula inline $E = mc^2$, and here is a block:

$$
\\frac{n!}{k!(n-k)!} = \\binom{n}{k}
$$

### Code Highlighting
\`\`\`javascript
function convertToPdf() {
  console.log("Printing to PDF natively...");
  window.print();
}
\`\`\`

### Tables Supported natively via GFM

| Option | Value | Description |
|--------|-------|-------------|
| Font Size | 16px | The master size for body text |
| Layout | Default | Two-pane view |

> "Simplicity is the ultimate sophistication." — Leonardo da Vinci
`;
