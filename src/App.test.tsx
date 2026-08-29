import { fireEvent, render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import App from './App'

const magnifier = vi.hoisted(() => ({
  videoRef: { current: null },
  cameraState: 'ready' as const,
  torchOn: false,
  frozenImage: null,
  startCamera: vi.fn(),
  toggleTorch: vi.fn().mockResolvedValue(true),
  capture: vi.fn(),
  unfreeze: vi.fn(),
  switchCamera: vi.fn(),
  resetCamera: vi.fn(),
}))

vi.mock('./useMagnifier', () => ({ useMagnifier: () => magnifier }))
vi.mock('./ads', () => ({
  openAdPrivacyOptions: vi.fn().mockResolvedValue(false),
  setAdsHidden: vi.fn().mockResolvedValue(undefined),
  startAds: vi.fn().mockResolvedValue(false),
}))

describe('camera reset', () => {
  beforeEach(() => {
    magnifier.resetCamera.mockClear()
    localStorage.clear()
  })

  it('restores 1x view and restarts the camera after super zoom', () => {
    render(<App />)

    fireEvent.click(screen.getByRole('button', { name: '초확대' }))
    expect(screen.getByRole('button', { name: '확대를 1배로 초기화' })).toHaveTextContent('10.0×')

    fireEvent.click(screen.getByRole('button', { name: '카메라 화면 리셋' }))
    expect(screen.getByRole('button', { name: '확대를 1배로 초기화' })).toHaveTextContent('1.0×')
    expect(magnifier.resetCamera).toHaveBeenCalledOnce()
    expect(screen.getByRole('status')).toHaveTextContent('카메라를 다시 시작합니다')
  })
})
