# Google Sheets 스키마

`initializeSpreadsheet()`가 기존 데이터를 유지하며 다음 14개 Sheet와 누락된 헤더를 추가합니다. 기존 열의 순서를 바꾸거나 데이터를 덮어쓰지 않습니다.

- `STUDENTS`: 기본정보, 공개 URL, 취업준비 상태, `pin_hash`, active 및 시각, `grade`(1/2학년), `peer_share_consent_at`(신규 등록 시 동료 현황 공개 안내 동의)
- `REPOSITORIES`: 소유자/이름/URL, 대표작, 순서, active
- `CERTIFICATES`: 자격증명, 준비/취득, 취득일, active
- `GITHUB_CHECK`: 학생별 최신 활동, 본인 commit 집계, `active_days_7d`, `active_days_14d`, 마지막 활동, 상태/오류
- `REPOSITORY_CHECK`: Repository별 commit·활동일, `.gitignore`, LICENSE, README, description, topics, 언어, push, 공개 여부, branch 수
- `README_CHECK`: Repository별 9개 내용 영역의 충족 여부, README 상태, 미흡 항목
- `BLOG_CHECK`: 접속 여부, Repository/게시 활동, 탐지 플랫폼
- `NOTION_CHECK`: Notion 페이지 마지막 수정 시각, 미업데이트 일수, 상태 및 API 오류
- `PORTFOLIO_CHECK`: Notion 이외 공개 포트폴리오·블로그·GitHub Pages URL별 개별 접속 결과(JSON `url_results`)와 종합 결과
- `CHANGE_HISTORY`: 수동 변경 전후 값과 `STUDENT`/`ADMIN`/`SYSTEM`
- `PROFESSOR_MEMO`: 관리자 전용 지도 메모
- `CHECK_LOG`: 배치와 이메일 실행 성공/실패
- `WEEKLY_SNAPSHOT`: 주간 통계 및 전주 비교 원본
- `SETTINGS`: 공개 가능한 운영 설정만 사용(비밀정보 금지)

정확한 열 이름은 `apps-script/Config.gs`의 `READY.SHEETS`가 기준입니다. 기존 Sheet에 새 열은 마지막에 추가됩니다. 삭제는 `active=false`인 soft delete이며 자동점검 표는 학생/Repository 키 기준 최신 행을 갱신합니다.

`grade`는 기존 운영 데이터의 열 위치를 바꾸지 않도록 `STUDENTS`의 마지막 열에 추가됩니다. 기존 학생은 내 정보 수정에서 학년을 선택하기 전까지 교수 대시보드에 `학년 미지정`으로 표시됩니다.

기존 학생 데이터는 삭제되지 않습니다. `peer_share_consent_at`이 빈 기존 학생의 공개 고지·동의는 별도로 확인해야 하며, API에서 확인된 적 없는 동의를 추정해서는 안 됩니다.
