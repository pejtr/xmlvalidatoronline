import { useEffect, useMemo, useRef, useState } from 'react'
import { auditHeurekaFeed } from './heurekaFeed'
import './App.css'

const SAMPLE_XML = `<?xml version="1.0" encoding="UTF-8"?>
<catalog>
  <book id="1">
    <title>XML Validator Online</title>
    <author>ONYX QA</author>
  </book>
</catalog>`

const SAMPLE_HEUREKA_XML = `<?xml version="1.0" encoding="UTF-8"?>
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

type ValidationResult = {
  valid: boolean
  message: string
}

function parseXml(xml: string): { doc: XMLDocument; error: string | null } {
  const doc = new DOMParser().parseFromString(xml, 'application/xml')
  const parserError = doc.querySelector('parsererror')
  return {
    doc,
    error: parserError?.textContent?.trim() || null,
  }
}

function formatXml(xml: string): string {  const { error } = parseXml(xml)
  if (error) throw new Error(error)

  const compact = xml
    .replace(/>\s+</g, '><')
    .replace(/(<\/?[^>]+>)/g, '\n$1\n')
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)

  let indent = 0
  return compact
    .map((line) => {
      const isClosing = /^<\//.test(line)
      const isSelfClosing = /\/>$/.test(line) || /^<\?/.test(line) || /^<!/.test(line)
      const isOpening = /^<[^/!?][^>]*>$/.test(line) && !line.includes('</')

      if (isClosing) indent = Math.max(0, indent - 1)
      const formatted = `${'  '.repeat(indent)}${line}`
      if (isOpening && !isSelfClosing) indent += 1
      return formatted
    })
    .join('\n')
}

function minifyXml(xml: string): string {
  const { error } = parseXml(xml)
  if (error) throw new Error(error)
  return xml.replace(/>\s+</g, '><').trim()
}

function App() {
  const [xml, setXml] = useState(SAMPLE_XML)
  const [showHeurekaAudit, setShowHeurekaAudit] = useState(false)
  const [feedback, setFeedback] = useState<{ text: string; error: boolean } | null>(null)
  const editorRef = useRef<HTMLTextAreaElement>(null)
  const reportRef = useRef<HTMLElement>(null)
  const heurekaReport = useMemo(() => showHeurekaAudit ? auditHeurekaFeed(xml) : null, [xml, showHeurekaAudit])

  const validation = useMemo<ValidationResult>(() => {
    if (!xml.trim()) return { valid: false, message: 'Paste XML to start.' }
    const { error } = parseXml(xml)
    return error
      ? { valid: false, message: error }
      : { valid: true, message: 'XML is well-formed.' }
  }, [xml])

  // The report is below the editor: make the result visible after enabling lint.
  useEffect(() => {
    if (showHeurekaAudit) reportRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }, [showHeurekaAudit])

  const loadSample = (value: string, label: string) => {
    setXml(value)
    setShowHeurekaAudit(label === 'Heureka')
    setFeedback({ text: label + ' XML example loaded.', error: false })
  }

  const runTransform = (type: 'format' | 'minify') => {
    if (!xml.trim()) {
      setFeedback({ text: 'Paste or load an XML document first.', error: true })
      return
    }
    try {
      const result = type === 'format' ? formatXml(xml) : minifyXml(xml)
      setXml(result)
      setFeedback({
        text: result === xml
          ? (type === 'format' ? 'XML is already formatted.' : 'XML is already minified.')
          : (type === 'format' ? 'XML formatted locally.' : 'XML minified locally.'),
        error: false,
      })
    } catch (error) {
      setFeedback({
        text: 'XML could not be transformed: ' + (error instanceof Error ? error.message : 'invalid syntax'),
        error: true,
      })
    }
  }

  const copyXml = async () => {
    if (!xml) {
      setFeedback({ text: 'Nothing to copy. Paste XML or load a sample first.', error: true })
      return
    }
    try {
      if (navigator.clipboard?.writeText && window.isSecureContext) {
        await navigator.clipboard.writeText(xml)
      } else {
        // Fallback for browsers that do not expose the asynchronous Clipboard API.
        const editor = editorRef.current
        if (!editor) throw new Error('Editor unavailable')
        editor.focus()
        editor.select()
        if (!document.execCommand('copy')) throw new Error('Copy not permitted')
        editor.setSelectionRange(0, 0)
      }
      setFeedback({ text: 'XML copied to clipboard.', error: false })
    } catch {
      setFeedback({ text: 'Copy was blocked by your browser. Select the XML and press Ctrl+C (or Cmd+C).', error: true })
    }
  }

  const toggleHeurekaAudit = () => {
    const enabled = !showHeurekaAudit
    setShowHeurekaAudit(enabled)
    setFeedback({ text: enabled ? 'Heureka feed lint enabled. See the report below.' : 'Heureka feed lint hidden.', error: false })
  }

  return (
    <div className="os-desktop" id="home">
      <div className="ambient-scene" aria-hidden="true">
        <div className="ambient-stars" />
        <div className="ambient-horizon" />
        <div className="ambient-planet"><div className="ambient-ring" /></div>
        <div className="ambient-skyline" />
        <div className="ambient-ground" />
        <div className="ambient-scanlines" />
      </div>
      <div className="os-frame">
        <header className="os-system-bar">
          <div className="os-identity"><span aria-hidden="true">◈</span> ONYX OS <span className="version">1.0</span></div>
          <nav aria-label="System navigation">
            <a href="#xml-tool">XML TOOL</a>
            <a href="#features">FEATURES</a>
            <a href="#qa-pro">QA PRO</a>
          </nav>
          <span className="system-ready"><span className="ready-led" aria-hidden="true" /> LOCAL</span>
        </header>
        <div className="os-workspace">
          <aside className="os-sidebar" aria-label="Quick navigation">
            <a href="#home"><span aria-hidden="true">⌂</span>HOME</a>
            <a href="#xml-tool" className="selected" aria-current="location"><span aria-hidden="true">⌘</span>XML TOOL</a>
            <button type="button" onClick={() => loadSample(SAMPLE_XML, 'Sample')}><span aria-hidden="true">▣</span>SAMPLE</button>
            <a href="#features"><span aria-hidden="true">▤</span>FEATURES</a>
            <a href="#qa-pro"><span aria-hidden="true">◇</span>QA PRO</a>
          </aside>
          <main className="shell">
            <div className="window-header">
              <strong><span aria-hidden="true">▣</span> XML VALIDATOR ONLINE</strong>
              <span className="privacy">Runs locally in your browser</span>
            </div>

      <section className="hero">
        <p className="eyebrow">Developer utility</p>
        <h1>Validate, format and minify XML online.</h1>
        <p className="lead">
          Fast, deterministic XML syntax checking with no upload required.
        </p>
      </section>

      <section className="tool" id="xml-tool">
        <div className="toolbar">
          <button type="button" className="live-badge" onClick={() => setFeedback({ text: validation.valid ? 'Live check: XML is well-formed.' : 'Live check: ' + validation.message, error: !validation.valid })}>Live validation</button>
          <button type="button" onClick={() => runTransform('format')}>Format</button>
          <button type="button" onClick={() => runTransform('minify')}>Minify</button>
          <button type="button" onClick={() => loadSample(SAMPLE_XML, 'Sample')}>Sample</button>
          <button type="button" onClick={() => loadSample(SAMPLE_HEUREKA_XML, 'Heureka')}>Heureka sample</button>
          <button type="button" onClick={toggleHeurekaAudit} aria-pressed={showHeurekaAudit}>
            {showHeurekaAudit ? 'Hide Heureka lint' : 'Heureka feed lint'}
          </button>
          <button type="button" onClick={copyXml}>Copy</button>
          <button type="button" onClick={() => { setXml(''); setShowHeurekaAudit(false); setFeedback({ text: 'Editor cleared.', error: false }); editorRef.current?.focus() }}>Clear</button>
        </div>

        {feedback && (
          <div className={`action-feedback ${feedback.error ? 'action-error' : ''}`} role="status" aria-live="polite">
            {feedback.text}
          </div>
        )}

        <textarea
          ref={editorRef}
          value={xml}
          onChange={(event) => { setXml(event.target.value); setFeedback(null) }}
          spellCheck={false}
          aria-label="XML input"
          placeholder="Paste XML here..."
        />

        <div className={`status ${validation.valid ? 'valid' : 'invalid'}`}>
          <strong>{validation.valid ? '✓ Valid XML' : '✕ XML needs attention'}</strong>
          <span>{validation.message}</span>
        </div>
      </section>

      {heurekaReport && (
        <section className="heureka-report" id="heureka-report" ref={reportRef} aria-label="Preliminary Heureka feed lint">
          <h2>Heureka XML feed — preliminary checks</h2>
          <p>
            Unofficial, limited-scope lint based on public Heureka CZ XML documentation.
            Runs locally in your browser. It does not verify live product pages, feed access,
            category matching, customer verification or Marketplace eligibility.
          </p>
          <p>
            <strong>{heurekaReport.itemCount} items</strong> · {heurekaReport.errorCount} errors · {heurekaReport.warningCount} warnings
          </p>
          {heurekaReport.findings.length === 0 ? (
            <p>No issues found by these limited checks. This is not a full feed approval.</p>
          ) : (
            <ul className="heureka-findings">
              {heurekaReport.findings.map((finding, index) => (
                <li key={finding.code + '-' + index}>
                  <strong>{finding.severity.toUpperCase()}</strong>
                  {finding.itemNumber ? ' · Item ' + finding.itemNumber : ''}
                  {' · ' + finding.message}
                </li>
              ))}
            </ul>
          )}
          {heurekaReport.truncated && <p>Only the first 100 findings are shown; totals include all issues.</p>}
          <p>
            <a href="https://sluzby.heureka.cz/napoveda/xml-feed/" target="_blank" rel="noreferrer">
              Official Heureka XML feed specification
            </a>
          </p>
        </section>
      )}

      <section className="features" id="features">
        <article>
          <h2>XML syntax validator</h2>
          <p>Check whether your XML is well-formed before it reaches production.</p>
        </article>
        <article>
          <h2>Formatter & minifier</h2>
          <p>Switch between readable XML and compact transport-friendly output.</p>
        </article>
        <article>
          <h2>Privacy first</h2>
          <p>Your XML stays in the browser in this baseline version.</p>
        </article>
      </section>

      <section className="roadmap">
        <h2>Coming next</h2>
        <p>XSD validation, file upload, API access and optional AI error explanations.</p>
      </section>

      <section className="qa-pro-bridge" id="qa-pro">
        <div>
          <p className="eyebrow">NEXT LEVEL · ONYX ECOSYSTEM</p>
          <h2>QA PRO / OMNICORE</h2>
          <p>Explore the QA PRO ecosystem. This link opens an external website; it does not send your XML or connect to a QA PRO API.</p>
        </div>
        <a className="qa-pro-link" href="https://omnicore.cz/" target="_blank" rel="noopener noreferrer">OPEN OMNICORE.CZ <span aria-hidden="true">↗</span></a>
      </section>
      <footer className="site-footer">
        <span>xmlvalidatoronline.com</span>
        <span>Built for private, browser-side XML checks · QA PRO is an external link.</span>
      </footer>
          </main>
        </div>
        <div className="os-statusbar"><strong><span aria-hidden="true">◈</span> READY.</strong><span className="status-frequency" aria-hidden="true">▂▃▅▃▆▂▃▅▂▇▅▃▂</span><span>64K RETRO · MODERN WEB</span></div>
      </div>
    </div>
  )
}

export default App
