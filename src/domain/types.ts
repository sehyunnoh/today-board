export interface Item {
  id: string;
  name: string;
  archived?: boolean;
  children: Item[];
}

export interface Category {
  id: string;
  name: string;
  emoji: string;
  archived?: boolean;
  items: Item[];
}

export interface BoardList {
  version: 1;
  updatedAt: string;
  categories: Category[];
}

/** 하루치 체크 기록. doneCategories/total은 통계용 스냅샷이다. */
export interface DayLog {
  checked: string[];
  doneCategories: string[];
  total: number;
  /**
   * 항목 id → 마지막으로 체크/해제한 시각(epoch ms).
   * 두 기기의 기록을 합칠 때 항목마다 더 나중에 바뀐 쪽을 따른다. (해제도 전달된다)
   * 옛 기록에는 없을 수 있다.
   */
  marks?: Record<string, number>;
}
