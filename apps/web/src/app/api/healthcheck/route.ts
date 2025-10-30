export function GET() {
  const body = { status: 'ok' };
  const options = {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  };
  const response = new Response(JSON.stringify(body), options);

  return response;
}
