import { join } from 'path'
import { nextTestSetup } from 'e2e-utils'
import cheerio from 'cheerio'

function getLinkHeaderUrls(linkHeader: string | null): string[] {
  return [...(linkHeader ?? '').matchAll(/<([^>]+)>/g)].map(([, url]) => url)
}

async function fetchWithHtmlUrls(
  next: ReturnType<typeof nextTestSetup>['next'],
  pathname: string
) {
  const res = await next.fetch(pathname)
  const $ = cheerio.load(await res.text())
  const htmlUrls = new Set([
    ...$('script[src]')
      .toArray()
      .map((el) => $(el).attr('src')),
    ...$('link[href]')
      .toArray()
      .map((el) => $(el).attr('href')),
  ])
  return { res, linkHeader: res.headers.get('link'), htmlUrls }
}

describe('pages-preload-link-header', () => {
  const { next, isNextDev } = nextTestSetup({
    files: join(__dirname, 'default'),
  })

  it('preloads the scripts and styles the document renders', async () => {
    const { linkHeader, htmlUrls } = await fetchWithHtmlUrls(next, '/')
    const linkUrls = getLinkHeaderUrls(linkHeader)

    expect(linkUrls.some((url) => url.endsWith('.css'))).toBe(true)
    expect(linkUrls.some((url) => url.endsWith('.js'))).toBe(true)
    for (const url of linkUrls) {
      expect(htmlUrls).toContain(url)
    }
    expect(linkHeader).toMatch(/^<[^>]+>; rel=preload; as="(script|style)"/)
  })

  it('does not preload scripts on a page without runtime JS', async () => {
    const { linkHeader, htmlUrls } = await fetchWithHtmlUrls(next, '/no-js')
    const linkUrls = getLinkHeaderUrls(linkHeader)

    expect(linkUrls.some((url) => url.endsWith('.css'))).toBe(true)
    // `unstable_runtimeJS` only applies in production
    if (!isNextDev) {
      expect(linkUrls.some((url) => url.endsWith('.js'))).toBe(false)
    }
    for (const url of linkUrls) {
      expect(htmlUrls).toContain(url)
    }
  })

  it('does not add the Link header to statically generated pages', async () => {
    const res = await next.fetch('/isr')
    expect(res.status).toBe(200)
    expect(res.headers.get('link')).toBeNull()
  })

  it('does not add the Link header to data requests', async () => {
    const res = await next.fetch(`/_next/data/${next.buildId}/index.json`)
    expect(res.status).toBe(200)
    expect(res.headers.get('link')).toBeNull()
  })

  it('keeps a Link header set in next.config.js', async () => {
    const res = await next.fetch('/with-link')
    const linkHeader = res.headers.get('link')
    expect(linkHeader).toStartWith('</font.woff2>; rel=preload; as="font", <')
    expect(getLinkHeaderUrls(linkHeader).length).toBeGreaterThan(1)
  })
})

describe('pages-preload-link-header with a custom document', () => {
  const { next } = nextTestSetup({
    files: join(__dirname, 'custom-document'),
  })

  it('follows what the custom document renders', async () => {
    const { linkHeader, htmlUrls } = await fetchWithHtmlUrls(next, '/')
    const links = (linkHeader ?? '').split(', ')

    expect(links.length).toBeGreaterThan(0)
    expect(
      getLinkHeaderUrls(linkHeader).some((url) => url.endsWith('.css'))
    ).toBe(false)
    for (const link of links) {
      expect(link).toEndWith('; crossorigin=""')
    }
    for (const url of getLinkHeaderUrls(linkHeader)) {
      expect(htmlUrls).toContain(url)
    }
  })
})

describe('pages-preload-link-header with reactMaxHeadersLength: 0', () => {
  const { next } = nextTestSetup({
    files: join(__dirname, 'default'),
    skipStart: true,
  })

  beforeAll(async () => {
    await next.patchFile(
      'next.config.js',
      'module.exports = { reactMaxHeadersLength: 0 }'
    )
    await next.start()
  })

  it('does not add the Link header', async () => {
    const res = await next.fetch('/')
    expect(res.headers.get('link')).toBeNull()
  })
})
