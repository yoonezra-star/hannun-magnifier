# 한눈돋보기

작은 글씨와 물건을 쉽고 크게 보는 시니어 친화형 카메라 확대 도구입니다.

## 1.0 범위

- 실행 즉시 후면 카메라 시작
- 1~10배 디지털 확대와 초확대
- 불빛, 화면 멈춤, 흑백·고대비·반전 보기
- 전면·후면 카메라 전환
- 사진 저장/공유
- 세 단계 글자 크기
- 개인정보처리방침과 지원 페이지

로그인, 서버, 건강·의료 기능, OCR, 주소록 접근은 포함하지 않습니다.

## 개발

```bash
npm install
npm run dev
npm test
npm run lint
npm run build
```

카메라 기능은 `localhost` 또는 HTTPS에서만 동작합니다.

## Android

패키지명은 `com.yoone.hannunmagnifier`, 표시 버전은 `1.0.0`, versionCode는 `1`입니다.

```bash
npm run android:sync
```

Android SDK 위치는 로컬 `android/local.properties`에 설정합니다. 업로드 서명키와 비밀번호 파일은 Git에 올리지 않습니다.

## Cloudflare Pages

- 공개 URL: <https://hannun-magnifier.pages.dev/>
- 개인정보처리방침: <https://hannun-magnifier.pages.dev/privacy.html>
- 지원 페이지: <https://hannun-magnifier.pages.dev/support.html>
- 빌드 명령: `npm run build`
- 출력 폴더: `dist`
- Node.js: 24

## AdMob 테스트/실제 광고 분리

기본 빌드는 Google 공식 데모 앱 ID와 데모 배너 ID만 사용합니다. 실제 광고는 아래 두 값을 모두 명시한 빌드에서만 사용합니다.

```powershell
$env:VITE_ADMOB_MODE='live'
$env:VITE_ADMOB_ANDROID_BANNER_ID='ca-app-pub-.../...'
$env:ADMOB_APP_ID='ca-app-pub-...~...'
npm run android:sync
Set-Location android
.\gradlew.bat bundleRelease
```

실제 `ADMOB_APP_ID`가 없으면 Android release 빌드는 의도적으로 중단됩니다. 개발 중에는 자신의 실제 광고를 누르지 말고 테스트 광고만 사용합니다.

## 출시 전 필수 교체

- 개발자 공개 이메일과 지원 연락처
- 실제 AdMob 앱 ID 및 광고 단위 ID
- 업로드 서명키와 안전한 백업 위치
- Play Console 스토어 URL을 개인정보처리방침에 반영
