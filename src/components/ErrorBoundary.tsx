import { Component, type ErrorInfo, type ReactNode } from 'react';
import styles from './ErrorBoundary.module.css';

interface State {
  failed: boolean;
}

/** 화면을 그리다 예기치 못한 오류가 나도 빈 화면 대신 안내를 보여준다. 데이터는 건드리지 않는다. */
export default class ErrorBoundary extends Component<{ children: ReactNode }, State> {
  state: State = { failed: false };

  static getDerivedStateFromError(): State {
    return { failed: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('화면 오류', error, info.componentStack);
  }

  render() {
    if (!this.state.failed) return this.props.children;
    return (
      <main className={styles.wrap} role="alert">
        <h1>앗, 문제가 생겼어요</h1>
        <p>화면을 불러오는 중에 오류가 났어요. 체크한 내용은 이 기기에 그대로 저장돼 있어요.</p>
        <button type="button" onClick={() => location.reload()}>
          새로고침
        </button>
      </main>
    );
  }
}
