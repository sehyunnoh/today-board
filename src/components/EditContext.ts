import { createContext } from 'react';
import type { Category, Item } from '../domain/types';

/** 편집 모드 상태와 동작을 트리 깊숙한 컴포넌트까지 전달한다. */
export interface EditApi {
  editing: boolean;
  editCategory: (category: Category) => void;
  deleteCategory: (category: Category) => void;
  addItem: (categoryId: string, parentId: string | null, parentName?: string) => void;
  editItem: (item: Item) => void;
  deleteItem: (item: Item) => void;
}

const noop = () => {};

export const EditContext = createContext<EditApi>({
  editing: false,
  editCategory: noop,
  deleteCategory: noop,
  addItem: noop,
  editItem: noop,
  deleteItem: noop,
});
