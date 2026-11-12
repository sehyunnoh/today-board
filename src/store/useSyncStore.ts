import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { GithubConfig } from '../services/github';

/** off: 연결 안 됨 / synced: 동기화됨 / pending: 저장 대기 / syncing: 저장 중 / offline: 오프라인 / error: 오류 */
export type SyncStatus = 'off' | 'synced' | 'pending' | 'syncing' | 'offline' | 'error';

interface SyncState {
  /** 이 기기에만 저장되는 연결 정보. 토큰은 코드나 저장소에 넣지 않는다. */
  config: GithubConfig | null;
  /** 이 연결로 처음 한 번 전체(모든 달) 동기화를 마쳤는지 */
  initialSyncDone: boolean;
  status: SyncStatus;
  lastSyncedAt: number | null;
  error: string | null;

  setConfig: (config: GithubConfig | null) => void;
  setStatus: (status: SyncStatus, error?: string | null) => void;
  markSynced: () => void;
}

export const DEFAULT_OWNER = 'sehyunnoh';
export const DEFAULT_REPO = 'today-board-data';

export const useSyncStore = create<SyncState>()(
  persist(
    (set) => ({
      config: null,
      initialSyncDone: false,
      status: 'off',
      lastSyncedAt: null,
      error: null,

      setConfig: (config) =>
        set({ config, initialSyncDone: false, status: config ? 'pending' : 'off', error: null }),
      setStatus: (status, error = null) => set({ status, error }),
      markSynced: () => set({ status: 'synced', error: null, lastSyncedAt: Date.now(), initialSyncDone: true }),
    }),
    {
      name: 'today-board:sync',
      partialize: (s) => ({ config: s.config, initialSyncDone: s.initialSyncDone }),
      // 앱을 다시 열었을 때 연결 정보가 있으면 '대기' 상태로 시작한다.
      onRehydrateStorage: () => (state) => {
        if (state?.config) state.status = 'pending';
      },
    },
  ),
);
