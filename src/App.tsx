import { useCallback, useEffect, useState } from 'react';
import SettingsSheet from './components/SettingsSheet';
import TabBar, { type Tab } from './components/TabBar';
import UpdateToast from './components/UpdateToast';
import { useDayRollover } from './hooks/useDayRollover';
import HistoryPage from './pages/HistoryPage';
import TodayPage from './pages/TodayPage';
import { startSync } from './services/sync';

export default function App() {
  const [tab, setTab] = useState<Tab>('today');
  const [settingsOpen, setSettingsOpen] = useState(false);
  const openSettings = useCallback(() => setSettingsOpen(true), []);
  const closeSettings = useCallback(() => setSettingsOpen(false), []);

  useDayRollover(); // 어느 화면에 있어도 자정이 지나면 새 날로 바뀐다
  useEffect(() => startSync(), []);

  // 화면(탭)에 맞게 문서 제목을 바꾼다. 스크린리더와 브라우저 탭에서 어디인지 알 수 있다.
  useEffect(() => {
    document.title = tab === 'history' ? '기록 · Today Board' : 'Today Board';
  }, [tab]);

  return (
    <>
      {tab === 'today' ? <TodayPage onOpenSettings={openSettings} /> : <HistoryPage />}
      <TabBar tab={tab} onTab={setTab} onSettings={openSettings} />
      <SettingsSheet open={settingsOpen} onClose={closeSettings} />
      <UpdateToast />
    </>
  );
}
