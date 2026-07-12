export type SubmitFailure = 'AUTH_EXPIRED' | 'TIMEOUT' | 'UNAVAILABLE' | 'REJECTED'

export class TransactionError extends Error {
  constructor(public readonly code: SubmitFailure) {
    super(code)
  }
}

export type SubmissionResult = { id: string; requestNumber: string }
export type RpcSubmit<T> = (input: T & { idempotencyKey: string }) => Promise<SubmissionResult>

export function createIdempotentSubmitter<T>(
  rpc: RpcSubmit<T>,
  keyFactory = () => crypto.randomUUID()
) {
  let pending: Promise<SubmissionResult> | null = null
  let key: string | null = null

  return {
    submit(input: T) {
      if (pending) return pending
      key ??= keyFactory()
      pending = rpc({ ...input, idempotencyKey: key }).finally(() => {
        pending = null
      })
      return pending
    },
    complete() {
      key = null
      pending = null
    },
    abandonAfterEdit() {
      key = null
      pending = null
    },
    currentKey() {
      return key
    },
  }
}

export async function withTimeout<T>(operation: PromiseLike<T>, ms: number): Promise<T> {
  let timer: ReturnType<typeof setTimeout> | undefined
  try {
    return await Promise.race([
      Promise.resolve(operation),
      new Promise<never>((_, reject) => {
        timer = setTimeout(() => reject(new TransactionError('TIMEOUT')), ms)
      }),
    ])
  } finally {
    if (timer) clearTimeout(timer)
  }
}
