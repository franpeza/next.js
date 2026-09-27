export async function getServerSideProps() {
  return { props: { message: 'hello world' } }
}

export default function Page({ message }: { message: string }) {
  return <p>{message}</p>
}
