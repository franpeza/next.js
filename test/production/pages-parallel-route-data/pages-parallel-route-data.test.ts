import { runInNewContext } from 'vm'
import { nextTestSetup } from 'e2e-utils'
import { retry } from 'next-test-utils'

describe('pages-parallel-route-data', () => {
  const { next } = nextTestSetup({
    files: __dirname,
  })

  it('lists getServerSideProps pages in the client SSG manifest', async () => {
    const buildId = (await next.readFile('.next/BUILD_ID')).trim()
    const manifest = await next.readFile(
      `.next/static/${buildId}/_ssgManifest.js`
    )
    const self: { __SSP_MANIFEST?: Set<string> } = {}
    runInNewContext(manifest, { self })
    expect([...(self.__SSP_MANIFEST ?? [])]).toEqual(['/posts/[slug]'])
  })

  it('requests the page data without waiting for the page chunk', async () => {
    const events: string[] = []
    let holdChunks = false
    let releaseChunks!: () => void
    const chunksReleased = new Promise<void>((resolve) => {
      releaseChunks = resolve
    })

    const browser = await next.browser('/', {
      beforePageLoad(page) {
        page.route('**/_next/static/**/*.js', async (route) => {
          if (holdChunks) {
            events.push('chunk requested')
            await chunksReleased
          }
          await route.continue()
        })
        page.on('request', (request) => {
          if (request.url().includes('/_next/data/')) {
            events.push('data requested')
          }
        })
      },
    })

    holdChunks = true
    await browser.elementByCss('#go').click()

    await retry(async () => {
      expect(events).toContain('chunk requested')
      expect(events).toContain('data requested')
    })
    events.push('chunks released')
    releaseChunks()

    await retry(async () => {
      expect(await browser.elementByCss('#post').text()).toBe('post hello')
    })
    expect(events.filter((event) => event === 'data requested')).toHaveLength(1)
    expect(events.indexOf('data requested')).toBeLessThan(
      events.indexOf('chunks released')
    )
  })
})
