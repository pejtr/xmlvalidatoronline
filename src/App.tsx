import { useMemo, useState, type ChangeEvent } from 'react'
import { auditHeurekaFeed } from './heurekaFeed'
import { auditSitemap, createSitemap, MAX_SITEMAP_INPUT_CHARS } from './sitemapTools'
import './App.css'

type ToolMode = 'generator' | 'sitemap' | 'xml' | 'heureka'

const SAMPLE_XML = `<?xml version="1.0" encoding="UTF-8"?>
<catalog>
  <book id="1">
    <title>XML Validator Online</title>
    <author>Example Author</author>
  </book>
</catalog>`

const SAMPLE_HEUREKA = `<?xml version="1.0" encoding="UTF-8"?>
<SHOP>
  <SHOPITEM>
    <ITEM_ID>sample-001</ITEM_ID>
    <PRODUCTNAME>Demo ceramic mug 300 ml</PRODUCTNAME>
    <PRICE_VAT>299</PRICE_VAT>
    <URL>https://example.com/products/demo-mug</URL>
    <CATEGORYTEXT>Home | Cups</CATEGORYTEXT>
    <IMGURL>https://example.com/images/demo-mug.jpg</IMGURL>
    <DELIVERY_DATE>0</DELIVERY_DATE>
  </SHOPITEM>
</SHOP>`

const SAMPLE_SITEMAP = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url><loc>https://example.com/</loc></url>
  <url><loc>https://example.com/about</loc></url>
</urlset>`

const SAMPLE_URLS = `https://example.com/
https://example.com/about
https://example.com/contact
https://example.com/blog`

const TOOLS: { id: ToolMode; icon: string; label: string; subtitle: string }[] = [
  { id: 'generator', icon: '↗', label: 'Sitemap Generator', subtitle: 'URL list → XML' },
  { id: 'sitemap', icon: '✓', label: 'Sitemap Validator', subtitle: 'Inspect sitemap.xml' },
  { id: 'xml', icon: '⌘', label: 'XML Validator', subtitle: 'Syntax & formatting' },
  { id: 'heureka', icon: '▤', label: 'Heureka Feed', subtitle: 'CZ feed lint' },
]

function parseXml(xml: string): { valid: boolean; message: string } {
  if (!xml.trim()) return { valid: false, message: 'Paste XML to begin.' }
  if (xml.length > MAX_SITEMAP_INPUT_CHARS) return { valid: false, message: 'Local input limit is 2 MB.' }
  if (/<!DOCTYPE\b/i.test(xml)) return { valid: false, message: 'DOCTYPE/DTD is not supported by this local tool.' }
  const document = new DOMParser().parseFromString(xml, 'application/xml')
  const error = document.querySelector('parsererror')
  return error
    ? { valid: false, message: error.textContent?.trim() || 'XML syntax error.' }
    : { valid: true, message: 'Well-formed XML. Schema validation is not included.' }
}

/* Conservatively format element-only XML; preserve mixed text instead of modifying content. */
function formatXml(xml: string): string {
  const validation = parseXml(xml)
  if (!validation.valid) throw new Error(validation.message)
  const document = new DOMParser().parseFromString(xml, 'application/xml')
  const serializer = new XMLSerializer()
  const pretty = (node: Node, depth: number): string => {
    if (node.nodeType !== Node.ELEMENT_NODE) return serializer.serializeToString(node)
    const children = Array.from(node.childNodes)
    const meaningfulText = children.some((child) =>
      (child.nodeType === Node.TEXT_NODE || child.nodeType === Node.CDATA_SECTION_NODE) && Boolean(child.textContent?.trim()),
    )
    const elementChildren = children.filter((child) => child.nodeType === Node.ELEMENT_NODE)
    if (meaningfulText || !elementChildren.length) return serializer.serializeToString(node)
    const full = serializer.serializeToString(node)
    const firstChild = full.indexOf('>')
    if (firstChild < 0) return full
    const startTag = full.slice(0, firstChild + 1)
    const endTag = '</' + (node as Element).tagName + '>'
    const lines = children
      .filter((child) => child.nodeType !== Node.TEXT_NODE || Boolean(child.textContent?.trim()))
      .map((child) => '  '.repeat(depth + 1) + pretty(child, depth + 1))
    return startTag + '\n' + lines.join('\n') + '\n' + '  '.repeat(depth) + endTag
  }
  const declaration = /^<\?xml[^?]*\?>/i.exec(xml.trim())?.[0]
  return (declaration ? declaration + '\n' : '') + pretty(document.documentElement, 0)
}

function minifyXml(xml: string): string {
  const validation = parseXml(xml)
  if (!validation.valid) throw new Error(validation.message)
  const document = new DOMParser().parseFromString(xml, 'application/xml')
  const serializer = new XMLSerializer()
  const clean = (node: Node) => {
    const hasElement = Array.from(node.childNodes).some((child) => child.nodeType === Node.ELEMENT_NODE)
    const hasText = Array.from(node.childNodes).some((child) =>
      (child.nodeType === Node.TEXT_NODE || child.nodeType === Node.CDATA_SECTION_NODE) && Boolean(child.textContent?.trim()),
    )
    if (hasElement && !hasText) {
      Array.from(node.childNodes).forEach((child) => {
        if (child.nodeType === Node.TEXT_NODE && !child.textContent?.trim()) node.removeChild(child)
      })
    }
    Array.from(node.childNodes).forEach(clean)
  }
  clean(document.documentElement)
  const declaration = /^<\?xml[^?]*\?>/i.exec(xml.trim())?.[0]
  return (declaration || '') + serializer.serializeToString(document.documentElement)
}

function download(content: string, filename: string, type: string) {
  const blob = new Blob([content], { type })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  link.remove()
  window.setTimeout(() => URL.revokeObjectURL(url), 1000)
}

function App() {
  const [mode, setMode] = useState<ToolMode>('generator')
  const [xml, setXml] = useState(SAMPLE_XML)
  const [urls, setUrls] = useState(SAMPLE_URLS)
  const [baseUrl, setBaseUrl] = useState('')
  const [lastmod, setLastmod] = useState('')
  const [notice, setNotice] = useState('')

  const generated = useMemo(() => createSitemap(urls, baseUrl, lastmod), [urls, baseUrl, lastmod])
  const sitemapReport = useMemo(() => mode === 'sitemap' ? auditSitemap(xml) : null, [mode, xml])
  const xmlReport = useMemo(() => mode === 'xml' ? parseXml(xml) : null, [mode, xml])
  const heurekaReport = useMemo(() => mode === 'heureka' ? auditHeurekaFeed(xml) : null, [mode, xml])
  const active = TOOLS.find((tool) => tool.id === mode)!

  const changeMode = (next: ToolMode) => {
    if (xml === SAMPLE_XML && next === 'sitemap') setXml(SAMPLE_SITEMAP)
    else if (xml === SAMPLE_XML && next === 'heureka') setXml(SAMPLE_HEUREKA)
    setMode(next)
    setNotice('')
  }
  const sample = () => {
    if (mode === 'generator') { setUrls(SAMPLE_URLS); setBaseUrl(''); setLastmod('') }
    else setXml(mode === 'sitemap' ? SAMPLE_SITEMAP : mode === 'heureka' ? SAMPLE_HEUREKA : SAMPLE_XML)
    setNotice('Demo loaded. No data uploaded.')
  }
  const clear = () => {
    if (mode === 'generator') setUrls('')
    else setXml('')
    setNotice('')
  }
  const copy = async () => {
    const value = mode === 'generator' ? generated.xml : xml
    if (!value) return
    try { await navigator.clipboard.writeText(value); setNotice('Copied to clipboard.') }
    catch { setNotice('Clipboard not available. Select and copy the text manually.') }
  }
  const importFile = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file) return
    if (file.size > MAX_SITEMAP_INPUT_CHARS) {
      setNotice('File exceeds the 2 MB local processing limit.')
      return
    }
    try {
      const text = await file.text()
      if (mode === 'generator') setUrls(text)
      else setXml(text)
      setNotice('File loaded locally. No upload was made.')
    } catch { setNotice('Could not read this file.') }
  }
  const transform = (type: 'format' | 'minify') => {
    try { setXml(type === 'format' ? formatXml(xml) : minifyXml(xml)); setNotice('Transformation completed locally.') }
    catch (error) { setNotice(error instanceof Error ? error.message : 'XML cannot be transformed.') }
  }
  const downloadResult = (format: 'xml' | 'txt') => {
    if (!generated.urls.length) return
    if (format === 'xml') download(generated.xml, 'sitemap.xml', 'application/xml;charset=utf-8')
    else download(generated.urls.join('\n') + '\n', 'sitemap.txt', 'text/plain;charset=utf-8')
    setNotice('File generated locally. Upload it to your website to publish it.')
  }

  return (
    <div className="site" id="top">
      <header className="site-header">
        <div className="container header-inner">
          <a className="brand" href="#top" aria-label="XML Validator Online home">
            <span className="brand-icon" aria-hidden="true">◇</span>
            <span>XML<span className="brand-accent">VALIDATOR</span><small>ONLINE</small></span>
          </a>
          <nav className="main-nav" aria-label="Main navigation">
            <a href="#workspace">Tools</a>
            <a href="#features">Features</a>
            <a href="#how-it-works">How it works</a>
          </nav>
          <span className="header-pill"><span className="green-dot" /> FREE · NO SIGN-UP</span>
        </div>
      </header>

      <main>
        <section className="hero">
          <div className="container hero-inner">
            <div className="hero-copy">
              <span className="kicker"><span className="kicker-dot" /> FREE ONLINE XML & SEO TOOLS</span>
              <h1>Free XML sitemap <span>generator &amp; validator.</span></h1>
              <p>Turn URL lists into clean sitemaps, validate XML and check product feeds — all in one fast, privacy-first workspace.</p>
              <div className="hero-chips"><span>✓ No account needed</span><span>✓ Browser-side processing</span><span>✓ Instant results</span></div>
              <a href="#workspace" className="primary-link">Open free tools <span aria-hidden="true">↗</span></a>
            </div>
            <div className="hero-visual" aria-hidden="true">
              <div className="visual-orbit orbit-one" /><div className="visual-orbit orbit-two" />
              <div className="visual-card visual-card-back"><span className="visual-label">SITEMAP.XML</span><code>&lt;urlset&gt;<br />&nbsp; &lt;url&gt;...&lt;/url&gt;<br />&lt;/urlset&gt;</code></div>
              <div className="visual-card visual-card-front"><span className="visual-success">✓</span><strong>Validation passed</strong><small>Ready for search engines</small><div className="visual-bars"><i /><i /><i /></div></div>
            </div>
          </div>
        </section>

        <section className="workspace-section" id="workspace">
          <div className="container">
            <div className="section-heading"><div><span className="section-kicker">YOUR WORKSPACE</span><h2>Choose your tool</h2><p>Simple input, clear results, no unnecessary steps.</p></div><span className="privacy-pill">⌁ Files stay on your device</span></div>
            <div className="workspace">
              <div className="tool-selector" role="tablist" aria-label="XML tools">
                {TOOLS.map((tool) => (
                  <button key={tool.id} type="button" role="tab" id={'tab-' + tool.id}
                    aria-selected={mode === tool.id} aria-controls="tool-panel" onClick={() => changeMode(tool.id)}
                    className={'tool-tab ' + (mode === tool.id ? 'active' : '')}>
                    <span className="tab-icon" aria-hidden="true">{tool.icon}</span>
                    <span className="tab-text"><strong>{tool.label}</strong><small>{tool.subtitle}</small></span>
                    <span className="tab-arrow" aria-hidden="true">→</span>
                  </button>
                ))}
                <div className="selector-note"><strong>Built for developers & SEOs</strong><p>Privacy-first XML processing, without registration.</p></div>
              </div>

              <div className="work-panel" id="tool-panel" role="tabpanel" aria-labelledby={'tab-' + mode}>
                <div className="panel-heading">
                  <div><span className="panel-eyebrow">FREE TOOL</span><h3>{active.label}</h3><p>{mode === 'generator' ? 'Convert a list of URLs into a standards-compliant sitemap.xml file.' : mode === 'sitemap' ? 'Check sitemap structure, required fields, URLs and duplicates.' : mode === 'xml' ? 'Check XML syntax and safely format or minify your document.' : 'Preliminary, unofficial checks for Heureka CZ XML feeds.'}</p></div>
                  <span className="local-chip">🔒 Local</span>
                </div>

                {mode === 'generator' ? (
                  <div className="panel-body">
                    <div className="field"><label htmlFor="base-url">Website base URL <span>(optional for absolute URLs)</span></label>
                      <input id="base-url" type="url" value={baseUrl} onChange={(event) => setBaseUrl(event.target.value)} placeholder="https://example.com" /></div>
                    <div className="field"><label htmlFor="url-list">Page URLs <span>(one per line; add a base URL for relative paths)</span></label>
                      <textarea id="url-list" value={urls} onChange={(event) => setUrls(event.target.value)} spellCheck={false} placeholder={'https://example.com/\nhttps://example.com/about'} /></div>
                    <div className="settings-row">
                      <div className="field"><label htmlFor="lastmod">Last modified <span>(optional; use only if accurate)</span></label><input id="lastmod" type="date" value={lastmod} onChange={(event) => setLastmod(event.target.value)} /></div>
                      <div className="setting-info"><strong>Honest metadata matters.</strong><span>We never invent modification dates or crawl pages.</span></div>
                    </div>
                    <div className="actions-row">
                      <button className="btn btn-primary" type="button" onClick={() => downloadResult('xml')} disabled={!generated.urls.length}>↓ Download sitemap.xml</button>
                      <button className="btn btn-secondary" type="button" onClick={() => downloadResult('txt')} disabled={!generated.urls.length}>TXT</button>
                      <label className="btn btn-secondary upload-label">↑ Import URL list<input type="file" accept=".txt,.csv,text/plain" onChange={importFile} /></label>
                      <button className="btn btn-secondary" type="button" onClick={copy} disabled={!generated.xml}>Copy XML</button>
                      <button className="btn btn-ghost" type="button" onClick={sample}>Example</button>
                      <button className="btn btn-ghost" type="button" onClick={clear}>Clear</button>
                    </div>
                    <div className="results-strip" aria-live="polite">
                      <div><strong>{generated.urls.length}</strong><span>Valid URLs</span></div><div><strong>{generated.duplicates}</strong><span>Duplicates removed</span></div><div><strong>{generated.skipped}</strong><span>Skipped URLs</span></div>
                    </div>
                    {generated.issues.length > 0 && <div className="issue-list"><strong>Input notes</strong><ul>{generated.issues.slice(0, 12).map((issue, index) => <li key={index}>{issue.line ? 'Line ' + issue.line + ': ' : ''}{issue.message}</li>)}</ul></div>}
                    {generated.xml && <details className="xml-preview"><summary>Preview generated XML</summary><pre>{generated.xml.slice(0, 16000)}{generated.xml.length > 16000 ? '\n… Preview truncated' : ''}</pre></details>}
                    <p className="disclaimer">Manual URL-list generator — it does not crawl websites or verify live URL status. Limit: 1,000 unique URLs per run. Upload the downloaded file to your own site.</p>
                  </div>
                ) : (
                  <div className="panel-body">
                    <div className="field"><label htmlFor="xml-input">{mode === 'sitemap' ? 'Paste your sitemap XML' : mode === 'heureka' ? 'Paste Heureka XML feed' : 'Paste XML document'}</label>
                      <textarea id="xml-input" value={xml} onChange={(event) => setXml(event.target.value)} spellCheck={false} placeholder="Paste XML here..." /></div>
                    <div className="actions-row">
                      <label className="btn btn-secondary upload-label">↑ Open file<input type="file" accept=".xml,.txt,.csv,text/plain,text/xml,application/xml" onChange={importFile} /></label>
                      {mode === 'xml' && <><button className="btn btn-secondary" type="button" onClick={() => transform('format')}>Format</button><button className="btn btn-secondary" type="button" onClick={() => transform('minify')}>Minify</button></>}
                      <button className="btn btn-secondary" type="button" onClick={copy} disabled={!xml}>Copy</button>
                      <button className="btn btn-ghost" type="button" onClick={sample}>Example</button>
                      <button className="btn btn-ghost" type="button" onClick={clear}>Clear</button>
                    </div>
                    {mode === 'sitemap' && sitemapReport && <div className={'report-card ' + (sitemapReport.valid ? 'report-pass' : 'report-fail')} aria-live="polite"><strong>{sitemapReport.valid ? '✓ Basic sitemap checks passed' : '⚠ Sitemap needs attention'}</strong><p>{sitemapReport.count} entries · {sitemapReport.errorCount} errors · {sitemapReport.warningCount} warnings · Type: {sitemapReport.kind}</p><p className="disclaimer">Checks XML structure and selected sitemap rules; not an XSD, live crawl, indexing or Search Console test.</p>{sitemapReport.issues.length > 0 && <ul className="findings">{sitemapReport.issues.map((issue, index) => <li key={index}>{issue.severity.toUpperCase()}: {issue.message}</li>)}</ul>}</div>}
                    {mode === 'xml' && xmlReport && <div className={'report-card ' + (xmlReport.valid ? 'report-pass' : 'report-fail')} aria-live="polite"><strong>{xmlReport.valid ? '✓ XML syntax valid' : '⚠ XML needs attention'}</strong><p>{xmlReport.message}</p></div>}
                    {mode === 'heureka' && heurekaReport && <div className={'report-card ' + (heurekaReport.valid ? 'report-pass' : 'report-fail')} aria-live="polite"><strong>{heurekaReport.valid ? '✓ No issues in limited checks' : '⚠ Feed needs attention'}</strong><p>{heurekaReport.itemCount} items · {heurekaReport.errorCount} errors · {heurekaReport.warningCount} warnings</p>{heurekaReport.findings.length > 0 && <ul className="findings">{heurekaReport.findings.map((finding, index) => <li key={index}><strong>{finding.severity.toUpperCase()}</strong>{finding.itemNumber ? ' · Item ' + finding.itemNumber : ''} · {finding.message}</li>)}</ul>}{heurekaReport.truncated && <p>Only the first 100 findings are shown.</p>}<p className="disclaimer">Unofficial, limited-scope checks. Not Heureka certification or a test of live product URLs. <a href="https://sluzby.heureka.cz/napoveda/xml-feed/" target="_blank" rel="noreferrer">Official specification ↗</a></p></div>}
                    <p className="disclaimer">Parsed in your browser. No document upload, server-side validation or XSD validation.</p>
                  </div>
                )}
                <div className="panel-footer"><span>✓ No sign-up</span><span>✓ No XML upload</span><span>✓ Private by default</span></div>
                {notice && <p className="notice" role="status">{notice}</p>}
              </div>
            </div>
          </div>
        </section>

        <section className="benefits" id="features"><div className="container">
          <div className="center-heading"><span className="section-kicker">BUILT FOR YOUR WORKFLOW</span><h2>Everything you need for clean XML</h2><p>Practical tools for websites, feeds and technical SEO.</p></div>
          <div className="benefit-grid">
            <article><span className="benefit-icon">◇</span><h3>Standards-oriented</h3><p>Generate sitemaps with correct XML escaping and the official sitemap namespace.</p></article>
            <article><span className="benefit-icon">☑</span><h3>Clear validation</h3><p>Spot malformed XML, missing sitemap locations, repeated links and invalid addresses.</p></article>
            <article><span className="benefit-icon">◎</span><h3>Privacy first</h3><p>Your pasted XML, feed documents and URLs remain in this browser workspace.</p></article>
          </div>
        </div></section>

        <section className="steps" id="how-it-works"><div className="container">
          <div className="center-heading"><span className="section-kicker">THREE SIMPLE STEPS</span><h2>From input to clean output</h2></div>
          <div className="step-grid"><article><b>01</b><h3>Choose a tool</h3><p>Generate sitemaps or validate XML and Heureka feeds.</p></article><article><b>02</b><h3>Paste or import</h3><p>Provide your data; processing stays on your device.</p></article><article><b>03</b><h3>Review & download</h3><p>Fix issues, export sitemap.xml and publish it yourself.</p></article></div>
        </div></section>

        <section className="qa-banner"><div className="container banner-inner"><div><span className="section-kicker">FOR TECHNICAL TEAMS</span><h2>Need more advanced QA workflows?</h2><p>Explore the wider QA ecosystem. This is an external link; no XML is transmitted.</p></div><a href="https://omnicore.cz/" target="_blank" rel="noopener noreferrer">Explore QA tools ↗</a></div></section>
      </main>
      <footer className="footer"><div className="container footer-inner"><span><strong>XML Validator Online</strong> · Free browser-side XML utilities.</span><span>© 2026 · Privacy-first · Independent Heureka lint</span></div></footer>
    </div>
  )
}

export default App
