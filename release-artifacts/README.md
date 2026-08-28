# Release artifacts

`hannun-magnifier-1.0.0-testads-signed.aab`는 업로드 키와 Android App Bundle 형식을 검증하기 위한 테스트 광고 서명본입니다.

이 파일은 Google 데모 AdMob 앱 ID와 배너 ID를 사용하므로 Play Console에 업로드하지 않습니다.

`hannun-magnifier-1.0.0-liveads-signed.aab`는 한눈돋보기의 실제 AdMob 앱 ID와 하단 배너 ID를 넣은 Play Console 업로드 후보입니다. 개발 및 자체 기능 확인에는 테스트 광고 빌드를 사용하고, 실제 광고 빌드는 Play Console 제출 단계에서만 사용합니다.

- 업로드 인증서 SHA-256: `A7:34:5B:35:EF:88:E4:39:DE:7B:1F:92:F6:AB:12:9C:DC:C2:6F:2D:C9:5A:70:3F:87:74:3D:26:47:75:AF:FE`
- 테스트 AAB 파일 SHA-256: `5E760F4F85D248453DD7C85546EF10DEB1BA91BC6E5FB9FA4E025753090DDE47`
- 실제 광고 AAB 파일 SHA-256: `919E234771C4CA2E92D4F9F03A2C3B7F62ED84A0F9302A54BAB1D1DBAB5E7160`
- bundletool 1.18.3 검증: 통과
