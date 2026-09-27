/** @type {import('next').NextConfig} */
module.exports = {
  async headers() {
    return [
      {
        source: '/with-link',
        headers: [
          { key: 'Link', value: '</font.woff2>; rel=preload; as="font"' },
        ],
      },
    ]
  },
}
