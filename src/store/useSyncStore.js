import { create } from 'zustand';
import { persist } from 'zustand/middleware';
export const DEFAULT_OWNER = 'sehyunnoh';
export const DEFAULT_REPO = 'today-board-data';
export const useSyncStore = create()(persist((set) => ({
    config: null,
    initialSyncDone: false,
    status: 'off',
    lastSyncedAt: null,
    error: null,
    setConfig: (config) => set({ config, initialSyncDone: false, status: config ? 'pending' : 'off', error: null }),
    setStatus: (status, error = null) => set({ status, error }),
    markSynced: () => set({ status: 'synced', error: null, lastSyncedAt: Date.now(), initialSyncDone: true }),
}), {
    name: 'today-board:sync',
    partialize: (s) => ({ config: s.config, initialSyncDone: s.initialSyncDone }),
    // 앱을 다시 열었을 때 연결 정보가 있으면 '대기' 상태로 시작한다.
    onRehydrateStorage: () => (state) => {
        if (state?.config)
            state.status = 'pending';
    },
}));
