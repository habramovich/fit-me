/** Firebase errors carry a string `code`, e.g. 'permission-denied' or 'auth/popup-blocked'. */
export function errorCode(err: unknown): string | undefined {
  if (typeof err === 'object' && err !== null && 'code' in err) {
    const { code } = err as { code: unknown }
    return typeof code === 'string' ? code : undefined
  }
  return undefined
}
