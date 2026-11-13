import { jsx as _jsx } from "react/jsx-runtime";
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './styles/tokens.css';
import './styles/global.css';
import App from './App';
import ErrorBoundary from './components/ErrorBoundary';
createRoot(document.getElementById('root')).render(_jsx(StrictMode, { children: _jsx(ErrorBoundary, { children: _jsx(App, {}) }) }));
