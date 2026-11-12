import type { BoardList } from './types';

/**
 * 처음 열었을 때의 빈 목록. 실제 목록은 Private 저장소(data/list.json)에서 불러오거나 직접 추가한다.
 * updatedAt이 가장 오래된 값이라서, 연결하면 저장소의 목록이 항상 이긴다. (mergeList 참고)
 */
export const EMPTY_LIST: BoardList = {
  version: 1,
  updatedAt: '1970-01-01T00:00:00.000Z',
  categories: [],
};
