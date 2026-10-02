# Google Sheets 스키마

`initializeSpreadsheet()`가 다음 12개 Sheet와 헤더를 생성합니다.

- `STUDENTS`: 기본정보, 공개 URL, 취업준비 상태, `pin_hash`, active 및 시각, `grade`(1/2학년)
- `REPOSITORIES`: 소유자/이름/URL, 대표작, 순서, active
- `CERTIFICATES`: 자격증명, 준비/취득, 취득일, active
- `GITHUB_CHECK`: 학생별 최신 활동, 본인 commit 집계, README 수, 상태/오류
- `REPOSITORY_CHECK`: Repository별 전체/본인 commit, README, 언어, 최신 활동
- `BLOG_CHECK`: 접속 여부, Repository/게시 활동, 탐지 플랫폼
- `NOTION_CHECK`: Notion 페이지 마지막 수정 시각, 미업데이트 일수, 상태 및 API 오류
- `CHANGE_HISTORY`: 수동 변경 전후 값과 `STUDENT`/`ADMIN`/`SYSTEM`
- `PROFESSOR_MEMO`: 관리자 전용 지도 메모
- `CHECK_LOG`: 배치와 이메일 실행 성공/실패
- `WEEKLY_SNAPSHOT`: 주간 통계 및 전주 비교 원본
- `SETTINGS`: 공개 가능한 운영 설정만 사용(비밀정보 금지)

정확한 열 순서는 `apps-script/Config.gs`의 `READY.SHEETS`가 단일 기준입니다. 삭제는 `active=false`인 soft delete이며 자동점검 표는 학생/Repository 키 기준 최신 행을 갱신합니다.

`grade`는 기존 운영 데이터의 열 위치를 바꾸지 않도록 `STUDENTS`의 마지막 열에 추가됩니다. 기존 학생은 내 정보 수정에서 학년을 선택하기 전까지 교수 대시보드에 `학년 미지정`으로 표시됩니다.
