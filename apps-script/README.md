# READY Apps Script

이 폴더의 파일을 하나의 Google Apps Script 프로젝트에 동일한 파일명으로 추가합니다. `appsscript.json`을 쓰려면 프로젝트 설정에서 매니페스트 표시를 켭니다.

실행 순서: Script Properties 설정 → `validateConfiguration()` → `initializeSpreadsheet()` → 웹 앱 배포 → `setupTriggers()` → `runTestCheck(studentId)` → `sendTestWeeklyReport()`.

웹 앱은 **나(배포자)로 실행**, 액세스 권한은 **모든 사용자**로 배포합니다. 보안은 애플리케이션의 PIN 해시/세션 검증이 담당합니다. 세션은 Script Cache에서 8시간 유지되며 서버 재시작 또는 캐시 축출 시 조기 만료될 수 있습니다.
