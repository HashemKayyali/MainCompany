export function getErrorMessage(error: unknown, fallback = 'Something went wrong') {
  if (error instanceof Error && error.message.trim()) {
    return error.message.trim()
  }

  if (
    typeof error === 'object' &&
    error !== null &&
    'message' in error &&
    typeof (error as { message?: unknown }).message === 'string'
  ) {
    const message = (error as { message: string }).message.trim()
    if (message) return message
  }

  return fallback
}
