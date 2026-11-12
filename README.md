# Today Board

매일 해야 할 일을 체크하고, 얼마나 꾸준히 하고 있는지 보는 개인용 Daily 체크리스트 웹앱이에요.
폰과 PC에서 쓰는 PWA이고, 데이터는 별도의 **Private GitHub 저장소**에 저장해서 기기끼리 동기화해요.

- 배포 주소: https://sehyunnoh.github.io/today-board/

## 주요 기능

- **오늘 체크리스트**: 카테고리 안의 항목 중 **하나라도 체크하면 그 카테고리는 "오늘 미션 완료"** 예요. 자정(America/Toronto 기준)이 지나면 새로 시작해요.
- **목록 편집**: 카테고리와 항목을 추가, 수정, 삭제(숨김 처리), 드래그로 순서 변경. 하위 항목도 지원해요.
- **날씨와 환율**: 오크빌(ON) 날씨와 4일 예보, 원화(KRW)와 캐나다 달러(CAD) 환율과 계산기.
- **기록**: 최근 14일 완료율, 13주 달력, 연속 달성일, 카테고리별 달성.
- **GitHub 동기화**: 변경하면 3초 뒤 저장, 오프라인에서도 동작하고 연결되면 자동 저장.
- **PWA**: 홈 화면에 추가, 오프라인 실행, 새 버전 알림.

## 기술 스택

React 19 · TypeScript · Vite · zustand · @dnd-kit · vite-plugin-pwa · Vitest

## 시작하기

```bash
npm install
npm run dev        # 개발 서버 (http://localhost:5173/today-board/)
npm test           # 단위 테스트
npm run build      # 타입 검사 + 프로덕션 빌드
npm run preview    # 빌드 결과 확인 (서비스 워커/오프라인은 여기서 확인)
npm run generate-icons   # public/icon.svg에서 PWA 아이콘 다시 만들기
npm run generate-favicon # public/favicon.svg에서 favicon.ico(16/32/48px) 다시 만들기
```

개발 서버(`npm run dev`)에서는 서비스 워커가 꺼져 있어요. PWA 동작은 `build` 후 `preview`로 확인하세요.

## 폴더 구조

```
src/
├─ domain/      순수 로직 (완료 규칙, 날짜, 병합, 통계, 편집). UI와 무관해서 테스트하기 쉬워요
├─ store/       zustand 상태 (목록·기록은 localStorage에 저장, 동기화 설정)
├─ services/    GitHub API, 동기화 엔진(syncCore는 저장소/앱 상태를 주입받아 테스트 가능), 날씨, 환율
├─ hooks/       자정 전환, 캐시된 외부 데이터, 대화상자 포커스
├─ components/  카드, 시트, 탭 등 화면 부품
├─ pages/       오늘, 기록
├─ test/        테스트 전용 가짜 목록
└─ config.ts    날씨 위치와 캐시 시간
```

## 데이터 저장과 동기화

- 앱은 먼저 브라우저(localStorage)에 즉시 저장하고, 몇 초 뒤 GitHub 저장소에 올려요. 그래서 오프라인에서도 쓸 수 있어요.
- 저장소는 **반드시 Private** 이어야 해요. Public이면 앱이 동기화를 거부해요.
- 저장소의 파일: `data/list.json`(목록), `data/logs/YYYY-MM.json`(월별 체크 기록)
- 두 기기가 같은 날 기록을 고쳐도 합쳐져요. 항목마다 마지막으로 바꾼 시각을 남겨서, 한쪽에서 한 **해제**도 다른 기기에 전달돼요. 목록은 나중에 수정한 쪽이 이겨요.
- 항목을 삭제하면 지우지 않고 숨겨요(`archived`). 지난 기록과 통계가 깨지지 않아요.

### 연결 방법 (기기마다 한 번)

1. 데이터를 저장할 **Private 저장소**를 만들어요.
2. GitHub → Settings → Developer settings → Fine-grained tokens에서 토큰을 만들어요.
   - Repository access: 위의 데이터 저장소 **하나만**
   - Permissions: **Contents: Read and write**
   - 만료일을 설정해요.
3. 앱의 설정 창에서 저장소 소유자, 이름, 토큰을 입력하고 "연결 테스트 후 저장"을 눌러요.

토큰은 그 기기의 브라우저에만 저장돼요. 코드, 저장소, 오류 메시지 어디에도 들어가지 않아요.

## 설정 값

| 바꾸고 싶은 것 | 위치 |
|---|---|
| 날씨 위치 | `src/config.ts`의 `LOCATION` |
| 날씨/환율 새로고침 간격 | `src/config.ts`의 `WEATHER_TTL_MS`, `FX_TTL_MS` |
| "달성한 날" 기준(기본 완료율 50%) | `src/domain/stats.ts`의 `GOOD_DAY_RATE` |
| 하루가 바뀌는 기준 시간대 | `src/domain/date.ts`의 `APP_TIMEZONE` |
| 색, 둥글기 | `src/styles/tokens.css` |

## 배포

`main`에 push하면 GitHub Actions(`.github/workflows/deploy.yml`)가 테스트 → 빌드 → GitHub Pages 배포를 해요.
저장소 Settings → Pages의 Source는 "GitHub Actions"로 설정돼 있어야 해요. 하위 경로(`/today-board/`)에서 서비스되므로 `vite.config.ts`의 `base`와 맞춰 두었어요.

## 접근성

키보드만으로 모든 기능을 쓸 수 있고(드래그 순서 변경 포함), 대화상자는 포커스를 가두고 닫으면 돌려줘요. 글자 색 대비는 WCAG AA(4.5:1) 이상이고, 움직임 줄이기 설정을 따라요. 스크린리더용 안내 문구는 한국어예요.

## 알려진 한계

- 환율은 유럽중앙은행 기준 참고 환율이라 실제 은행 환율과 달라요.
- 목록(카테고리/항목 구조)을 두 기기에서 동시에 고치면 나중에 고친 쪽이 이겨요.
- 아이폰은 오래 열지 않으면 브라우저가 저장 공간을 정리할 수 있어서, GitHub 동기화 연결을 권장해요.
- 할 일 목록은 공개 코드에 없어요. 처음 여는 기기는 빈 화면이고, 동기화를 연결하면 Private 저장소의 `data/list.json`을 불러와요. (연결 전에도 직접 카테고리를 만들어 쓸 수 있어요)
