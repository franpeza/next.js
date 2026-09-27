import { useRouter } from 'next/router'

export default function Page() {
  const router = useRouter()
  return (
    <button id="go" onClick={() => router.push('/posts/hello')}>
      go to post
    </button>
  )
}
