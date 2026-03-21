import type { ProjectFile } from './types'

export type CompileResult = {
  html: string
  hasErrors: boolean
  errorMessage: string | null
}

const EXTERNAL_SCRIPT_ALLOWLIST = [
  'cdn.jsdelivr.net',
  'cdnjs.cloudflare.com',
  'unpkg.com',
]

function isAllowedExternalSrc(src: string): boolean {
  try {
    const url = new URL(src)
    return EXTERNAL_SCRIPT_ALLOWLIST.includes(url.host)
  } catch {
    return false
  }
}

export function sanitizeHTML(html: string): string {
  const doc = html
  return doc
    .replace(/<script\s+src="[^"]*"[^>]*>/gi, (match) => {
      const srcMatch = match.match(/src="([^"]*)"/)
      if (srcMatch && !isAllowedExternalSrc(srcMatch[1])) {
        return ''
      }
      return match
    })
    .replace(/<link\s+rel="stylesheet"\s+href="[^"]*"[^>]*\/?>/gi, (match) => {
      const hrefMatch = match.match(/href="([^"]*)"/)
      if (hrefMatch && !isAllowedExternalSrc(hrefMatch[1])) {
        return ''
      }
      return match
    })
}

export function compileFiles(files: ProjectFile[]): CompileResult {
  try {
    if (!files || files.length === 0) {
      return {
        html: '<html><body><p>No files to preview.</p></body></html>',
        hasErrors: false,
        errorMessage: null,
      }
    }

    let html = '<!DOCTYPE html><html><head></head><body></body></html>'

    const indexFile = files.find(
      (f) => f.path.includes('index.html') || f.name === 'index.html'
    )
    if (indexFile) {
      html = indexFile.content
    }

    const cssFiles = files.filter((f) => f.language === 'css')
    const jsFiles = files.filter((f) => f.language === 'javascript')

    for (const css of cssFiles) {
      const styleTag = `<style>\n${css.content}\n</style>`
      html = html.replace('</head>', `${styleTag}</head>`)
    }

    for (const js of jsFiles) {
      const scriptTag = `<script>
try {
${js.content}
} catch(e) {
  window.__previewError = e.message;
  document.body.innerHTML += '<div id="preview-error">' + e.message + '</div>';
}
</script>`
      html = html.replace('</body>', `${scriptTag}</body>`)
    }

    return {
      html,
      hasErrors: false,
      errorMessage: null,
    }
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    return {
      html: '<html><body><p>Preview error.</p></body></html>',
      hasErrors: true,
      errorMessage: message,
    }
  }
}
