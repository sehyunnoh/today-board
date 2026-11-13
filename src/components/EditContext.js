import { createContext } from 'react';
const noop = () => { };
export const EditContext = createContext({
    editing: false,
    editCategory: noop,
    deleteCategory: noop,
    addItem: noop,
    editItem: noop,
    deleteItem: noop,
});
