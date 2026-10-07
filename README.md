# READY

한국폴리텍대학 서울강서캠퍼스 빅데이터소프트웨어공학과의 취업 포트폴리오 관리 시스템입니다. 학생의 GitHub·프로젝트·기술블로그·포트폴리오·이력서·자기소개서·자격증 상태를 관리하고, 교수자가 점검이 필요한 학생을 빠르게 찾도록 돕습니다. 순위나 평가 점수를 만들지 않습니다.

## 주요 기능

- 학번 + 6자리 PIN 학생 인증, 별도 관리자 PIN 인증, 8시간 세션
- 단계형 최초 등록, 영역별 프로필 수정, Repository 최대 5개 soft delete, 자격증 관리 및 변경 이력
- 학생 본인 대시보드, 공개 정보만 제공하는 학과 현황, 관리자 요약·필터·학생 상세·비공개 교수 메모
- GitHub REST API로 최근 7일·14일 활동일, Repository 기본 품질, README 9개 내용 영역 점검
- 학생 이름과 우선 보완사항 최대 3개를 메인 화면에 공개하고, Notion API로 문서 마지막 수정일과 장기 미업데이트 상태 점검
- 준비상태를 `관심 필요 → 준비 중 → 준비 양호 → 준비 우수`로 표시하며 학년별 필수조건을 공통 평가 함수로 판정
- 매일 06시·07시, 당일 미점검 학생을 최대 30명씩 처리하고 06시 FAILED/PARTIAL 학생은 07시에 우선 재시도
- GitHub Pages 접속 및 Jekyll/Hugo/일반 콘텐츠 폴더 탐지, 10분 즉시 점검 쿨다운
- 매주 월요일 08시 HTML 주간 리포트와 `WEEKLY_SNAPSHOT` 전주 비교
- 모바일 우선 360px 반응형 GitHub Pages 프론트엔드

## 구조

`index.html`/`assets`는 GitHub Pages 정적 프론트엔드이고, `apps-script`는 Sheets를 사용하는 Web App 백엔드입니다. 상세 설치는 [SETUP](docs/SETUP.md), API는 [API](docs/API.md), 스키마는 [DATA_SCHEMA](docs/DATA_SCHEMA.md)를 봅니다.

## 보안

GitHub Token, PIN 원문, Salt, Spreadsheet ID는 저장소에 두지 않습니다. 학생 PIN과 관리자 PIN은 `PIN_SALT + PIN`의 SHA-256 해시만 서버에서 비교합니다. 공개 API는 교수 메모, PIN 해시, 내부 로그를 반환하지 않습니다. URL 검증과 출력 HTML escape를 적용합니다.

## 운영 문제 해결

- “API URL 설정 필요”: `assets/js/config.js`의 빈 `API_URL`에 `/exec` 배포 URL을 입력합니다.
- 로그인 실패: Script Properties의 Salt와 해시 생성 방식을 확인합니다.
- GitHub 실패: Token 권한·만료·rate limit과 관리자 상세의 기술 오류를 확인합니다.
- 예약 작업 누락: Apps Script 실행 기록 및 트리거를 확인한 뒤 `setupTriggers()`를 다시 실행합니다.
- Pages 도메인 오류: Settings → Pages에서 `main / (root)`, Custom domain, Enforce HTTPS를 확인합니다.
