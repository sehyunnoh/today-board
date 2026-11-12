import styles from './TabBar.module.css';

export type Tab = 'today' | 'history';

interface Props {
  tab: Tab;
  onTab: (tab: Tab) => void;
  onSettings: () => void;
}

/** 화면 아래에 떠 있는 탭. 설정은 화면 이동 없이 설정 창을 연다. */
export default function TabBar({ tab, onTab, onSettings }: Props) {
  return (
    <nav className={styles.bar} aria-label="주 메뉴">
      <button type="button" className={tab === 'today' ? styles.on : ''} aria-current={tab === 'today' ? 'page' : undefined} onClick={() => onTab('today')}>
        오늘
      </button>
      <button type="button" className={tab === 'history' ? styles.on : ''} aria-current={tab === 'history' ? 'page' : undefined} onClick={() => onTab('history')}>
        기록
      </button>
      <button type="button" aria-haspopup="dialog" onClick={onSettings}>
        설정
      </button>
    </nav>
  );
}
