import { useMemo, useState } from 'react';
import './App.css';
import { lintHeurekaFeed, SAMPLE_HEUREKA_XML, type HeurekaLintResult } from './lib/heurekaLinter';

const SAMPLE_XML = `<?xml version="1.0" encoding="UTF-8"?>
<catalog xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
  <!-- Modern XML Validator Sample -->
  <product id="PROD-001">
    <name>Omni Premium Monitor 4K</name>
    <category>Display Systems</category>
    <pricing currency="EUR">
      <regular>499.00</regular>
      <vatRate>21</vatRate>
    </pricing>
    <stock status="available" quantity="42" />
  </product>
  <product id="PROD-002">
    <name>Precision Mechanical Switchboard</name>
    <category>Peripherals</category>
    <pricing currency="EUR">
      <regular>149.50</regular>
      <vatRate>21</vatRate>
    </pricing>
    <stock status="low" quantity="4" />
  </product>
</catalog>`;

interface ParsedXmlInfo {
  doc: XMLDocument | null;
  error: string | null;
  rootTag: string;
  totalElements: number;
  totalAttributes: number;
  maxDepth: number;
}

function parseXmlSafe(xml: string): ParsedXmlInfo {
  if (!xml.trim()) {
    return {
      doc: null,
      error: 'Zadejte nebo vložte XML ke kontrole.',
      rootTag: '—',
      totalElements: 0,
      totalAttributes: 0,
      maxDepth: 0,
    };
  }

  try {
    const doc = new DOMParser().parseFromString(xml, 'application/xml');
    const parserError = doc.querySelector('parsererror');

    if (parserError) {
      return {
        doc,
        error: parserError.textContent?.trim() || 'Syntaktická chyba XML.',
        rootTag: 'Chyba',
        totalElements: 0,
        totalAttributes: 0,
        maxDepth: 0,
      };
    }

    // Compute basic tree metrics
    const elements = doc.getElementsByTagName('*');
    const totalElements = elements.length;
    let totalAttributes = 0;
    let maxDepth = 0;

    for (let i = 0; i < elements.length; i++) {
      totalAttributes += elements[i].attributes.length;
      let depth = 0;
      let curr: Element | null = elements[i];
      while (curr && curr.parentElement) {
        depth++;
        curr = curr.parentElement;
      }
      if (depth > maxDepth) maxDepth = depth;
    }

    return {
      doc,
      error: null,
      rootTag: doc.documentElement.tagName,
      totalElements,
      totalAttributes,
      maxDepth: maxDepth + 1,
    };
  } catch (err) {
    return {
      doc: null,
      error: err instanceof Error ? err.message : String(err),
      rootTag: 'Chyba',
      totalElements: 0,
      totalAttributes: 0,
      maxDepth: 0,
    };
  }
}

function formatXml(xml: string): string {
  const info = parseXmlSafe(xml);
  if (info.error) throw new Error(info.error);

  const compact = xml
    .replace(/>\s+</g, '><')
    .replace(/(<\/?[^>]+>)/g, '\n$1\n')
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean);

  let indent = 0;
  return compact
    .map((line) => {
      const isClosing = /^<\//.test(line);
      const isSelfClosing = /\/>$/.test(line) || /^<\?/.test(line) || /^<!/.test(line);
      const isOpening = /^<[^/!?][^>]*>$/.test(line) && !line.includes('</');

      if (isClosing) indent = Math.max(0, indent - 1);
      const formatted = `${'  '.repeat(indent)}${line}`;
      if (isOpening && !isSelfClosing) indent += 1;
      return formatted;
    })
    .join('\n');
}

function minifyXml(xml: string): string {
  const info = parseXmlSafe(xml);
  if (info.error) throw new Error(info.error);
  return xml.replace(/>\s+</g, '><').trim();
}

function App() {
  const [xml, setXml] = useState(SAMPLE_XML);
  const [activeTab, setActiveTab] = useState<'metrics' | 'heureka' | 'parser'>('metrics');
  const [copied, setCopied] = useState(false);
  const [transformNotice, setTransformNotice] = useState<string | null>(null);

  const parsedInfo = useMemo(() => parseXmlSafe(xml), [xml]);

  const heurekaLint = useMemo<HeurekaLintResult>(() => {
    if (!parsedInfo.doc || parsedInfo.error) {
      return {
        isHeurekaFeed: false,
        totalItems: 0,
        validItems: 0,
        itemsWithWarnings: 0,
        itemsWithErrors: 0,
        issues: [],
        itemDetails: [],
        summary: 'Pro lintování Heureka feedu musí být XML syntakticky validní.',
      };
    }
    return lintHeurekaFeed(parsedInfo.doc);
  }, [parsedInfo]);

  // If a Heureka feed is pasted or loaded, auto-switch to Heureka tab
  const handleLoadSample = (sample: 'standard' | 'heureka') => {
    if (sample === 'heureka') {
      setXml(SAMPLE_HEUREKA_XML);
      setActiveTab('heureka');
    } else {
      setXml(SAMPLE_XML);
      setActiveTab('metrics');
    }
    setTransformNotice(null);
  };

  const runTransform = (type: 'format' | 'minify') => {
    try {
      const transformed = type === 'format' ? formatXml(xml) : minifyXml(xml);
      setXml(transformed);
      setTransformNotice(type === 'format' ? 'XML bylo naformátováno s odsazením.' : 'XML bylo minifikováno.');
      setTimeout(() => setTransformNotice(null), 3000);
    } catch (e) {
      setTransformNotice(e instanceof Error ? `Chyba při formátování: ${e.message}` : 'Nelze formátovat nevalidní XML.');
    }
  };

  const copyXml = async () => {
    try {
      await navigator.clipboard.writeText(xml);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
    }
  };

  const lineCount = useMemo(() => (xml ? xml.split('\n').length : 0), [xml]);
  const byteCount = useMemo(() => new Blob([xml]).size, [xml]);

  return (
    <div className="shell">
      {/* Top Header */}
      <header className="topbar">
        <div className="brand-group">
          <div className="brand-icon" aria-hidden="true">&lt;/&gt;</div>
          <div className="brand-title">
            <span>XML Validator Online</span>
            <span className="brand-tag">Emerald SaaS</span>
          </div>
        </div>
        <div className="topbar-meta">
          <div className="security-badge" title="Zpracování probíhá 100% v prohlížeči, žádná data se neodesílají na server">
            <span className="security-dot" aria-hidden="true"></span>
            <span>Cloudflare Edge · 100% Client-Side Privacy</span>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="hero">
        <div className="eyebrow-badge">
          <span>✦ Emerald SaaS Developer Suite</span>
        </div>
        <h1>
          Validate, format &amp; lint <span className="gradient-text">XML online</span>.
        </h1>
        <p className="lead">
          Rychlá, deterministická validace XML syntaxe, automatické formátování, minifikace a specializovaný linter pro Heureka produktové feedy přímo ve vašem prohlížeči.
        </p>
      </section>

      {/* Workspace Grid (Desktop side-by-side) */}
      <main className="workspace-grid">
        {/* Left Column: Editor & Action Controls */}
        <section className="editor-panel" aria-label="XML Editor">
          <div className="editor-header">
            <div className="toolbar-group">
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => runTransform('format')}
                title="Přeformátovat XML s čitelným 2-mezerovým odsazením"
              >
                <span>Format</span>
              </button>
              <button
                type="button"
                className="btn"
                onClick={() => runTransform('minify')}
                title="Odstranit zbytečné bílé znaky a zmenšit velikost"
              >
                <span>Minify</span>
              </button>
              <button
                type="button"
                className="btn btn-emerald-soft"
                onClick={() => handleLoadSample('heureka')}
                title="Načíst ukázkový Heureka XML feed pro otestování linteru"
              >
                <span>Sample Heureka</span>
              </button>
              <button
                type="button"
                className="btn"
                onClick={() => handleLoadSample('standard')}
                title="Načíst standardní ukázkový XML dokument"
              >
                <span>Sample XML</span>
              </button>
            </div>

            <div className="toolbar-group">
              <button
                type="button"
                className="btn"
                onClick={copyXml}
                aria-label="Kopírovat XML do schránky"
              >
                <span>{copied ? '✓ Zkopírováno' : 'Kopírovat'}</span>
              </button>
              <button
                type="button"
                className="btn btn-ghost"
                onClick={() => setXml('')}
                aria-label="Vymazat editor"
              >
                <span>Vymazat</span>
              </button>
            </div>
          </div>

          <div className="editor-container">
            <textarea
              className="xml-editor"
              value={xml}
              onChange={(e) => setXml(e.target.value)}
              spellCheck={false}
              aria-label="Editor zdrojového XML kódu"
              placeholder="Vložte nebo napište XML kód zde..."
            />
          </div>

          <div className="editor-footer">
            <span>{lineCount} řádků · {xml.length.toLocaleString()} znaků · {(byteCount / 1024).toFixed(2)} KB</span>
            {transformNotice && <span style={{ color: '#047857', fontWeight: 600 }}>{transformNotice}</span>}
          </div>
        </section>

        {/* Right Column: Live Diagnostics & Heureka Lint Results */}
        <section className="results-panel" aria-label="Výsledky validace a diagnostika">
          {/* Live Status Card */}
          <div className={`status-card ${parsedInfo.error ? 'invalid' : 'valid'}`}>
            <div className="status-header">
              <div className="status-headline">
                <span className="status-icon" aria-hidden="true">
                  {parsedInfo.error ? '✕' : '✓'}
                </span>
                <span>{parsedInfo.error ? 'XML vyžaduje pozornost' : 'Validní XML dokument'}</span>
              </div>
              <span style={{ fontSize: '12px', fontWeight: 600 }}>
                {parsedInfo.error ? 'Chyba syntaxe' : 'Well-Formed'}
              </span>
            </div>
            <p className="status-message">
              {parsedInfo.error || 'Dokument je syntakticky v pořádku a splňuje W3C XML standard.'}
            </p>
          </div>

          {/* Diagnostics Card with Tabs */}
          <div className="diag-card">
            <div className="diag-tabs" role="tablist">
              <button
                type="button"
                role="tab"
                aria-selected={activeTab === 'metrics'}
                className={`tab-btn ${activeTab === 'metrics' ? 'active' : ''}`}
                onClick={() => setActiveTab('metrics')}
              >
                Struktura a metriky
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={activeTab === 'heureka'}
                className={`tab-btn ${activeTab === 'heureka' ? 'active' : ''}`}
                onClick={() => setActiveTab('heureka')}
              >
                Heureka Feed Lint {heurekaLint.isHeurekaFeed && `(${heurekaLint.totalItems})`}
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={activeTab === 'parser'}
                className={`tab-btn ${activeTab === 'parser' ? 'active' : ''}`}
                onClick={() => setActiveTab('parser')}
              >
                Parser detail
              </button>
            </div>

            <div className="tab-content">
              {activeTab === 'metrics' && (
                <div className="metrics-grid">
                  <div className="metric-box">
                    <div className="metric-label">Kořenový element</div>
                    <div className="metric-value" style={{ fontSize: '17px' }}>
                      &lt;{parsedInfo.rootTag}&gt;
                    </div>
                  </div>
                  <div className="metric-box">
                    <div className="metric-label">Počet elementů</div>
                    <div className="metric-value">{parsedInfo.totalElements}</div>
                  </div>
                  <div className="metric-box">
                    <div className="metric-label">Počet atributů</div>
                    <div className="metric-value">{parsedInfo.totalAttributes}</div>
                  </div>
                  <div className="metric-box">
                    <div className="metric-label">Maximální hloubka</div>
                    <div className="metric-value">{parsedInfo.maxDepth}</div>
                  </div>
                </div>
              )}

              {activeTab === 'heureka' && (
                <div className="heureka-box">
                  {heurekaLint.isHeurekaFeed ? (
                    <>
                      <div className="heureka-badge-bar">
                        <span style={{ fontWeight: 700, color: '#0f172a' }}>Heureka E-commerce Feed</span>
                        <div className="heureka-stats">
                          <span className="stat-pill success">
                            ✓ {heurekaLint.validItems} validních
                          </span>
                          {heurekaLint.itemsWithWarnings > 0 && (
                            <span className="stat-pill warning">
                              ⚠ {heurekaLint.itemsWithWarnings} varování
                            </span>
                          )}
                          {heurekaLint.itemsWithErrors > 0 && (
                            <span className="stat-pill danger">
                              ✕ {heurekaLint.itemsWithErrors} chyb
                            </span>
                          )}
                        </div>
                      </div>

                      <p style={{ margin: 0, fontSize: '13px', color: '#475569' }}>
                        {heurekaLint.summary}
                      </p>

                      {heurekaLint.issues.length > 0 && (
                        <div className="issues-list" aria-label="Nalezené nesrovnalosti ve feedu">
                          {heurekaLint.issues.map((iss, idx) => (
                            <div key={idx} className={`issue-item ${iss.type}`}>
                              <span>{iss.type === 'error' ? '✕' : iss.type === 'warning' ? '⚠' : 'ℹ'}</span>
                              <span>{iss.message}</span>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Quick Item Previews */}
                      {heurekaLint.itemDetails.length > 0 && (
                        <div style={{ marginTop: '8px', borderTop: '1px solid #e2e8f0', paddingTop: '12px' }}>
                          <span style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', color: '#64748b' }}>
                            Přehled položek feedu ({heurekaLint.itemDetails.length}):
                          </span>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginTop: '6px' }}>
                            {heurekaLint.itemDetails.slice(0, 5).map((it) => (
                              <div
                                key={it.id}
                                style={{
                                  display: 'flex',
                                  justifyContent: 'space-between',
                                  fontSize: '12.5px',
                                  padding: '6px 8px',
                                  background: '#f8fafc',
                                  borderRadius: '6px',
                                }}
                              >
                                <span style={{ fontWeight: 600, color: '#0f172a' }}>
                                  {it.id} — {it.name.slice(0, 32)}
                                  {it.name.length > 32 ? '...' : ''}
                                </span>
                                <span style={{ color: '#059669', fontWeight: 700 }}>{it.price}</span>
                              </div>
                            ))}
                            {heurekaLint.itemDetails.length > 5 && (
                              <span style={{ fontSize: '11px', color: '#64748b', textAlign: 'center' }}>
                                + dalších {heurekaLint.itemDetails.length - 5} položek
                              </span>
                            )}
                          </div>
                        </div>
                      )}
                    </>
                  ) : (
                    <div style={{ textAlign: 'center', padding: '16px 8px', color: '#475569' }}>
                      <p style={{ fontWeight: 600, marginBottom: '6px' }}>Tento dokument není Heureka produktový feed.</p>
                      <p style={{ fontSize: '13px', margin: '0 0 14px' }}>
                        Heureka feed vyžaduje kořenový tag &lt;SHOP&gt; a položky &lt;SHOPITEM&gt;. Klikněte na tlačítko níže pro načtení vzorového feedu.
                      </p>
                      <button
                        type="button"
                        className="btn btn-emerald-soft"
                        onClick={() => handleLoadSample('heureka')}
                      >
                        Načíst ukázkový Heureka feed
                      </button>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'parser' && (
                <div style={{ fontSize: '13px', color: '#334155', lineHeight: 1.6 }}>
                  <p style={{ margin: '0 0 8px', fontWeight: 600 }}>W3C DOMParser Engine</p>
                  <p style={{ margin: '0 0 8px', color: '#64748b' }}>
                    Validace probíhá plně na klientovi přes nativní rozhraní prohlížeče bez odesílání dat na externí servery.
                  </p>
                  <ul style={{ margin: 0, paddingLeft: '20px', color: '#475569' }}>
                    <li>MIME Type: <code>application/xml</code></li>
                    <li>Status kódu: {parsedInfo.error ? 'SyntaxError' : '200 OK (Well-Formed)'}</li>
                    <li>Velikost v paměti: {byteCount} bytů</li>
                  </ul>
                </div>
              )}
            </div>
          </div>
        </section>
      </main>

      {/* Features Grid */}
      <section className="features-section" aria-label="Funkce a vlastnosti">
        <article className="feature-card">
          <div className="feature-icon-box" aria-hidden="true">⚡</div>
          <h2>Blesková lokální validace</h2>
          <p>
            Žádné zbytečné síťové požadavky. Kontrola syntaxe a stromová analýza probíhá přímo v enginu vašeho prohlížeče v reálném čase.
          </p>
        </article>

        <article className="feature-card">
          <div className="feature-icon-box" aria-hidden="true">🛒</div>
          <h2>Heureka &amp; E-commerce Lint</h2>
          <p>
            Okamžitá kontrola e-shopových feedů podle oficiální specifikace Heureka. Ověřuje ITEM_ID, ceny, skladovost a povinné tagy.
          </p>
        </article>

        <article className="feature-card">
          <div className="feature-icon-box" aria-hidden="true">🔒</div>
          <h2>100% soukromí dat</h2>
          <p>
            Vámi vložená data neopouštějí váš počítač. Žádné ukládání do mezipaměti třetích stran, hostováno na Cloudflare Pages.
          </p>
        </article>
      </section>

      {/* Footer */}
      <footer className="saas-footer">
        <div>
          <strong>XML Validator Online</strong> · Powered by Cloudflare Edge
        </div>
        <div className="footer-links">
          <a href="https://github.com/pejtr/xmlvalidatoronline" target="_blank" rel="noopener noreferrer">
            GitHub
          </a>
          <span>·</span>
          <span>WCAG 2.1 AA Compliant</span>
          <span>·</span>
          <span>OMNI Design System</span>
        </div>
      </footer>
    </div>
  );
}

export default App;
