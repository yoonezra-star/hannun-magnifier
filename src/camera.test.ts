import { describe, expect, it } from 'vitest'
import { cameraFilter, clampZoom, nextViewMode } from './camera'

describe('camera helpers', () => {
  it('keeps zoom between 1x and 10x in half steps', () => {
    expect(clampZoom(0)).toBe(1)
    expect(clampZoom(2.26)).toBe(2.5)
    expect(clampZoom(12)).toBe(10)
  })

  it('cycles through accessible viewing modes', () => {
    expect(nextViewMode('normal')).toBe('mono')
    expect(nextViewMode('invert')).toBe('normal')
  })

  it('combines brightness with contrast mode', () => {
    expect(cameraFilter('contrast', 1.2)).toContain('brightness(1.2)')
    expect(cameraFilter('contrast', 1.2)).toContain('contrast(1.8)')
  })
})
