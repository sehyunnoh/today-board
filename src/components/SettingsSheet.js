import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from 'react';
import { formatAgo } from '../domain/cache';
import { useDialogFocus } from '../hooks/useDialogFocus';
import { resetVerified, runSync, testConnection } from '../services/sync';
import { DEFAULT_OWNER, DEFAULT_REPO, useSyncStore } from '../store/useSyncStore';
import sheet from './EditSheet.module.css';
import styles from './SettingsSheet.module.css';
export default function SettingsSheet({ open, onClose }) {
    useEffect(() => {
        if (!open)
            return;
        const onKey = (e) => e.key === 'Escape' && onClose();
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, [open, onClose]);
    if (!open)
        return null;
    return _jsx(SettingsForm, { onClose: onClose });
}
function SettingsForm({ onClose }) {
    const dialogRef = useDialogFocus();
    const { config, status, error, lastSyncedAt, setConfig } = useSyncStore();
    const [owner, setOwner] = useState(config?.owner ?? DEFAULT_OWNER);
    const [repo, setRepo] = useState(config?.repo ?? DEFAULT_REPO);
    const [token, setToken] = useState('');
    const [busy, setBusy] = useState(false);
    const [message, setMessage] = useState(null);
    const connected = config !== null;
    // 이미 연결돼 있으면 토큰을 비워 둬도 기존 토큰을 유지한다. (저장된 토큰은 화면에 다시 보여주지 않는다)
    const effectiveToken = token.trim() || config?.token || '';
    const canSave = owner.trim() !== '' && repo.trim() !== '' && effectiveToken !== '' && !busy;
    const save = async (e) => {
        e.preventDefault();
        if (!canSave)
            return;
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
        }
        catch (err) {
            setMessage({ kind: 'err', text: err instanceof Error ? err.message : '연결하지 못했어요' });
        }
        finally {
            setBusy(false);
        }
    };
    const disconnect = () => {
        setConfig(null);
        resetVerified();
        setToken('');
        setMessage({ kind: 'ok', text: '연결을 해제했어요. 이 기기의 데이터는 그대로 남아 있어요.' });
    };
    return (_jsx("div", { className: sheet.scrim, onMouseDown: (e) => e.target === e.currentTarget && onClose(), children: _jsx("div", { ref: dialogRef, className: `${sheet.sheet} ${styles.scroll}`, role: "dialog", "aria-modal": "true", "aria-label": "\uB3D9\uAE30\uD654 \uC124\uC815", children: _jsxs("form", { onSubmit: save, children: [_jsx("h2", { className: sheet.title, children: "GitHub \uB3D9\uAE30\uD654" }), _jsxs("p", { className: styles.help, children: ["\uCCB4\uD06C\uC640 \uBAA9\uB85D\uC744 ", _jsx("b", { children: "Private \uC800\uC7A5\uC18C" }), "\uC5D0 \uC800\uC7A5\uD574\uC11C \uD3F0\uACFC PC\uAC00 \uAC19\uC740 \uB0B4\uC6A9\uC744 \uBCF4\uAC8C \uD574\uC694. \uD1A0\uD070\uC740 ", _jsx("b", { children: "\uC774 \uAE30\uAE30\uC758 \uBE0C\uB77C\uC6B0\uC800\uC5D0\uB9CC" }), " \uC800\uC7A5\uB418\uACE0, \uC571 \uCF54\uB4DC\uB098 \uC800\uC7A5\uC18C\uC5D0\uB294 \uC62C\uB77C\uAC00\uC9C0 \uC54A\uC544\uC694. \uAE30\uAE30\uB9C8\uB2E4 \uD55C \uBC88\uC529 \uC785\uB825\uD574 \uC8FC\uC138\uC694."] }), _jsxs("details", { className: styles.install, children: [_jsx("summary", { children: "\uD83D\uDCF1 \uD648 \uD654\uBA74\uC5D0 \uC571\uCC98\uB7FC \uCD94\uAC00\uD558\uAE30" }), _jsxs("p", { children: [_jsx("b", { children: "\uC544\uC774\uD3F0(Safari)" }), ": \uACF5\uC720 \uBC84\uD2BC \u2192 \"\uD648 \uD654\uBA74\uC5D0 \uCD94\uAC00\""] }), _jsxs("p", { children: [_jsx("b", { children: "\uC548\uB4DC\uB85C\uC774\uB4DC(Chrome)" }), ": \uC624\uB978\uCABD \uC704 \u22EE \uBA54\uB274 \u2192 \"\uC571 \uC124\uCE58\" \uB610\uB294 \"\uD648 \uD654\uBA74\uC5D0 \uCD94\uAC00\""] }), _jsx("p", { children: "\uCD94\uAC00\uD558\uBA74 \uC8FC\uC18C\uCC3D \uC5C6\uC774 \uC5F4\uB9AC\uACE0, \uC778\uD130\uB137\uC774 \uC5C6\uC5B4\uB3C4 \uD654\uBA74\uC774 \uB5A0\uC694." })] }), connected && (_jsx("p", { className: `${styles.state} ${status === 'error' ? styles.err : ''}`, role: "status", children: status === 'error' || status === 'offline'
                            ? error
                            : status === 'synced'
                                ? `연결됨 · ${lastSyncedAt ? formatAgo(lastSyncedAt) : ''} 동기화`
                                : '연결됨' })), _jsx("label", { className: sheet.label, htmlFor: "gh-owner", children: "\uC800\uC7A5\uC18C \uC18C\uC720\uC790" }), _jsx("input", { id: "gh-owner", className: sheet.input, value: owner, onChange: (e) => setOwner(e.target.value), autoCapitalize: "none", autoCorrect: "off", spellCheck: false }), _jsx("label", { className: sheet.label, htmlFor: "gh-repo", children: "\uC800\uC7A5\uC18C \uC774\uB984" }), _jsx("input", { id: "gh-repo", className: sheet.input, value: repo, onChange: (e) => setRepo(e.target.value), autoCapitalize: "none", autoCorrect: "off", spellCheck: false }), _jsx("label", { className: sheet.label, htmlFor: "gh-token", children: "Personal Access Token" }), _jsx("input", { id: "gh-token", className: sheet.input, type: "password", value: token, onChange: (e) => setToken(e.target.value), placeholder: connected ? '저장됨 (바꾸려면 새 토큰 입력)' : 'github_pat_...', autoComplete: "off", autoCapitalize: "none", autoCorrect: "off", spellCheck: false }), _jsxs("p", { className: styles.hint, children: ["Fine-grained \uD1A0\uD070, \uC800\uC7A5\uC18C\uB294 \uB370\uC774\uD130 \uC800\uC7A5\uC18C \uD558\uB098\uB9CC, \uAD8C\uD55C\uC740 ", _jsx("b", { children: "Contents: Read and write" }), "\uB9CC \uC8FC\uC138\uC694."] }), message && (_jsx("p", { className: `${styles.state} ${message.kind === 'err' ? styles.err : ''}`, role: "alert", children: message.text })), _jsxs("div", { className: sheet.btns, children: [_jsx("button", { type: "button", className: sheet.btn, onClick: onClose, children: "\uB2EB\uAE30" }), _jsx("button", { type: "submit", className: `${sheet.btn} ${sheet.pri}`, disabled: !canSave, children: busy ? '확인 중…' : connected ? '다시 연결' : '연결 테스트 후 저장' })] }), connected && (_jsxs("div", { className: styles.sub, children: [_jsx("button", { type: "button", className: styles.link, onClick: () => void runSync(), children: "\uC9C0\uAE08 \uB3D9\uAE30\uD654" }), _jsx("button", { type: "button", className: `${styles.link} ${styles.danger}`, onClick: disconnect, children: "\uC5F0\uACB0 \uD574\uC81C" })] }))] }) }) }));
}
