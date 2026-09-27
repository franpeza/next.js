import Document, { Html, Head, Main, NextScript } from 'next/document'

class HeadWithoutCssLinks extends Head {
  getCssLinks() {
    return null
  }
}

export default class MyDocument extends Document {
  render() {
    return (
      <Html>
        <HeadWithoutCssLinks crossOrigin="anonymous" />
        <body>
          <Main />
          <NextScript />
        </body>
      </Html>
    )
  }
}
