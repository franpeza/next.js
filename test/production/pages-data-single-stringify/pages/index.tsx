declare global {
  var stringifyCount: number
}

class Tracked {
  toJSON() {
    globalThis.stringifyCount = (globalThis.stringifyCount ?? 0) + 1
    return 'tracked'
  }
}

export async function getServerSideProps() {
  return { props: { tracked: new Tracked() } }
}

export default function Page({ tracked }: { tracked: string }) {
  return <p id="tracked">{tracked}</p>
}
