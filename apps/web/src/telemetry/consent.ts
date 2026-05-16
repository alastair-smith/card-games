const TELEMETRY_CONSENT_KEY = 'telemetry-opt-in';

export function getTelemetryConsent(): boolean {
  if (typeof window === 'undefined') return false;
  return localStorage.getItem(TELEMETRY_CONSENT_KEY) === 'true';
}

export function setTelemetryConsent(isEnabled: boolean): void {
  if (isEnabled) {
    localStorage.setItem(TELEMETRY_CONSENT_KEY, 'true');
  } else {
    localStorage.removeItem(TELEMETRY_CONSENT_KEY);
  }
}
