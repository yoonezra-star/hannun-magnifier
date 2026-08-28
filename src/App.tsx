import { useEffect, useMemo, useState } from 'react'
import {
  Camera,
  Contrast,
  Flashlight,
  FlipHorizontal2,
  Focus,
  HelpCircle,
  Lock,
  Minus,
  Plus,
  RotateCcw,
  Settings,
  Share2,
  X,
  Zap,
} from 'lucide-react'
import { Capacitor } from '@capacitor/core'
import { cameraFilter, clampZoom, nextViewMode, viewModeLabel, ZOOM_STEP, type ViewMode } from './camera'
import { saveImageToGallery } from './native'
import { openAdPrivacyOptions, setAdsHidden, startAds } from './ads'
import { useMagnifier } from './useMagnifier'

const FONT_SCALE_KEY = 'hannun-font-scale'

function App() {
  const previewMode = import.meta.env.DEV && new URLSearchParams(window.location.search).get('preview') === '1'
  const [zoom, setZoom] = useState(2)
  const [brightness, setBrightness] = useState(1)
  const [viewMode, setViewMode] = useState<ViewMode>('normal')
  const [message, setMessage] = useState('')
  const [panel, setPanel] = useState<'settings' | 'help' | null>(null)
  const [fontScale, setFontScale] = useState(() => Number(localStorage.getItem(FONT_SCALE_KEY) || 1))
  const [adsActive, setAdsActive] = useState(false)
  const {
    videoRef,
    cameraState,
    torchOn,
    frozenImage,
    startCamera,
    toggleTorch,
    capture,
    unfreeze,
    switchCamera,
  } = useMagnifier()

  useEffect(() => {
    document.documentElement.style.setProperty('--font-scale', String(fontScale))
    localStorage.setItem(FONT_SCALE_KEY, String(fontScale))
  }, [fontScale])

  useEffect(() => {
    void startAds().then(setAdsActive)
  }, [])

  useEffect(() => {
    if (adsActive) void setAdsHidden(panel !== null)
  }, [adsActive, panel])

  useEffect(() => {
    if (!message) return
    const timer = window.setTimeout(() => setMessage(''), 2400)
    return () => window.clearTimeout(timer)
  }, [message])

  const imageStyle = useMemo(
    () => ({ transform: `scale(${zoom})`, filter: cameraFilter(viewMode, brightness) }),
    [brightness, viewMode, zoom],
  )
  const displayedImage = previewMode ? '/demo-label.svg' : frozenImage

  const changeZoom = (amount: number) => setZoom((current) => clampZoom(current + amount))

  const freeze = () => {
    if (frozenImage) {
      unfreeze()
      setMessage('다시 움직이는 화면입니다')
      return
    }
    if (capture(viewMode, brightness, zoom)) setMessage('화면을 멈췄습니다')
  }

  const saveOrShare = async () => {
    const image = frozenImage ?? capture(viewMode, brightness, zoom)
    if (!image) {
      setMessage('카메라가 준비된 뒤 다시 눌러주세요')
      return
    }

    if (Capacitor.isNativePlatform()) {
      try {
        await saveImageToGallery(image)
        setMessage('사진 앱에 저장했습니다')
        return
      } catch {
        setMessage('사진을 저장하지 못했습니다')
        return
      }
    }

    const link = document.createElement('a')
    link.download = `한눈돋보기-${new Date().toISOString().slice(0, 19).replaceAll(':', '-')}.jpg`
    link.href = image
    link.click()
    setMessage('사진을 저장했습니다')
  }

  const torch = async () => {
    if (!(await toggleTorch())) setMessage('이 기기에서는 불빛을 켤 수 없습니다')
  }

  return (
    <main className={`app-shell${adsActive ? ' ads-active' : ''}`}>
      <header className="top-bar">
        <div>
          <span className="eyebrow">큰글씨 확대경</span>
          <h1>한눈돋보기</h1>
        </div>
        <div className="top-actions">
          <button className="icon-button" aria-label="도움말" onClick={() => setPanel('help')}><HelpCircle /></button>
          <button className="icon-button" aria-label="설정" onClick={() => setPanel('settings')}><Settings /></button>
        </div>
      </header>

      <section className="viewer" aria-label="돋보기 카메라 화면">
        {displayedImage ? (
          <img className={`camera-media${previewMode ? '' : ' frozen'}`} style={previewMode ? imageStyle : undefined} src={displayedImage} alt={previewMode ? '확대 중인 제품 안내 라벨 예시' : '멈춘 확대 화면'} />
        ) : (
          <video ref={videoRef} className="camera-media" style={imageStyle} playsInline muted />
        )}

        {!previewMode && cameraState !== 'ready' && !frozenImage && (
          <div className="camera-status">
            {cameraState === 'starting' && <><Focus className="pulse" /><strong>카메라를 준비하고 있습니다</strong></>}
            {cameraState === 'denied' && <><Lock /><strong>카메라 사용을 허용해주세요</strong><span>설정에서 카메라 권한을 켠 뒤 다시 시도하세요.</span><button onClick={startCamera}>다시 시도</button></>}
            {cameraState === 'unavailable' && <><Camera /><strong>카메라를 열 수 없습니다</strong><span>카메라가 있는 휴대폰에서 다시 시도해주세요.</span><button onClick={startCamera}>다시 시도</button></>}
          </div>
        )}

        <div className="viewer-badges">
          <span>{frozenImage ? '화면 멈춤' : '실시간'}</span>
          <span>{viewModeLabel[viewMode]}</span>
        </div>
        <div className="focus-guide" aria-hidden="true" />
      </section>

      <section className="zoom-panel" aria-label="확대 조절">
        <button className="zoom-button" onClick={() => changeZoom(-ZOOM_STEP)} aria-label="축소"><Minus /></button>
        <button className="zoom-value" onClick={() => setZoom(1)} aria-label="확대를 1배로 초기화">
          <strong>{zoom.toFixed(1)}×</strong><span>누르면 1배</span>
        </button>
        <button className="zoom-button primary" onClick={() => changeZoom(ZOOM_STEP)} aria-label="확대"><Plus /></button>
      </section>

      <section className="quick-actions" aria-label="돋보기 기능">
        <button className={torchOn ? 'active' : ''} onClick={torch}><Flashlight /><span>불빛</span></button>
        <button className={frozenImage ? 'active' : ''} onClick={freeze}>{frozenImage ? <RotateCcw /> : <Focus />}<span>{frozenImage ? '다시 보기' : '화면 멈춤'}</span></button>
        <button onClick={() => setZoom(10)}><Zap /><span>초확대</span></button>
        <button onClick={() => setViewMode(nextViewMode(viewMode))}><Contrast /><span>{viewModeLabel[viewMode]}</span></button>
        <button onClick={switchCamera}><FlipHorizontal2 /><span>카메라 전환</span></button>
        <button onClick={saveOrShare}>{Capacitor.isNativePlatform() ? <Share2 /> : <Camera />}<span>사진 저장</span></button>
      </section>

      <p className="privacy-note"><Lock size={17} /> 카메라 화면은 기기 밖으로 전송되지 않습니다.</p>

      {message && <div className="toast" role="status">{message}</div>}

      {panel && (
        <div className="sheet-backdrop" onClick={() => setPanel(null)}>
          <section className="bottom-sheet" onClick={(event) => event.stopPropagation()} aria-modal="true" role="dialog">
            <button className="sheet-close" onClick={() => setPanel(null)} aria-label="닫기"><X /></button>
            {panel === 'settings' ? (
              <>
                <span className="eyebrow">보기 편하게</span>
                <h2>설정</h2>
                <label className="setting-row">
                  <span><strong>화면 밝기</strong><small>돋보기 화면만 조절합니다</small></span>
                  <input aria-label="화면 밝기" type="range" min="0.7" max="1.5" step="0.1" value={brightness} onChange={(event) => setBrightness(Number(event.target.value))} />
                </label>
                <div className="setting-row stacked">
                  <span><strong>글자 크기</strong><small>버튼 글씨도 함께 커집니다</small></span>
                  <div className="segmented">
                    <button className={fontScale === 1 ? 'selected' : ''} onClick={() => setFontScale(1)}>보통</button>
                    <button className={fontScale === 1.1 ? 'selected' : ''} onClick={() => setFontScale(1.1)}>크게</button>
                    <button className={fontScale === 1.2 ? 'selected' : ''} onClick={() => setFontScale(1.2)}>아주 크게</button>
                  </div>
                </div>
                <nav className="policy-links"><a href="/privacy.html">개인정보처리방침</a><a href="/support.html">도움 및 문의</a></nav>
                {Capacitor.isNativePlatform() && <button className="ad-privacy" onClick={async () => { if (!(await openAdPrivacyOptions())) setMessage('현재 변경할 광고 개인정보 설정이 없습니다') }}>광고 개인정보 설정</button>}
              </>
            ) : (
              <>
                <span className="eyebrow">처음이어도 쉬워요</span>
                <h2>사용 방법</h2>
                <ol className="help-list">
                  <li><strong>작은 글씨를 화면 가운데 둡니다.</strong><span>휴대폰을 앞뒤로 천천히 움직이면 초점이 맞습니다.</span></li>
                  <li><strong>＋와 －로 크기를 조절합니다.</strong><span>초확대는 한 번에 10배로 크게 보여줍니다.</span></li>
                  <li><strong>흔들리면 화면 멈춤을 누릅니다.</strong><span>멈춘 화면을 편하게 확인한 뒤 다시 보기로 돌아갑니다.</span></li>
                </ol>
              </>
            )}
          </section>
        </div>
      )}
    </main>
  )
}

export default App
