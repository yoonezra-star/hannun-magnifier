import { useCallback, useEffect, useRef, useState } from 'react'
import { cameraFilter, type ViewMode } from './camera'

type CameraState = 'starting' | 'ready' | 'denied' | 'unavailable'

export function useMagnifier() {
  const videoRef = useRef<HTMLVideoElement>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const [cameraState, setCameraState] = useState<CameraState>('starting')
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment')
  const [torchOn, setTorchOn] = useState(false)
  const [frozenImage, setFrozenImage] = useState<string | null>(null)

  const stopCamera = useCallback(() => {
    streamRef.current?.getTracks().forEach((track) => track.stop())
    streamRef.current = null
  }, [])

  const startCamera = useCallback(async () => {
    stopCamera()
    setCameraState('starting')
    setTorchOn(false)
    try {
      if (!navigator.mediaDevices?.getUserMedia) {
        setCameraState('unavailable')
        return
      }
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: false,
        video: {
          facingMode: { ideal: facingMode },
          width: { ideal: 1920 },
          height: { ideal: 1080 },
        },
      })
      streamRef.current = stream
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        await videoRef.current.play()
      }
      setCameraState('ready')
    } catch (error) {
      const name = error instanceof DOMException ? error.name : ''
      setCameraState(name === 'NotAllowedError' ? 'denied' : 'unavailable')
    }
  }, [facingMode, stopCamera])

  useEffect(() => {
    // Camera startup synchronizes the component with the browser media device.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void startCamera()
    return stopCamera
  }, [startCamera, stopCamera])

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
    setFacingMode((current) => (current === 'environment' ? 'user' : 'environment'))
  }, [])

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
  }
}
