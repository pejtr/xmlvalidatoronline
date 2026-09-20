import { useMemo, useState } from 'react'
import './App.css'

const SAMPLE_XML = `<?xml version="1.0" encoding="UTF-8"?>
<catalog>
  <book id="1">
    <title>XML Validator Online</title>
    <author>ONYX QA</author>
  </book>
</catalog>`

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

  const validation = useMemo<ValidationResult>(() => {
    if (!xml.trim()) return { valid: false, message: 'Paste XML to start.' }
    const { error } = parseXml(xml)
    return error
      ? { valid: false, message: error }
      : { valid: true, message: 'XML is well-formed.' }
  }, [xml])

  const runTransform = (type: 'format' | 'minify') => {
    try {
      setXml(type === 'format' ? formatXml(xml) : minifyXml(xml))
    } catch {
      // Keep the original XML; the live validation status already exposes the parse error.
    }
  }

  const copyXml = async () => {
    await navigator.clipboard.writeText(xml)
  }

  return (
    <main className="shell">
      <header className="topbar">
        <div className="brand">XML Validator Online</div>
        <div className="privacy">Runs locally in your browser</div>
      </header>

      <section className="hero">
        <p className="eyebrow">Developer utility</p>
        <h1>Validate, format and minify XML online.</h1>
        <p className="lead">
          Fast, deterministic XML syntax checking with no upload required.
        </p>
      </section>

      <section className="tool">
        <div className="toolbar">
          <span className="live-badge">Live validation</span>
          <button onClick={() => runTransform('format')}>Format</button>
          <button onClick={() => runTransform('minify')}>Minify</button>
          <button onClick={() => setXml(SAMPLE_XML)}>Sample</button>
          <button onClick={copyXml}>Copy</button>
          <button onClick={() => setXml('')}>Clear</button>
        </div>

        <textarea
          value={xml}
          onChange={(event) => setXml(event.target.value)}
          spellCheck={false}
          aria-label="XML input"
          placeholder="Paste XML here..."
        />

        <div className={`status ${validation.valid ? 'valid' : 'invalid'}`}>
          <strong>{validation.valid ? '✓ Valid XML' : '✕ XML needs attention'}</strong>
          <span>{validation.message}</span>
        </div>
      </section>

      <section className="features">
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

      <footer>
        <span>xmlvalidatoronline.com</span>
        <span>QA PRO integration will follow when QA PRO is release-ready.</span>
      </footer>
    </main>
  )
}

export default App
