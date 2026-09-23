# 설치 및 배포

1. Google Sheets에서 빈 스프레드시트를 만들고 URL의 `/d/`와 `/edit` 사이 값을 복사합니다.
2. 확장 프로그램 → Apps Script를 열고 `apps-script/`의 `.gs` 파일 및 매니페스트를 같은 이름으로 만듭니다.
3. 프로젝트 설정에서 시간대를 `Asia/Seoul`로 설정합니다.
4. 프로젝트 설정 → 스크립트 속성에 아래 값을 넣습니다. 비밀값은 GitHub에 커밋하지 않습니다.
5. `validateConfiguration()` 결과가 `valid: true`인지 확인한 뒤 `initializeSpreadsheet()`를 한 번 실행합니다.
6. 배포 → 새 배포 → 웹 앱, 실행 사용자 “나”, 액세스 “모든 사용자”로 배포합니다. 최종 `/exec` URL을 복사합니다.
7. `assets/js/config.js`의 `API_URL`에 `/exec` URL을 넣고 커밋합니다. `/dev` URL은 운영에 쓰지 않습니다.
8. `setupTriggers()`를 실행합니다. 06시/07시 일일 점검 및 월요일 08시 리포트, 총 3개인지 트리거 화면에서 확인합니다.
9. 실제 등록 학생 ID로 `runTestCheck('학번')`, 이어서 `sendTestWeeklyReport()`를 실행해 GitHub/Sheets/HTML 메일을 확인합니다.
10. GitHub Settings → Pages → Build and deployment에서 Deploy from a branch, `main`, `/(root)`를 선택합니다.
11. Custom domain에 `ready.k-bigdata.kr`을 입력합니다. DNS CNAME이 `hyeopgeon-lee.github.io`를 가리키는지 확인한 뒤 인증서 발급 후 Enforce HTTPS를 켭니다.

## Script Properties

| 키 | 값 |
|---|---|
| `SPREADSHEET_ID` | 위 스프레드시트 ID |
| `GITHUB_TOKEN` | GitHub fine-grained token. 공개 저장소 Contents metadata 읽기 권한만 최소 부여 |
| `PIN_SALT` | 32바이트 이상 무작위 문자열 |
| `ADMIN_PIN_HASH` | Apps Script에서 `hashPin('관리자 PIN')`을 임시 실행해 얻은 SHA-256 hex 값 |
| `REPORT_EMAIL` | `hglee67@kopo.ac.kr` |
| `APP_URL` | `https://ready.k-bigdata.kr/` |

관리자 PIN 원문이나 Salt를 문서·Sheet·프론트엔드에 기록하지 않습니다. 학생 PIN은 등록 API가 같은 서버 해시 함수를 사용합니다.

## 브라우저/CORS 점검

프론트엔드는 preflight를 피하도록 `Content-Type: text/plain;charset=utf-8`로 JSON 본문을 보내며 Apps Script의 리다이렉트를 따라갑니다. 배포 후 브라우저 개발자 도구 Network에서 `health`, 로그인 요청이 `/exec` → `script.googleusercontent.com` 리다이렉트 후 JSON 200인지 확인합니다. 배포 접근 권한이 조직 내부로 제한되면 익명 브라우저 호출이 로그인 HTML을 받아 실패합니다.
