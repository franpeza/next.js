export const config = { unstable_runtimeJS: false }

export async function getServerSideProps() {
  return { props: {} }
}

export default function Page() {
  return <p>no js</p>
}
