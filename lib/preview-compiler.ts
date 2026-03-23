import type { ProjectFile } from './types';

function sanitizeHTML(html: string): string {
  // Basic sanitization - remove script tags and event handlers
  return html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/\bon\w+\s*=/gi, 'data-removed=')
    .replace(/javascript:/gi, '');
}

export function compileFiles(files: ProjectFile[]): string {
  const indexFile = files.find((f) => f.path === 'index.html' || f.path === 'index.htm');
  if (indexFile) {
    return sanitizeHTML(indexFile.content);
  }

  const htmlFiles = files.filter((f) => f.path.endsWith('.html') || f.path.endsWith('.htm'));
  if (htmlFiles.length > 0) {
    return sanitizeHTML(htmlFiles[0].content);
  }

  // Generate a simple preview from the first file
  const firstFile = files[0];
  if (!firstFile) return '<p>No files to preview</p>';

  if (firstFile.path.endsWith('.tsx') || firstFile.path.endsWith('.jsx')) {
    return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><title>Preview</title></head>
<body>
  <div id="root"></div>
  <p style="padding:20px;font-family:monospace;">React component: ${firstFile.path}</p>
</body>
</html>`;
  }

  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><title>Preview</title></head>
<body>
  <pre>${firstFile.content}</pre>
</body>
</html>`;
}
