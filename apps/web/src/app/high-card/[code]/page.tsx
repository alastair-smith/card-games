'use server';

export default async function HighCardPage({ params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;

  return (<div> High Card {code}</div>)
}
