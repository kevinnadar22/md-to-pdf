import express from "express";
import path from "path";
import puppeteer from "puppeteer";
import { createServer as createViteServer } from "vite";

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: "50mb" }));

  // API endpoints
  app.post("/api/generate-pdf", async (req, res) => {
    try {
      const { html, cssVariablesString } = req.body;

      const browser = await puppeteer.launch({
        args: ["--no-sandbox", "--disable-setuid-sandbox"],
      });
      const page = await browser.newPage();

      const fullHtml = `
        <!DOCTYPE html>
        <html>
        <head>
          <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/github-markdown-css/5.5.0/github-markdown-light.min.css">
          <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/katex@0.16.8/dist/katex.min.css">
          <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.8.0/styles/github.min.css">
          <style>
            :root {
              ${cssVariablesString}
            }
            body {
              background-color: white;
              margin: 0;
            }
            .markdown-body {
              font-family: var(--font-family) !important;
              font-size: var(--font-size) !important;
              line-height: var(--line-height) !important;
              color: var(--text-color) !important;
              background-color: var(--bg-color) !important;
            }
            .markdown-body h1, .markdown-body h2, .markdown-body h3, .markdown-body h4, .markdown-body h5, .markdown-body h6 {
              color: var(--heading-color) !important;
            }
            .markdown-body a {
              color: var(--accent-color) !important;
            }
          </style>
        </head>
        <body class="markdown-body">
          ${html}
        </body>
        </html>
      `;

      await page.setContent(fullHtml, { waitUntil: "networkidle0" });

      const pdfBuffer = await page.pdf({
        format: "A4",
        margin: {
          top: "20mm",
          right: "20mm",
          bottom: "20mm",
          left: "20mm",
        },
        printBackground: true,
      });

      await browser.close();

      res.setHeader("Content-Type", "application/pdf");
      res.setHeader("Content-Disposition", "attachment; filename=document.pdf");
      res.send(Buffer.from(pdfBuffer));
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Failed to generate PDF" });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
