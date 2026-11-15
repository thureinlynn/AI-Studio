export function isBrowserOffline(nav?: { onLine?: boolean } | null): boolean {
  if (!nav || typeof nav.onLine !== 'boolean') return false;
  return nav.onLine === false;
}

export function isTransientFirestoreError(error: unknown): boolean {
  if (!error || typeof error !== 'object') return false;
  const err = error as { code?: unknown; message?: unknown };
  const code = typeof err.code === 'string' ? err.code.toLowerCase() : '';
  const message = typeof err.message === 'string' ? err.message.toLowerCase() : '';

  return (
    code === 'unavailable' ||
    code === 'aborted' ||
    code === 'deadline-exceeded' ||
    message.includes('client is offline') ||
    message.includes('could not reach cloud firestore backend') ||
    message.includes('network error')
  );
}
