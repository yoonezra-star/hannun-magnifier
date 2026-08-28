import {
  AdMob,
  AdmobConsentStatus,
  BannerAdPosition,
  BannerAdSize,
} from '@capacitor-community/admob'
import { Capacitor } from '@capacitor/core'

export const ADMOB_TEST_BANNER_ID = 'ca-app-pub-3940256099942544/9214589741'
export const adsAreLive = import.meta.env.VITE_ADMOB_MODE === 'live'

let startup: Promise<boolean> | null = null

function bannerId() {
  if (!adsAreLive) return ADMOB_TEST_BANNER_ID
  const liveId = import.meta.env.VITE_ADMOB_ANDROID_BANNER_ID
  if (!liveId) throw new Error('실제 광고 모드에는 VITE_ADMOB_ANDROID_BANNER_ID가 필요합니다.')
  return liveId
}

async function initializeAds() {
  if (!Capacitor.isNativePlatform()) return false

  await AdMob.initialize({ initializeForTesting: !adsAreLive })
  let consent = await AdMob.requestConsentInfo()
  if (consent.isConsentFormAvailable && consent.status === AdmobConsentStatus.REQUIRED) {
    consent = await AdMob.showConsentForm()
  }
  if (!consent.canRequestAds) return false

  await AdMob.showBanner({
    adId: bannerId(),
    adSize: BannerAdSize.ADAPTIVE_BANNER,
    position: BannerAdPosition.BOTTOM_CENTER,
    margin: 0,
    isTesting: !adsAreLive,
  })
  return true
}

export function startAds() {
  startup ??= initializeAds().catch(() => false)
  return startup
}

export async function setAdsHidden(hidden: boolean) {
  if (!Capacitor.isNativePlatform()) return
  try {
    if (hidden) await AdMob.hideBanner()
    else await AdMob.resumeBanner()
  } catch {
    // The ad may be unavailable because consent was declined or loading failed.
  }
}

export async function openAdPrivacyOptions() {
  if (!Capacitor.isNativePlatform()) return false
  try {
    await AdMob.showPrivacyOptionsForm()
    return true
  } catch {
    return false
  }
}
