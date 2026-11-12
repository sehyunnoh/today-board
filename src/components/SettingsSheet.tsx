import { useEffect, useState, type FormEvent } from 'react';
import { formatAgo } from '../domain/cache';
import { useDialogFocus } from '../hooks/useDialogFocus';
import { resetVerified, runSync, testConnection } from '../services/sync';
import { DEFAULT_OWNER, DEFAULT_REPO, useSyncStore } from '../store/useSyncStore';
import sheet from './EditSheet.module.css';
import styles from './SettingsSheet.module.css';

interface Props {
  open: boolean;
  onClose: () => void;
}

export default function SettingsSheet({ open, onClose }: Props) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;
  return <SettingsForm onClose={onClose} />;
}

function SettingsForm({ onClose }: { onClose: () => void }) {
  const dialogRef = useDialogFocus<HTMLDivElement>();
  const { config, status, error, lastSyncedAt, setConfig } = useSyncStore();
  const [owner, setOwner] = useState(config?.owner ?? DEFAULT_OWNER);
  const [repo, setRepo] = useState(config?.repo ?? DEFAULT_REPO);
  const [token, setToken] = useState('');
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<{ kind: 'ok' | 'err'; text: string } | null>(null);

  const connected = config !== null;
  // 이미 연결돼 있으면 토큰을 비워 둬도 기존 토큰을 유지한다. (저장된 토큰은 화면에 다시 보여주지 않는다)
  const effectiveToken = token.trim() || config?.token || '';
  const canSave = owner.trim() !== '' && repo.trim() !== '' && effectiveToken !== '' && !busy;

  const save = async (e: FormEvent) => {
    e.preventDefault();
    if (!canSave) return;
    const next = { owner: owner.trim(), repo: repo.trim(), token: effectiveToken };
    setBusy(true);
    setMessage(null);
    try {
      await testConnection(next);
      resetVerified();
      setConfig(next);
      setToken('');
      setMessage({ kind: 'ok', text: '연결됐어요. 지금 동기화를 시작해요.' });
      void runSync();
    } catch (err) {
      setMessage({ kind: 'err', text: err instanceof Error ? err.message : '연결하지 못했어요' });
    } finally {
      setBusy(false);
    }
  };

  const disconnect = () => {
    setConfig(null);
    resetVerified();
    setToken('');
    setMessage({ kind: 'ok', text: '연결을 해제했어요. 이 기기의 데이터는 그대로 남아 있어요.' });
  };

  return (
    <div className={sheet.scrim} onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div ref={dialogRef} className={`${sheet.sheet} ${styles.scroll}`} role="dialog" aria-modal="true" aria-label="동기화 설정">
      <form onSubmit={save}>
        <h2 className={sheet.title}>GitHub 동기화</h2>
        <p className={styles.help}>
          체크와 목록을 <b>Private 저장소</b>에 저장해서 폰과 PC가 같은 내용을 보게 해요. 토큰은 <b>이 기기의 브라우저에만</b> 저장되고,
          앱 코드나 저장소에는 올라가지 않아요. 기기마다 한 번씩 입력해 주세요.
        </p>

        <details className={styles.install}>
          <summary>📱 홈 화면에 앱처럼 추가하기</summary>
          <p><b>아이폰(Safari)</b>: 공유 버튼 → &quot;홈 화면에 추가&quot;</p>
          <p><b>안드로이드(Chrome)</b>: 오른쪽 위 ⋮ 메뉴 → &quot;앱 설치&quot; 또는 &quot;홈 화면에 추가&quot;</p>
          <p>추가하면 주소창 없이 열리고, 인터넷이 없어도 화면이 떠요.</p>
        </details>

        {connected && (
          <p className={`${styles.state} ${status === 'error' ? styles.err : ''}`} role="status">
            {status === 'error' || status === 'offline'
              ? error
              : status === 'synced'
                ? `연결됨 · ${lastSyncedAt ? formatAgo(lastSyncedAt) : ''} 동기화`
                : '연결됨'}
          </p>
        )}

        <label className={sheet.label} htmlFor="gh-owner">저장소 소유자</label>
        <input id="gh-owner" className={sheet.input} value={owner} onChange={(e) => setOwner(e.target.value)} autoCapitalize="none" autoCorrect="off" spellCheck={false} />

        <label className={sheet.label} htmlFor="gh-repo">저장소 이름</label>
        <input id="gh-repo" className={sheet.input} value={repo} onChange={(e) => setRepo(e.target.value)} autoCapitalize="none" autoCorrect="off" spellCheck={false} />

        <label className={sheet.label} htmlFor="gh-token">Personal Access Token</label>
        <input
          id="gh-token"
          className={sheet.input}
          type="password"
          value={token}
          onChange={(e) => setToken(e.target.value)}
          placeholder={connected ? '저장됨 (바꾸려면 새 토큰 입력)' : 'github_pat_...'}
          autoComplete="off"
          autoCapitalize="none"
          autoCorrect="off"
          spellCheck={false}
        />
        <p className={styles.hint}>
          Fine-grained 토큰, 저장소는 데이터 저장소 하나만, 권한은 <b>Contents: Read and write</b>만 주세요.
        </p>

        {message && (
          <p className={`${styles.state} ${message.kind === 'err' ? styles.err : ''}`} role="alert">
            {message.text}
          </p>
        )}

        <div className={sheet.btns}>
          <button type="button" className={sheet.btn} onClick={onClose}>닫기</button>
          <button type="submit" className={`${sheet.btn} ${sheet.pri}`} disabled={!canSave}>
            {busy ? '확인 중…' : connected ? '다시 연결' : '연결 테스트 후 저장'}
          </button>
        </div>
        {connected && (
          <div className={styles.sub}>
            <button type="button" className={styles.link} onClick={() => void runSync()}>지금 동기화</button>
            <button type="button" className={`${styles.link} ${styles.danger}`} onClick={disconnect}>연결 해제</button>
          </div>
        )}
      </form>
      </div>
    </div>
  );
}
