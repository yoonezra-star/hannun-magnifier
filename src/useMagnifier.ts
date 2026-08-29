import { useCallback, useEffect, useRef, useState } from 'react'
import { cameraFilter, type ViewMode } from './camera'
import { cameraStateForError, withCameraTimeout, type CameraState } from './cameraStartup'

function stopStream(stream: MediaStream | null) {
  stream?.getTracks().forEach((track) => track.stop())
}

export function useMagnifier() {
  const videoRef = useRef<HTMLVideoElement>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const requestIdRef = useRef(0)
  const facingModeRef = useRef<'environment' | 'user'>('environment')
  const [cameraState, setCameraState] = useState<CameraState>('starting')
  const [torchOn, setTorchOn] = useState(false)
  const [frozenImage, setFrozenImage] = useState<string | null>(null)

  const releaseCamera = useCallback(() => {
    stopStream(streamRef.current)
    streamRef.current = null
    if (videoRef.current) {
      videoRef.current.pause()
      videoRef.current.srcObject = null
    }
  }, [])

  const startCameraFor = useCallback(async (facingMode: 'environment' | 'user') => {
    const requestId = requestIdRef.current + 1
    requestIdRef.current = requestId
    releaseCamera()
    setCameraState('starting')
    setTorchOn(false)
    try {
      if (!navigator.mediaDevices?.getUserMedia) {
        setCameraState('unavailable')
        return
      }
      const pendingStream = navigator.mediaDevices.getUserMedia({
        audio: false,
        video: {
          facingMode: { ideal: facingMode },
          width: { ideal: 1920 },
          height: { ideal: 1080 },
        },
      })
      void pendingStream.then((lateStream) => {
        if (requestId !== requestIdRef.current) stopStream(lateStream)
      }).catch(() => undefined)

      const stream = await withCameraTimeout(pendingStream)
      if (requestId !== requestIdRef.current) {
        stopStream(stream)
        return
      }

      streamRef.current = stream
      const video = videoRef.current
      if (!video) throw new Error('Camera video element is unavailable')
      video.srcObject = stream
      await withCameraTimeout(video.play())
      if (requestId !== requestIdRef.current) return
      setCameraState('ready')
    } catch (error) {
      if (requestId !== requestIdRef.current) return
      requestIdRef.current += 1
      releaseCamera()
      setCameraState(cameraStateForError(error))
    }
  }, [releaseCamera])

  const startCamera = useCallback(
    () => startCameraFor(facingModeRef.current),
    [startCameraFor],
  )

  useEffect(() => {
    void startCameraFor(facingModeRef.current)
    return () => {
      requestIdRef.current += 1
      releaseCamera()
    }
  }, [releaseCamera, startCameraFor])

  const toggleTorch = useCallback(async () => {
    const track = streamRef.current?.getVideoTracks()[0]
    if (!track) return false
    try {
      const next = !torchOn
      await track.applyConstraints({ advanced: [{ torch: next } as MediaTrackConstraintSet] })
      setTorchOn(next)
      return true
    } catch {
      return false
    }
  }, [torchOn])

  const capture = useCallback((mode: ViewMode, brightness: number, zoom: number) => {
    const video = videoRef.current
    if (!video || video.videoWidth === 0) return null
    const canvas = document.createElement('canvas')
    canvas.width = video.videoWidth
    canvas.height = video.videoHeight
    const context = canvas.getContext('2d')
    if (!context) return null

    context.filter = cameraFilter(mode, brightness)
    const sourceWidth = video.videoWidth / zoom
    const sourceHeight = video.videoHeight / zoom
    const sourceX = (video.videoWidth - sourceWidth) / 2
    const sourceY = (video.videoHeight - sourceHeight) / 2
    context.drawImage(video, sourceX, sourceY, sourceWidth, sourceHeight, 0, 0, canvas.width, canvas.height)
    const dataUrl = canvas.toDataURL('image/jpeg', 0.92)
    setFrozenImage(dataUrl)
    return dataUrl
  }, [])

  const unfreeze = useCallback(() => setFrozenImage(null), [])
  const switchCamera = useCallback(() => {
    setFrozenImage(null)
    const nextFacingMode = facingModeRef.current === 'environment' ? 'user' : 'environment'
    facingModeRef.current = nextFacingMode
    void startCameraFor(nextFacingMode)
  }, [startCameraFor])

  const resetCamera = useCallback(() => {
    setFrozenImage(null)
    facingModeRef.current = 'environment'
    void startCameraFor('environment')
  }, [startCameraFor])

  return {
    videoRef,
    cameraState,
    torchOn,
    frozenImage,
    startCamera,
    toggleTorch,
    capture,
    unfreeze,
    switchCamera,
    resetCamera,
  }
}
