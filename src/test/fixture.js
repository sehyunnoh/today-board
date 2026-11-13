/**
 * 테스트 전용 가짜 목록. 실제 사용자 목록과 무관한 중립적인 이름만 쓴다.
 * 모양: 카테고리 9개, 첫 카테고리는 항목 9개, 마지막 카테고리는 하위 항목이 있는 중첩 구조.
 */
const leaf = (id, name) => ({ id, name, children: [] });
const cat = (id, name, emoji, count) => ({
    id,
    name,
    emoji,
    items: Array.from({ length: count }, (_, i) => leaf(`i_${id.slice(2)}${i + 1}`, `항목 ${name.slice(-1)}${i + 1}`)),
});
export const TEST_LIST = {
    version: 1,
    updatedAt: '2026-11-12T00:00:00-05:00',
    categories: [
        cat('c_a', '카테고리 A', '🅰️', 9),
        cat('c_b', '카테고리 B', '🅱️', 3),
        cat('c_c', '카테고리 C', '🌟', 5),
        cat('c_d', '카테고리 D', '🔷', 2),
        cat('c_e', '카테고리 E', '🔶', 2),
        cat('c_f', '카테고리 F', '🟢', 3),
        cat('c_g', '카테고리 G', '🟣', 6),
        cat('c_h', '카테고리 H', '🟠', 4),
        {
            id: 'c_i',
            name: '카테고리 I',
            emoji: '🔺',
            items: [
                {
                    id: 'i_i1',
                    name: '상위 항목',
                    children: [leaf('i_i1a', '하위 항목 가'), leaf('i_i1b', '하위 항목 나')],
                },
            ],
        },
    ],
};
