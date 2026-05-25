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
  fontFamily: 'system-ui, -apple-system, sans-serif',
  fontSize: 16,
  lineHeight: 1.5,
  paragraphSpacing: 1.5,
  textColor: '#24292f',
  headingColor: '#24292f',
  backgroundColor: '#ffffff',
  accentColor: '#0969da',
};

export const fontOptions = [
  { name: 'Inter (Sans)', value: 'Inter' },
  { name: 'Space Grotesk (Sans)', value: '"Space Grotesk", sans-serif' },
  { name: 'Merriweather (Serif)', value: 'Merriweather, serif' },
  { name: 'Playfair Display (Serif)', value: '"Playfair Display", serif' },
  { name: 'JetBrains Mono (Monospace)', value: '"JetBrains Mono", monospace' },
  { name: 'System Sans', value: 'system-ui, -apple-system, sans-serif' },
];

export const defaultMarkdown = `# Markdown to PDF
### We've converted 26,34,351 Markdown files to PDF and counting!

To convert your Markdown to PDF simply start by typing in the editor or pasting from your clipboard.

If your Markdown is in a file clear this content and drop your file into this editor.

<sup style="display: inline-block;">**tip:** click on the pencil icon on the left to clear the editor)</sup>

## GitHub flavoured styling by default
We now use GitHub flavoured styling by default.

### Tables Supported natively via GFM

| Option | Value | Description |
|--------|-------|-------------|
| Font Size | 16px | The master size for body text |
| Layout | Default | Two-pane view |
`;
