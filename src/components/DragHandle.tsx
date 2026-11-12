import type { ComponentProps } from 'react';
import styles from './DragHandle.module.css';

/** 드래그로 순서를 바꾸는 손잡이. dnd-kit의 attributes/listeners를 그대로 받는다. */
export default function DragHandle(props: ComponentProps<'button'>) {
  return (
    <button type="button" className={styles.handle} aria-label="끌어서 순서 변경" {...props}>
      ⠿
    </button>
  );
}
