/**
 * Browser-only sitemap tools. No user-provided URLs or XML are sent to a server.
 * Manual URL import is NOT a web crawler.
 */
export const MAX_SITEMAP_URLS = 1000
export const MAX_SITEMAP_INPUT_CHARS = 2_000_000
export const SITEMAP_NAMESPACE = 'http://www.sitemaps.org/schemas/sitemap/0.9'

export type SitemapIssue = {
  severity: 'error' | 'warning'
  message: string
  line?: number
}

export type GeneratedSitemap = {
  xml: string
  urls: string[]
  skipped: number
  duplicates: number
  issues: SitemapIssue[]
}

export type SitemapAudit = {
  valid: boolean
  kind: 'urlset' | 'sitemapindex' | 'unknown'
  count: number
  errorCount: number
  warningCount: number
  issues: SitemapIssue[]
}

function escapeXml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}

function isValidDate(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false
  const date = new Date(value + 'T00:00:00Z')
  return Number.isFinite(date.getTime()) && date.toISOString().slice(0, 10) === value
}

function parseWebUrl(value: string, base?: string): URL | null {
  try {
    const url = new URL(value, base)
    if (!['http:', 'https:'].includes(url.protocol) || !url.hostname || url.username || url.password) return null
    url.hash = ''
    if (url.href.length > 2048) return null
    return url
  } catch {
    return null
  }
}

export function createSitemap(input: string, baseInput = '', lastmod = ''): GeneratedSitemap {
  const issues: SitemapIssue[] = []
  const urls: string[] = []
  let skipped = 0
  let duplicates = 0
  const result = (): GeneratedSitemap => ({ xml: '', urls, skipped, duplicates, issues })

  if (input.length > MAX_SITEMAP_INPUT_CHARS) {
    issues.push({ severity: 'error', message: 'Input exceeds the 2 MB local processing limit.' })
    return result()
  }

  const base = baseInput.trim() ? parseWebUrl(baseInput.trim()) : null
  if (baseInput.trim() && !base) {
    issues.push({ severity: 'error', message: 'Base URL must be an absolute HTTP(S) address without credentials.' })
    return result()
  }

  if (lastmod && !isValidDate(lastmod)) {
    issues.push({ severity: 'error', message: 'Last modified date must be a real YYYY-MM-DD date.' })
    return result()
  }

  const lines = input.split(/\r?\n/)
  const seen = new Set<string>()
  let expectedOrigin = base?.origin

  for (let index = 0; index < lines.length; index++) {
    const raw = lines[index].trim()
    if (!raw || raw.startsWith('#') || /^url$/i.test(raw)) continue
    if (urls.length >= MAX_SITEMAP_URLS) {
      issues.push({ severity: 'warning', line: index + 1, message: 'Free browser tool limit: first 1,000 unique URLs processed.' })
      break
    }
    const parsed = parseWebUrl(raw, base?.href)
    if (!parsed) {
      skipped++
      if (issues.length < 40) issues.push({ severity: 'warning', line: index + 1, message: 'Invalid URL. Use an absolute HTTP(S) URL or a path with a valid base URL.' })
      continue
    }
    if (!expectedOrigin) expectedOrigin = parsed.origin
    if (parsed.origin !== expectedOrigin) {
      skipped++
      if (issues.length < 40) issues.push({ severity: 'warning', line: index + 1, message: 'Skipped URL from a different website/origin.' })
      continue
    }
    if (seen.has(parsed.href)) {
      duplicates++
      continue
    }
    seen.add(parsed.href)
    urls.push(parsed.href)
  }

  if (!urls.length) return result()

  const entries = urls.map((url) => [
    '  <url>',
    '    <loc>' + escapeXml(url) + '</loc>',
    ...(lastmod ? ['    <lastmod>' + lastmod + '</lastmod>'] : []),
    '  </url>',
  ].join('\n'))

  return {
    xml: '<?xml version="1.0" encoding="UTF-8"?>\n' +
      '<urlset xmlns="' + SITEMAP_NAMESPACE + '">\n' +
      entries.join('\n') + '\n</urlset>\n',
    urls,
    skipped,
    duplicates,
    issues,
  }
}

export function auditSitemap(xml: string): SitemapAudit {
  const issues: SitemapIssue[] = []
  let errorCount = 0
  let warningCount = 0
  let count = 0
  let kind: SitemapAudit['kind'] = 'unknown'
  const add = (severity: SitemapIssue['severity'], message: string, line?: number) => {
    if (severity === 'error') errorCount++
    else warningCount++
    if (issues.length < 80) issues.push({ severity, message, line })
  }
  const result = (): SitemapAudit => ({
    valid: errorCount === 0, kind, count, errorCount, warningCount, issues,
  })

  if (!xml.trim()) {
    add('error', 'Paste a sitemap XML file to validate.')
    return result()
  }
  if (xml.length > MAX_SITEMAP_INPUT_CHARS) {
    add('error', 'Input exceeds the 2 MB local processing limit.')
    return result()
  }
  if (/<!DOCTYPE\b/i.test(xml)) {
    add('error', 'DOCTYPE/DTD is not supported by this privacy-first validator.')
    return result()
  }

  const document = new DOMParser().parseFromString(xml, 'application/xml')
  const parserError = document.querySelector('parsererror')
  if (parserError) {
    add('error', 'XML syntax error: ' + (parserError.textContent?.trim() || 'Malformed XML.'))
    return result()
  }

  const root = document.documentElement
  if (root.localName === 'urlset') kind = 'urlset'
  else if (root.localName === 'sitemapindex') kind = 'sitemapindex'
  else {
    add('error', 'Root must be <urlset> or <sitemapindex>.')
    return result()
  }
  if (root.namespaceURI !== SITEMAP_NAMESPACE) add('error', 'Missing or incorrect sitemap XML namespace.')

  const entryName = kind === 'urlset' ? 'url' : 'sitemap'
  const entries = Array.from(root.children).filter(
    (child) => child.localName === entryName && child.namespaceURI === SITEMAP_NAMESPACE,
  )
  count = entries.length
  if (!count) add('error', 'No <' + entryName + '> entries found.')
  if (count > 50_000) add('error', 'A sitemap may contain at most 50,000 entries.')

  const seen = new Set<string>()
  let origin: string | undefined
  entries.forEach((entry, index) => {
    const child = (name: string): Element | undefined =>
      Array.from(entry.children).find((node) => node.localName === name && node.namespaceURI === SITEMAP_NAMESPACE)
    const loc = child('loc')?.textContent?.trim() || ''
    if (!loc) {
      add('error', 'Entry ' + (index + 1) + ': missing <loc>.')
      return
    }
    const parsed = parseWebUrl(loc)
    if (!parsed) {
      add('error', 'Entry ' + (index + 1) + ': invalid absolute HTTP(S) <loc>.')
      return
    }
    if (loc.includes('#')) add('warning', 'Entry ' + (index + 1) + ': fragment should not be in <loc>.')
    if (seen.has(parsed.href)) add('error', 'Entry ' + (index + 1) + ': duplicate URL.')
    seen.add(parsed.href)
    if (!origin) origin = parsed.origin
    if (origin !== parsed.origin) add('warning', 'Entry ' + (index + 1) + ': URL has a different origin.')
    const lastmod = child('lastmod')?.textContent?.trim()
    if (lastmod && !isValidDate(lastmod) && (!/^\d{4}-\d{2}-\d{2}T/.test(lastmod) || !Number.isFinite(Date.parse(lastmod)))) {
      add('warning', 'Entry ' + (index + 1) + ': invalid <lastmod> date.')
    }
  })
  return result()
}
