export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    const { startTelemetry } = await import('./telemetry/server');
    await startTelemetry();
  }
}
