import { GithubError, PublicRepoError, getFile, putFile, verifyAccess, type GithubConfig } from './github';
import { monthOf, syncWithRetry, type FileStore, type LocalBoard } from './syncCore';
import { useBoardStore } from '../store/useBoardStore';
import { useSyncStore } from '../store/useSyncStore';

/**
 * 앱 상태와 GitHub를 연결하는 동기화 엔진.
 * - 로컬 변경 3초 뒤 저장(debounce), 앱 시작/탭 복귀/온라인 복귀/5분마다 확인
 * - 실제 합치기와 충돌 처리는 syncCore에 있다.
 */

const DEBOUNCE_MS = 3_000;
const POLL_MS = 5 * 60_000;

let running = false;
let again = false;
let timer: number | undefined;
let applyingRemote = false;
let verifiedFor = ''; // 이번 실행에서 저장소 확인(Public 여부)을 마친 연결
const extraMonths = new Set<string>(); // 기록 화면을 위해 추가로 불러올 지난 달들

const fileStore = (cfg: GithubConfig): FileStore => ({
  get: (path) => getFile(cfg, path),
  put: (path, text, sha, message) => putFile(cfg, path, text, sha, message),
});

/** 원격에서 온 변경을 앱 상태에 합친다. 이때는 다시 동기화를 예약하지 않는다. */
const localBoard: LocalBoard = {
  getList: () => useBoardStore.getState().list,
  getLogs: () => useBoardStore.getState().logs,
  mergeList: (remote) => {
    applyingRemote = true;
    try {
      useBoardStore.getState().mergeRemoteList(remote);
    } finally {
      applyingRemote = false;
    }
  },
  mergeLogs: (remote) => {
    applyingRemote = true;
    try {
      useBoardStore.getState().mergeRemoteLogs(remote);
    } finally {
      applyingRemote = false;
    }
  },
};

/** 사용자에게 보여줄 오류 문구. 토큰은 포함하지 않는다. */
export function describeError(e: unknown): { status: 'offline' | 'error'; message: string } {
  if (e instanceof PublicRepoError) return { status: 'error', message: e.message };
  if (e instanceof GithubError) {
    if (e.status === 401) return { status: 'error', message: '토큰이 올바르지 않거나 만료됐어요. 설정에서 다시 입력해 주세요.' };
    if (e.status === 403 || e.status === 404) {
      return { status: 'error', message: '저장소를 찾을 수 없거나 권한이 없어요. 저장소 이름과 토큰의 Contents(Read and write) 권한을 확인해 주세요.' };
    }
    if (e.status === 409 || e.status === 422) return { status: 'error', message: '다른 기기와 동시에 수정되어 저장하지 못했어요. 잠시 후 다시 시도해 주세요.' };
    return { status: 'error', message: `GitHub 오류 (${e.status})` };
  }
  // fetch 자체가 실패(네트워크 끊김, 타임아웃)
  if (e instanceof TypeError || (e instanceof DOMException && (e.name === 'TimeoutError' || e.name === 'AbortError'))) {
    return { status: 'offline', message: '인터넷에 연결되어 있지 않아요. 연결되면 자동으로 저장해요.' };
  }
  return { status: 'error', message: e instanceof Error ? e.message : '알 수 없는 오류' };
}

/** 이번 동기화에서 읽고 쓸 달 목록 */
function monthsToSync(initialSyncDone: boolean): string[] {
  const { today, dirtyMonths, logs } = useBoardStore.getState();
  const months = new Set<string>([monthOf(today), ...dirtyMonths, ...extraMonths]);
  if (!initialSyncDone) Object.keys(logs).forEach((d) => months.add(monthOf(d)));
  return [...months].sort();
}

export async function runSync(): Promise<void> {
  const sync = useSyncStore.getState();
  const cfg = sync.config;
  if (!cfg) {
    sync.setStatus('off');
    return;
  }
  if (running) {
    again = true;
    return;
  }
  running = true;
  window.clearTimeout(timer);
  sync.setStatus('syncing');
  const revAtStart = useBoardStore.getState().rev;
  try {
    const key = `${cfg.owner}/${cfg.repo}`;
    if (verifiedFor !== key) {
      await verifyAccess(cfg); // Public 저장소면 여기서 막는다
      verifiedFor = key;
    }
    const months = monthsToSync(sync.initialSyncDone);
    await syncWithRetry(fileStore(cfg), localBoard, months, new Date().toISOString());
    months.forEach((m) => extraMonths.delete(m)); // 이번에 불러온 지난 달은 다시 요청하지 않는다
    useBoardStore.getState().clearDirty(revAtStart);
    useSyncStore.getState().markSynced();
    // 동기화하는 사이에 새 변경이 생겼다면 아직 저장 대기 상태다. (변경 시 이미 재동기화가 예약돼 있다)
    if (useBoardStore.getState().rev !== revAtStart) useSyncStore.getState().setStatus('pending');
  } catch (e) {
    const { status, message } = describeError(e);
    useSyncStore.getState().setStatus(status, message);
  } finally {
    running = false;
    if (again) {
      again = false;
      requestSync(500);
    }
  }
}

/** 잠시 뒤 동기화하도록 예약한다. (연달아 호출하면 마지막 호출 기준으로 한 번만 실행) */
export function requestSync(delayMs = DEBOUNCE_MS): void {
  const { config, status, setStatus } = useSyncStore.getState();
  if (!config) return;
  if (status !== 'syncing') setStatus('pending');
  window.clearTimeout(timer);
  timer = window.setTimeout(() => void runSync(), delayMs);
}

/**
 * 기록 화면에서 쓸 지난 달 기록을 GitHub에서 받아오도록 요청한다. (연결돼 있을 때만)
 * 이 기기에 없는 지난 기록(예: 새로 연결한 폰)을 채우는 용도다. 받은 기록은 이 기기에 저장된다.
 */
export function requestHistory(months: string[]): void {
  if (!useSyncStore.getState().config) return;
  months.forEach((m) => extraMonths.add(m));
  void runSync();
}

/** 앱이 열려 있는 동안 동기화를 자동으로 돌린다. 반환값은 정리 함수. */
export function startSync(): () => void {
  const unsubscribe = useBoardStore.subscribe((s, prev) => {
    if (applyingRemote) return;
    if (s.list !== prev.list || s.logs !== prev.logs) requestSync();
  });
  const onVisible = () => document.visibilityState === 'visible' && void runSync();
  const onOnline = () => void runSync();
  document.addEventListener('visibilitychange', onVisible);
  window.addEventListener('online', onOnline);
  const poll = window.setInterval(() => void runSync(), POLL_MS);
  void runSync();

  return () => {
    unsubscribe();
    document.removeEventListener('visibilitychange', onVisible);
    window.removeEventListener('online', onOnline);
    window.clearInterval(poll);
    window.clearTimeout(timer);
  };
}

/** 연결 정보를 저장하기 전에 확인한다. 실패하면 사용자용 문구와 함께 예외를 던진다. */
export async function testConnection(cfg: GithubConfig): Promise<void> {
  try {
    const { canPush } = await verifyAccess(cfg);
    if (!canPush) throw new GithubError(403, '쓰기 권한이 없어요');
  } catch (e) {
    throw new Error(describeError(e).message);
  }
}

/** 연결 정보를 바꾼 뒤 확인 상태를 초기화한다. */
export function resetVerified(): void {
  verifiedFor = '';
}
