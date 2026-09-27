import type { GetServerSideProps } from 'next'

export const getServerSideProps: GetServerSideProps = async ({ params }) => {
  return { props: { slug: params?.slug } }
}

export default function Post({ slug }: { slug: string }) {
  return <p id="post">post {slug}</p>
}
