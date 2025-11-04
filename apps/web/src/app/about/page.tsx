import { connection } from 'next/server';

export default async function AboutPage() {
  await connection();

  return <div>Page coming soon</div>;
}
