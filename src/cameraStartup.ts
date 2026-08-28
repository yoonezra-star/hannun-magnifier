export type CameraState = 'starting' | 'ready' | 'denied' | 'timeout' | 'unavailable'

export const CAMERA_START_TIMEOUT_MS = 30_000

export class CameraStartTimeoutError extends Error {
  constructor() {
    super('Camera startup timed out')
    this.name = 'CameraStartTimeoutError'
  }
}

export function withCameraTimeout<T>(promise: Promise<T>, timeoutMs = CAMERA_START_TIMEOUT_MS): Promise<T> {
  return new Promise((resolve, reject) => {
    const timer = window.setTimeout(() => reject(new CameraStartTimeoutError()), timeoutMs)
    promise.then(
      (value) => {
        window.clearTimeout(timer)
        resolve(value)
      },
      (error: unknown) => {
        window.clearTimeout(timer)
        reject(error)
      },
    )
  })
}

export function cameraStateForError(error: unknown): Exclude<CameraState, 'starting' | 'ready'> {
  if (error instanceof CameraStartTimeoutError) return 'timeout'

  const name = typeof error === 'object' && error !== null && 'name' in error
    ? String(error.name)
    : ''
  if (['NotAllowedError', 'PermissionDeniedError', 'SecurityError'].includes(name)) return 'denied'
  return 'unavailable'
}
