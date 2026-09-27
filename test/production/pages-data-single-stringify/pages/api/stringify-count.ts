import type { NextApiRequest, NextApiResponse } from 'next'

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const count = globalThis.stringifyCount ?? 0
  if (req.query.reset) {
    globalThis.stringifyCount = 0
  }
  res.json({ count })
}
