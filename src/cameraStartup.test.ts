import { afterEach, describe, expect, it, vi } from 'vitest'
import { CameraStartTimeoutError, cameraStateForError, withCameraTimeout } from './cameraStartup'

afterEach(() => {
  vi.useRealTimers()
})

describe('camera startup', () => {
  it('stops waiting when camera startup never responds', async () => {
    vi.useFakeTimers()
    const timed = withCameraTimeout(new Promise<MediaStream>(() => undefined), 100)
    const rejection = expect(timed).rejects.toBeInstanceOf(CameraStartTimeoutError)

    await vi.advanceTimersByTimeAsync(100)
    await rejection
  })

  it('classifies camera permission failures', () => {
    expect(cameraStateForError(new DOMException('denied', 'NotAllowedError'))).toBe('denied')
    expect(cameraStateForError(new DOMException('blocked', 'SecurityError'))).toBe('denied')
  })

  it('keeps other camera failures separate from permission failures', () => {
    expect(cameraStateForError(new DOMException('busy', 'NotReadableError'))).toBe('unavailable')
    expect(cameraStateForError(new CameraStartTimeoutError())).toBe('timeout')
  })
})
