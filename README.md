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

패키지명은 `com.yoone.hannunmagnifier`, 표시 버전은 `1.0.2`, versionCode는 `3`입니다.

```bash
npm run android:sync
```

Android SDK 위치는 로컬 `android/local.properties`에 설정합니다. 업로드 서명키와 비밀번호 파일은 Git에 올리지 않습니다.

## Cloudflare Pages

- 공개 URL: <https://hannun-magnifier.pages.dev/>
- 개인정보처리방침: <https://hannun-magnifier.pages.dev/privacy.html>
- 지원 페이지: <https://hannun-magnifier.pages.dev/support.html>
- 비공개 테스트 참여 안내: <https://hannun-magnifier.pages.dev/test.html>
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

## 비공개 테스트 참여

1. [한눈돋보기 Google 그룹](https://groups.google.com/g/hannun-magnifier-testers)에 가입합니다.
2. 같은 Google 계정으로 [웹 참여 링크](https://play.google.com/apps/testing/com.yoone.hannunmagnifier)에서 테스터 참여를 선택합니다.
3. [Play 스토어 앱 페이지](https://play.google.com/store/apps/details?id=com.yoone.hannunmagnifier)에서 설치합니다.
4. 프로덕션 출시 요건을 위해 14일 이상 참여 상태를 유지합니다.

그룹 가입 정보 반영에는 3~5분 정도 걸릴 수 있습니다.

## 출시 전 필수 교체

- 개발자 공개 이메일과 지원 연락처: `chw1914@gmail.com`
- 실제 AdMob 앱 ID 및 광고 단위 ID
- 업로드 서명키와 안전한 백업 위치
- Play Console 스토어 URL을 개인정보처리방침에 반영
