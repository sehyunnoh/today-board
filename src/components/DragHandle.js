import { jsx as _jsx } from "react/jsx-runtime";
import styles from './DragHandle.module.css';
/** 드래그로 순서를 바꾸는 손잡이. dnd-kit의 attributes/listeners를 그대로 받는다. */
export default function DragHandle(props) {
    return (_jsx("button", { type: "button", className: styles.handle, "aria-label": "\uB04C\uC5B4\uC11C \uC21C\uC11C \uBCC0\uACBD", ...props, children: "\u283F" }));
}
