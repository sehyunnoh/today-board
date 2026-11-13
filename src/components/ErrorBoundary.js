import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Component } from 'react';
import styles from './ErrorBoundary.module.css';
/** 화면을 그리다 예기치 못한 오류가 나도 빈 화면 대신 안내를 보여준다. 데이터는 건드리지 않는다. */
export default class ErrorBoundary extends Component {
    state = { failed: false };
    static getDerivedStateFromError() {
        return { failed: true };
    }
    componentDidCatch(error, info) {
        console.error('화면 오류', error, info.componentStack);
    }
    render() {
        if (!this.state.failed)
            return this.props.children;
        return (_jsxs("main", { className: styles.wrap, role: "alert", children: [_jsx("h1", { children: "\uC557, \uBB38\uC81C\uAC00 \uC0DD\uACBC\uC5B4\uC694" }), _jsx("p", { children: "\uD654\uBA74\uC744 \uBD88\uB7EC\uC624\uB294 \uC911\uC5D0 \uC624\uB958\uAC00 \uB0AC\uC5B4\uC694. \uCCB4\uD06C\uD55C \uB0B4\uC6A9\uC740 \uC774 \uAE30\uAE30\uC5D0 \uADF8\uB300\uB85C \uC800\uC7A5\uB3FC \uC788\uC5B4\uC694." }), _jsx("button", { type: "button", onClick: () => location.reload(), children: "\uC0C8\uB85C\uACE0\uCE68" })] }));
    }
}
