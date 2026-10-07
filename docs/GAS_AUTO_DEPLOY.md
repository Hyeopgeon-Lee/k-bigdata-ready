# READY Apps Script 자동배포 설정

READY 백엔드는 GitHub의 `apps-script/`를 원본 소스로 사용합니다. GitHub Actions가 테스트를 통과한 뒤 Google Apps Script 프로젝트에 소스를 push하고 기존 Web App deployment를 새 버전으로 갱신합니다.

## 배포 흐름

```text
ChatGPT / 개발자
  -> GitHub main
  -> READY 회귀 테스트
  -> deployment/READY_Code.gs 동기화 검증
  -> clasp push
  -> 기존 Web App deployment 갱신
```

`.github/workflows/deploy-gas.yml`은 `apps-script/**` 등 GAS 관련 파일이 main에서 변경될 때 실행됩니다. 필요한 Secret이 아직 없으면 테스트까지만 실행하고 실제 Apps Script 배포는 건너뜁니다.

## 최초 1회 준비

### 1. Google Apps Script API 허용

Apps Script 사용자 설정에서 Google Apps Script API 사용을 허용합니다.

### 2. Script ID 확인

READY Apps Script 편집기에서 프로젝트 설정을 열어 Script ID를 확인합니다.

GitHub 저장소의 다음 Secret으로 저장합니다.

```text
GAS_SCRIPT_ID
```

### 3. 기존 Web App Deployment ID 확인

Apps Script의 배포 > 배포 관리에서 현재 READY Web App 배포의 Deployment ID를 확인합니다.

다음 Secret으로 저장합니다.

```text
GAS_DEPLOYMENT_ID
```

새 Deployment를 만들지 않고 기존 ID를 갱신하므로 기존 `/exec` URL을 유지합니다.

### 4. clasp 로그인 정보 생성

로컬 PC에서 Node.js 20 이상을 준비하고 다음을 실행합니다.

```bash
npm install --global @google/clasp@3.4.1
clasp login
```

브라우저에서 READY Apps Script를 소유한 Google 계정으로 로그인합니다.

로그인이 끝나면 clasp 인증 파일이 생성됩니다.

- macOS / Linux: `~/.clasprc.json`
- Windows: 사용자 홈 폴더의 `.clasprc.json`

이 파일의 JSON 전체 내용을 GitHub Secret에 저장합니다.

```text
CLASP_CREDENTIALS_JSON
```

이 파일에는 OAuth 인증 정보가 있으므로 저장소 파일, 이슈, 채팅에 올리지 않습니다.

## GitHub Secret 등록 위치

저장소에서 다음 위치로 이동합니다.

```text
Settings
  -> Secrets and variables
  -> Actions
  -> Repository secrets
```

다음 3개를 등록합니다.

| Secret | 값 |
|---|---|
| `GAS_SCRIPT_ID` | READY Apps Script Script ID |
| `GAS_DEPLOYMENT_ID` | 현재 READY Web App Deployment ID |
| `CLASP_CREDENTIALS_JSON` | `.clasprc.json` 전체 JSON |

## 최초 배포 확인

3개 Secret 등록 후 GitHub의 Actions에서 `Deploy Apps Script` workflow를 선택하고 `Run workflow`를 한 번 실행합니다.

성공 순서는 다음과 같습니다.

1. READY 회귀 테스트
2. 배포 번들 동기화 검증
3. clasp 인증 확인
4. Apps Script source push
5. 기존 Web App redeploy

이후에는 GAS 관련 소스가 `main`에 반영될 때 자동으로 같은 절차가 실행됩니다.

## 운영 원칙

- `apps-script/`를 실제 Apps Script 원본 소스로 사용합니다.
- Apps Script 편집기에서 직접 장기 수정하지 않습니다. 직접 수정했다면 GitHub에도 같은 변경을 먼저 반영합니다.
- `deployment/READY_Code.gs`는 수동 복구용 통합본이며 workflow에서 원본과 일치하는지 검증합니다.
- GitHub Token, Google OAuth 정보, PIN, Spreadsheet ID 등 비밀값은 저장소에 commit하지 않습니다.
- 자동배포 실패 시 Apps Script의 기존 Web App 배포는 마지막 성공 버전을 계속 사용합니다.

## 인증 만료 시

Google 계정 정책 변경 또는 OAuth 인증 만료로 clasp 인증 단계가 실패하면 로컬에서 다시 `clasp login`한 뒤 새 `.clasprc.json` 내용으로 `CLASP_CREDENTIALS_JSON` Secret을 갱신합니다.
