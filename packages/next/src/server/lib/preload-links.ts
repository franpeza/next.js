export type PreloadResource = {
  href: string
  as: 'script' | 'style'
  crossOrigin: string | undefined
}

/**
 * Builds a `Link` header that preloads the given resources, matching the
 * format and length budget React uses for the App Router (`maxHeadersLength`).
 */
export function getPreloadLinkHeader(
  resources: Iterable<PreloadResource>,
  maxHeadersLength: number
): string | undefined {
  let remainingCapacity = maxHeadersLength + 2
  const links: string[] = []
  for (const { href, as, crossOrigin } of resources) {
    let link = `<${href}>; rel=preload; as="${as}"`
    if (crossOrigin !== undefined) {
      link += `; crossorigin="${crossOrigin === 'use-credentials' ? crossOrigin : ''}"`
    }
    remainingCapacity -= link.length + 2
    if (remainingCapacity < 0) break
    links.push(link)
  }

  return links.length > 0 ? links.join(', ') : undefined
}
