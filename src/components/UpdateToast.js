import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from 'react';
import { registerSW } from 'virtual:pwa-register';
import styles from './UpdateToast.module.css';
const HOUR = 60 * 60 * 1000;
/** 서비스 워커를 등록하고, 새 버전이 준비되면 알림을 띄운다. 사용자가 "새로고침"을 눌러야 교체된다. */
export default function UpdateToast() {
    const [needRefresh, setNeedRefresh] = useState(false);
    const [offlineReady, setOfflineReady] = useState(false);
    const [update, setUpdate] = useState(null);
    useEffect(() => {
        let timer;
        const updateSW = registerSW({
            onNeedRefresh: () => setNeedRefresh(true),
            onOfflineReady: () => setOfflineReady(true),
            onRegisteredSW: (_url, reg) => {
                if (!reg)
                    return;
                // 앱을 오래 켜 둬도 새 버전을 알아챌 수 있게 1시간마다, 그리고 탭에 돌아올 때 확인한다.
                timer = window.setInterval(() => void reg.update(), HOUR);
                document.addEventListener('visibilitychange', () => {
                    if (document.visibilityState === 'visible')
                        void reg.update();
                });
            },
        });
        setUpdate(() => () => updateSW(true));
        return () => window.clearInterval(timer);
    }, []);
    // "오프라인에서도 쓸 수 있어요" 안내는 몇 초 뒤 사라진다.
    useEffect(() => {
        if (!offlineReady)
            return;
        const id = window.setTimeout(() => setOfflineReady(false), 5000);
        return () => window.clearTimeout(id);
    }, [offlineReady]);
    if (needRefresh) {
        return (_jsxs("div", { className: styles.toast, role: "status", children: [_jsx("span", { children: "\uC0C8 \uBC84\uC804\uC774 \uC788\uC5B4\uC694." }), _jsx("button", { type: "button", className: styles.action, onClick: () => void update?.(), children: "\uC0C8\uB85C\uACE0\uCE68" }), _jsx("button", { type: "button", className: styles.dismiss, onClick: () => setNeedRefresh(false), "aria-label": "\uB098\uC911\uC5D0", children: "\u2715" })] }));
    }
    if (offlineReady) {
        return (_jsx("div", { className: styles.toast, role: "status", children: _jsx("span", { children: "\uC774\uC81C \uC624\uD504\uB77C\uC778\uC5D0\uC11C\uB3C4 \uC4F8 \uC218 \uC788\uC5B4\uC694 \u2713" }) }));
    }
    return null;
}
