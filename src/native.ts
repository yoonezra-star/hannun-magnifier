import { Capacitor, registerPlugin } from '@capacitor/core'

interface ImageSaverPlugin {
  save(options: { dataUrl: string; filename: string }): Promise<{ uri: string }>
}

const ImageSaver = registerPlugin<ImageSaverPlugin>('ImageSaver')

export async function saveImageToGallery(dataUrl: string) {
  if (!Capacitor.isNativePlatform()) return null
  const filename = `한눈돋보기-${new Date().toISOString().slice(0, 19).replaceAll(':', '-')}.jpg`
  return ImageSaver.save({ dataUrl, filename })
}
