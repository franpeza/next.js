import { nextTestSetup } from 'e2e-utils'

// `fetch` adds `Cache-Control: no-cache` to conditional requests unless the
// header is set, which prevents a 304 response.
const conditionalHeaders = (etag: string) => ({
  'if-none-match': etag,
  'cache-control': 'max-age=0',
})

describe('api-routes-generate-etags', () => {
  const { next } = nextTestSetup({
    files: __dirname,
  })

  it.each(['/api/json', '/api/text'])(
    'generates an etag for %s by default',
    async (pathname) => {
      const res = await next.fetch(pathname)
      const etag = res.headers.get('etag')
      expect(etag).toBeTruthy()

      const cached = await next.fetch(pathname, {
        headers: conditionalHeaders(etag!),
      })
      expect(cached.status).toBe(304)
    }
  )
})

describe('api-routes-generate-etags with generateEtags: false', () => {
  const { next } = nextTestSetup({
    files: __dirname,
    nextConfig: {
      generateEtags: false,
    },
  })

  it.each(['/api/json', '/api/text'])(
    'does not generate an etag for %s',
    async (pathname) => {
      const res = await next.fetch(pathname)
      expect(res.status).toBe(200)
      expect(res.headers.get('etag')).toBeNull()

      const revalidated = await next.fetch(pathname, {
        headers: conditionalHeaders('"anything"'),
      })
      expect(revalidated.status).toBe(200)
    }
  )
})
