/** 끌어서 순서를 바꿀 때 스크린리더가 읽어 주는 안내를 한국어로 바꾼다. */
const announcements = {
    onDragStart: () => '항목을 집었어요. 위아래 화살표로 옮기고 스페이스로 놓아요.',
    onDragOver: ({ over }) => (over ? '다른 항목 위치로 옮겼어요.' : undefined),
    onDragEnd: ({ over }) => (over ? '순서를 바꿨어요.' : '제자리에 놓았어요.'),
    onDragCancel: () => '순서 변경을 취소했어요.',
};
const screenReaderInstructions = {
    draggable: '스페이스 또는 엔터로 집은 뒤, 위아래 화살표로 옮기고 스페이스로 놓아요. Esc로 취소해요.',
};
export const koDndAccessibility = { announcements, screenReaderInstructions };
