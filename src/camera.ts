export type ViewMode = 'normal' | 'mono' | 'contrast' | 'invert'

export const ZOOM_MIN = 1
export const ZOOM_MAX = 10
export const ZOOM_STEP = 0.5

export function clampZoom(value: number) {
  return Math.min(ZOOM_MAX, Math.max(ZOOM_MIN, Math.round(value * 2) / 2))
}

export function nextViewMode(mode: ViewMode): ViewMode {
  const modes: ViewMode[] = ['normal', 'mono', 'contrast', 'invert']
  return modes[(modes.indexOf(mode) + 1) % modes.length]
}

export function cameraFilter(mode: ViewMode, brightness: number) {
  const filters = [`brightness(${brightness})`]
  if (mode === 'mono') filters.push('grayscale(1)')
  if (mode === 'contrast') filters.push('grayscale(1)', 'contrast(1.8)')
  if (mode === 'invert') filters.push('grayscale(1)', 'contrast(1.5)', 'invert(1)')
  return filters.join(' ')
}

export const viewModeLabel: Record<ViewMode, string> = {
  normal: '일반',
  mono: '흑백',
  contrast: '고대비',
  invert: '반전',
}
