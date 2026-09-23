# API

모든 호출은 Apps Script `/exec`에 `POST`, `text/plain` JSON으로 보냅니다. 응답은 `{success:true,data}` 또는 `{success:false,error:{code,message}}`입니다. `health`는 GET도 지원합니다.

| action | 인증 | 설명 |
|---|---|---|
| `registerStudent`, `studentLogin`, `adminLogin` | 없음 | 등록 및 로그인 |
| `studentLogout`, `adminLogout` | 세션 | 세션 폐기 |
| `getMyDashboard`, `getMyProfile`, `updateMyProfile` | 학생 | 본인 정보 |
| `addRepository`, `updateRepository`, `removeRepository` | 학생 | 본인 Repository |
| `addCertificate`, `updateCertificate`, `removeCertificate` | 학생 | 본인 자격증 |
| `getChangeHistory`, `runMyGitHubCheck` | 학생 | 이력/10분 쿨다운 점검 |
| `getClassDashboard` | 학생 | 공개 허용 필드만 반환 |
| `getAdminDashboard`, `getAdminStudentDetail` | 관리자 | 관리자 데이터 |
| `saveProfessorMemo` | 관리자 | 비공개 교수 메모 |
| `runBatchCheck`, `sendWeeklyReport` | 관리자 | 수동 운영 실행 |

API는 학생 관련 변경 시 본문의 `student_id` 대신 세션의 학생 ID를 사용합니다. `getAdminStudentDetail`만 관리자 세션으로 대상 ID를 받습니다.
