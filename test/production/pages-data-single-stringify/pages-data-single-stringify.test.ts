import { nextTestSetup } from 'e2e-utils'

describe('pages-data-single-stringify', () => {
  const { next } = nextTestSetup({
    files: __dirname,
  })

  it('serializes getServerSideProps data once per data request', async () => {
    await next.fetch('/api/stringify-count?reset=1')

    const res = await next.fetch(`/_next/data/${next.buildId}/index.json`)
    expect(res.status).toBe(200)
    expect((await res.json()).pageProps.tracked).toBe('tracked')

    const { count } = await (await next.fetch('/api/stringify-count')).json()
    expect(count).toBe(1)
  })
})
