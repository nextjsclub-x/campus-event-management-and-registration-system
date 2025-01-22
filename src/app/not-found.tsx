// app/not-found.tsx
import Link from 'next/link';

export const runtime = 'edge';

export default function NotFound() {
  return (
    <div>
      <h2>Not Found</h2>
      <Link href='/'>Return Home</Link>
    </div>
  );
}
