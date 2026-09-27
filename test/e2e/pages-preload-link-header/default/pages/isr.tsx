export async function getStaticProps() {
  return { props: { now: Date.now() }, revalidate: 60 }
}

export default function Page({ now }: { now: number }) {
  return <p>isr {now}</p>
}
