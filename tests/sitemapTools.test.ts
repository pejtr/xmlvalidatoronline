import test from 'node:test'
import assert from 'node:assert/strict'
import { createSitemap, MAX_SITEMAP_URLS } from '../src/sitemapTools.ts'

test('generates a standards-oriented sitemap with escaped URLs and no invented lastmod', () => {
  const result = createSitemap('https://example.com/?a=1&b=2\nhttps://example.com/about')
  assert.equal(result.urls.length, 2)
  assert.match(result.xml, /<urlset xmlns="http:\/\/www.sitemaps.org\/schemas\/sitemap\/0.9">/)
  assert.match(result.xml, /<loc>https:\/\/example.com\/\?a=1&amp;b=2<\/loc>/)
  assert.doesNotMatch(result.xml, /<lastmod>/)
})

test('resolves relative paths from explicit base URL and removes duplicates/fragments', () => {
  const result = createSitemap('/about\nhttps://example.com/about#section\n/contact', 'https://example.com/')
  assert.deepEqual(result.urls, ['https://example.com/about', 'https://example.com/contact'])
  assert.equal(result.duplicates, 1)
})

test('does not mix origins into one sitemap', () => {
  const result = createSitemap('https://example.com/\nhttps://other.example.org/')
  assert.equal(result.urls.length, 1)
  assert.equal(result.skipped, 1)
  assert.match(result.issues[0]?.message ?? '', /different website/)
})

test('rejects bad base URL, invented dates, and invalid schemes', () => {
  assert.equal(createSitemap('/about', 'ftp://example.com').urls.length, 0)
  assert.match(createSitemap('/about', 'ftp://example.com').issues[0]?.message ?? '', /Base URL/)
  assert.equal(createSitemap('https://example.com/', '', '2026-02-30').xml, '')
  assert.equal(createSitemap('javascript:alert(1)').urls.length, 0)
})

test('includes only an explicitly supplied valid lastmod date', () => {
  const result = createSitemap('https://example.com/', '', '2026-11-10')
  assert.match(result.xml, /<lastmod>2026-11-10<\/lastmod>/)
})

test('rejects credential-bearing URLs', () => {
  const result = createSitemap('https://username:password@example.com/')
  assert.equal(result.urls.length, 0)
  assert.equal(result.skipped, 1)
})

test('caps generation to the declared free browser limit', () => {
  const input = Array.from({ length: MAX_SITEMAP_URLS + 5 }, (_, i) => 'https://example.com/' + i).join('\n')
  const result = createSitemap(input)
  assert.equal(result.urls.length, MAX_SITEMAP_URLS)
  assert.ok(result.issues.some((issue) => issue.message.includes('1,000')))
})

test('rejects overlong input before processing', () => {
  const result = createSitemap('a'.repeat(2_000_001))
  assert.equal(result.urls.length, 0)
  assert.match(result.issues[0]?.message ?? '', /2 MB/)
})
