/**
 * Client-only, deterministic lint for a SUBSET of the published Heureka CZ XML feed specification.
 * This is not an official Heureka tool or certification. Do not upload feed contents to a server.
 * Documentation: https://sluzby.heureka.cz/napoveda/xml-feed/
 */

export type FeedFinding = {
  severity: 'error' | 'warning'
  code: string
  message: string
  itemNumber?: number
}

export type HeurekaFeedReport = {
  valid: boolean
  itemCount: number
  errorCount: number
  warningCount: number
  findings: FeedFinding[]
  truncated: boolean
}

const MAX_INPUT_CHARS = 2_000_000
const MAX_FINDINGS = 100

export function auditHeurekaFeed(xml: string): HeurekaFeedReport {
  const findings: FeedFinding[] = []
  let errorCount = 0
  let warningCount = 0

  const add = (severity: FeedFinding['severity'], code: string, message: string, itemNumber?: number) => {
    if (severity === 'error') errorCount += 1
    else warningCount += 1

    if (findings.length < MAX_FINDINGS) findings.push({ severity, code, message, itemNumber })
  }

  const report = (itemCount: number): HeurekaFeedReport => ({
    valid: errorCount === 0,
    itemCount,
    errorCount,
    warningCount,
    findings,
    truncated: errorCount + warningCount > findings.length,
  })

  if (!xml.trim()) {
    add('error', 'EMPTY_INPUT', 'Vložte XML feed pro kontrolu.')
    return report(0)
  }

  if (xml.length > MAX_INPUT_CHARS) {
    add('error', 'INPUT_TOO_LARGE', 'Tato verze lokálního auditu podporuje nejvýše 2 miliony znaků.')
    return report(0)
  }

  // Reject DTD rather than attempting to interpret entity declarations.
  // This is a local-tool safety limitation, not a claim about the Heureka importer.
  if (/<!DOCTYPE\b/i.test(xml)) {
    add('error', 'DTD_UNSUPPORTED', 'Tento lokální audit z bezpečnostních důvodů nepodporuje DOCTYPE/DTD.')
    return report(0)
  }

  const document = new DOMParser().parseFromString(xml, 'application/xml')
  const parseError = document.querySelector('parsererror')
  if (parseError) {
    add('error', 'MALFORMED_XML', 'Neplatná XML syntaxe: ' + (parseError.textContent?.trim() || 'chyba parseru'))
    return report(0)
  }

  const root = document.documentElement
  if (root.tagName !== 'SHOP') {
    add('error', 'ROOT_NOT_SHOP', 'Kořenovým elementem Heureka feedu musí být SHOP.')
    return report(0)
  }

  const items = Array.from(root.children).filter((child) => child.tagName === 'SHOPITEM')
  if (items.length === 0) add('error', 'NO_SHOPITEM', 'Feed neobsahuje žádný přímý element SHOPITEM.')

  const seenIds = new Set<string>()
  const seenUrls = new Set<string>()

  items.forEach((item, index) => {
    const itemNumber = index + 1
    const field = (name: string): string => {
      const element = Array.from(item.children).find((child) => child.tagName === name)
      return element?.textContent?.trim() ?? ''
    }

    const required = ['ITEM_ID', 'PRODUCTNAME', 'PRICE_VAT', 'URL']
    required.forEach((name) => {
      if (!field(name)) add('error', 'MISSING_' + name, 'Chybí povinné pole ' + name + '.', itemNumber)
    })

    const id = field('ITEM_ID')
    if (id) {
      if (seenIds.has(id)) add('error', 'DUPLICATE_ITEM_ID', 'Duplicitní ITEM_ID: ' + id, itemNumber)
      seenIds.add(id)
    }

    const name = field('PRODUCTNAME')
    if (name.length > 200) {
      add('warning', 'PRODUCTNAME_TOO_LONG', 'PRODUCTNAME přesahuje doporučený limit 200 znaků.', itemNumber)
    }

    const price = field('PRICE_VAT')
    if (price) {
      const normalizedPrice = price.replace(',', '.')
      if (!/^\d+(?:\.\d+)?$/.test(normalizedPrice) || !Number.isFinite(Number(normalizedPrice)) || Number(normalizedPrice) <= 0) {
        add('error', 'INVALID_PRICE_VAT', 'PRICE_VAT musí být kladná číselná cena.', itemNumber)
      }
    }

    const url = field('URL')
    if (url) {
      try {
        const parsed = new URL(url)
        if (!['http:', 'https:'].includes(parsed.protocol) || !parsed.hostname || parsed.username || parsed.password) {
          throw new Error('invalid product URL')
        }
        const normalizedUrl = parsed.href
        if (seenUrls.has(normalizedUrl)) add('error', 'DUPLICATE_URL', 'Duplicitní URL produktu.', itemNumber)
        seenUrls.add(normalizedUrl)
      } catch {
        add('error', 'INVALID_URL', 'URL musí být absolutní HTTP(S) adresa produktu.', itemNumber)
      }
    }

    for (const recommended of ['CATEGORYTEXT', 'IMGURL', 'DELIVERY_DATE']) {
      if (!field(recommended)) {
        add('warning', 'MISSING_' + recommended, 'Doporučené pole ' + recommended + ' není vyplněno.', itemNumber)
      }
    }
  })

  return report(items.length)
}
