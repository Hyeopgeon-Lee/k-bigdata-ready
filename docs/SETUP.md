# 설치 및 배포

## 기존 READY 프로젝트 업데이트

현재 운영 Apps Script 프로젝트가 단일 `Code.gs`를 사용하는 경우 `node tools/build-gas-bundle.mjs`로 만든 `deployment/READY_Code.gs`의 전체 내용을 기존 `Code.gs`에 붙여넣고 저장합니다. 기존 코드는 먼저 Apps Script 프로젝트 기록 또는 별도 백업으로 보존합니다. 새 버전을 배포하기 전에 `initializeSpreadsheet()`를 실행하면 기존 12개 Sheet의 데이터를 유지하면서 `README_CHECK`, `PORTFOLIO_CHECK`와 필요한 열을 추가합니다. 기존 학생에 대한 신규 평가 결과는 점검을 다시 실행한 뒤 채워집니다. 이후 웹 앱의 기존 배포를 새 버전으로 갱신하고 `/exec` 응답을 확인한 다음 프론트엔드 브랜치를 `main`에 병합합니다.

1. Google Sheets에서 빈 스프레드시트를 만들고 URL의 `/d/`와 `/edit` 사이 값을 복사합니다.
2. 확장 프로그램 → Apps Script를 열고 `apps-script/`의 `.gs` 파일 및 매니페스트를 같은 이름으로 만듭니다.
3. 프로젝트 설정에서 시간대를 `Asia/Seoul`로 설정합니다.
4. 프로젝트 설정 → 스크립트 속성에 아래 값을 넣습니다. 비밀값은 GitHub에 커밋하지 않습니다.
5. `validateConfiguration()` 결과가 `valid: true`인지 확인한 뒤 `initializeSpreadsheet()`를 한 번 실행합니다.
6. 배포 → 새 배포 → 웹 앱, 실행 사용자 “나”, 액세스 “모든 사용자”로 배포합니다. 최종 `/exec` URL을 복사합니다.
7. `assets/js/config.js`의 `API_URL`에 `/exec` URL을 넣고 커밋합니다. `/dev` URL은 운영에 쓰지 않습니다.
8. `setupTriggers()`를 실행합니다. 06시/07시 일일 점검 및 월요일 08시 리포트, 총 3개인지 트리거 화면에서 확인합니다.
9. 실제 등록 학생 ID로 `runTestCheck('학번')`, 이어서 `sendTestWeeklyReport()`를 실행해 GitHub/Sheets/HTML 메일을 확인합니다.
   READY 준비상태 개편 후에는 먼저 기존 스프레드시트를 백업하고 `initializeSpreadsheet()`를 실행하여 `README_CHECK`와 새 열을 추가합니다. 이어서 학생별 점검을 분할 실행해야 신규 활동일·README 결과가 채워집니다. 점검 전에는 `미점검` 상태가 표시될 수 있습니다.
10. GitHub Settings → Pages → Build and deployment에서 Deploy from a branch, `main`, `/(root)`를 선택합니다.
11. Custom domain에 `ready.k-bigdata.kr`을 입력합니다. DNS CNAME이 `hyeopgeon-lee.github.io`를 가리키는지 확인한 뒤 인증서 발급 후 Enforce HTTPS를 켭니다.

## Script Properties

| 키 | 값 |
|---|---|
| `SPREADSHEET_ID` | 위 스프레드시트 ID |
| `GITHUB_TOKEN` | GitHub fine-grained token. 공개 저장소 Contents metadata 읽기 권한만 최소 부여 |
| `NOTION_TOKEN` | Notion 내부 통합(Integration)의 Secret. 등록된 페이지의 최종 수정일 조회용 |
| `PIN_SALT` | 32바이트 이상 무작위 문자열 |
| `ADMIN_PIN_HASH` | Apps Script에서 `hashPin('관리자 PIN')`을 임시 실행해 얻은 SHA-256 hex 값 |
| `REPORT_EMAIL` | `hglee67@kopo.ac.kr` |
| `APP_URL` | `https://ready.k-bigdata.kr/` |

관리자 PIN 원문이나 Salt를 문서·Sheet·프론트엔드에 기록하지 않습니다. 학생 PIN은 등록 API가 같은 서버 해시 함수를 사용합니다.

## Notion 업데이트 점검 설정

1. [Notion Integrations](https://www.notion.so/my-integrations)에서 내부 통합을 만들고 Secret을 복사합니다.
2. Apps Script 프로젝트 설정 → 스크립트 속성에 `NOTION_TOKEN`으로 저장합니다. 토큰은 GitHub나 Sheet에 기록하지 않습니다.
3. 학생이 등록한 각 Notion 페이지에서 `연결` 또는 `Connections` 메뉴로 위 통합을 초대합니다. 학생 소유 페이지는 학생이 직접 연결해야 합니다.
4. `runTestCheck('학번')`를 실행하고 `NOTION_CHECK` Sheet에서 `last_edited_at`, `inactive_days`, `activity_status`가 기록되는지 확인합니다.

공식 Notion API가 반환하는 페이지 `last_edited_time`을 기준으로 30일 미만은 `최근 업데이트`, 30~59일은 `업데이트 필요`, 60일 이상은 `장기 미업데이트`로 표시합니다. 연결하지 않은 페이지는 404 또는 권한 오류로 기록됩니다.

## 준비상태 평가

- 1학년: 최근 7일 개발 활동일 3일 이상, Repository, README 핵심 내용, 포트폴리오 등록과 최신성을 확인합니다.
- 2학년: 위 조건과 함께 이력서 `최종 완성`, 자기소개서 `기본본 완성` 이상을 확인합니다.
- 필수조건을 모두 충족해야 `준비 우수`입니다. 일부 충족은 `준비 양호` 또는 `준비 중`, 충족 항목이 없으면 `관심 필요`입니다.
- commit 총 개수는 참고정보이며 핵심 판정에 사용하지 않습니다. LICENSE·Private·branch 수는 필수조건이 아닙니다.
- Notion 페이지는 Integration에 연결해야 최종 수정 시각을 읽을 수 있습니다. 접근 불가한 페이지는 URL 등록만으로 최신성 충족 처리되지 않습니다.

## 브라우저/CORS 점검

프론트엔드는 preflight를 피하도록 `Content-Type: text/plain;charset=utf-8`로 JSON 본문을 보내며 Apps Script의 리다이렉트를 따라갑니다. 배포 후 브라우저 개발자 도구 Network에서 `health`, 로그인 요청이 `/exec` → `script.googleusercontent.com` 리다이렉트 후 JSON 200인지 확인합니다. 배포 접근 권한이 조직 내부로 제한되면 익명 브라우저 호출이 로그인 HTML을 받아 실패합니다.

## 2026-10-08 READY 공동 학습 현황 개편 후 점검

1. GitHub `main` 코드와 운영 Apps Script deployment 버전 일치를 확인합니다.
2. 기존 스프레드시트를 백업한 뒤 `initializeSpreadsheet()`를 실행합니다. `STUDENTS.peer_share_consent_at`, `PORTFOLIO_CHECK.url_results`가 마지막 열에 추가되어야 합니다.
3. `runTestCheck('실제 학번')`으로 포트폴리오, GitHub, Notion 개별 결과를 확인합니다.
4. 신규 등록 시 공개 안내 동의가 없으면 등록 실패하고, 체크 후 등록되면 시각이 기록되는지 확인합니다.
5. 등록 학생별 홈 화면이 공개된다는 점을 기존 학생에게도 알리고, 별도의 공개 동의·철회 정책을 마련합니다. `noindex`는 비공개 접근 제어가 아닙니다.
6. 관리자/학생 PIN 다섯 번 실패 시 15분 동안 추가 로그인이 제한되는지 테스트합니다. 6시간 만료 후 재로그인해야 합니다.
7. 06시·07시 트리거가 각 실행의 미점검 학생을 먼저 처리하고, GitHub·Notion·포트폴리오가 같은 학생에 대해 갱신되는지 확인합니다.
8. 기존 `/exec` URL로 실제 응답을 테스트하고 학생 모바일 화면의 GitHub/대표 프로젝트/포트폴리오 링크를 확인합니다.

**주의:** 계정 소유 확인은 여전히 학번과 PIN만으로 이루어집니다. 실제 재학생 명부 검증이나 학교 계정 기반 본인 인증은 별도 구축해야 하며, 미구현 상태에서 인증이 안전하다고 간주하면 안 됩니다.
