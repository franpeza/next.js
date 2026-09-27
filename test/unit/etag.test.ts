import crypto from 'crypto'
import { generateETag } from 'next/dist/server/lib/etag'

describe('generateETag', () => {
  it('returns a strong ETag with the SHA-1 of the payload', () => {
    const payload = '<html><body>hello</body></html>'
    expect(generateETag(payload)).toBe(
      `"${crypto.createHash('sha1').update(payload).digest('base64url')}"`
    )
  })

  it('returns a weak ETag when requested', () => {
    expect(generateETag('hello', true)).toMatch(/^W\/"[A-Za-z0-9_-]+"$/)
  })

  it('is stable for the same payload and differs for different payloads', () => {
    expect(generateETag('hello')).toBe(generateETag('hello'))
    expect(generateETag('hello')).not.toBe(generateETag('hellO'))
    expect(generateETag('café')).not.toBe(generateETag('cafe'))
  })

  it('produces the same ETag when crypto.hash is unavailable', () => {
    const payload = '<p>café €</p>'
    const expected = generateETag(payload)
    const originalHash = crypto.hash
    // @ts-expect-error -- simulate Node.js versions before 20.12
    delete crypto.hash
    try {
      jest.isolateModules(() => {
        const { generateETag: generateETagWithoutHash } =
          require('next/dist/server/lib/etag') as typeof import('next/dist/server/lib/etag')
        expect(generateETagWithoutHash(payload)).toBe(expected)
      })
    } finally {
      crypto.hash = originalHash
    }
  })
})
