import { Fragment as _Fragment, jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { LOCATION } from '../config';
import { weekdayKo } from '../domain/date';
import { weatherInfo } from '../domain/weather';
import StatusLine from './StatusLine';
import styles from './InfoCard.module.css';
const deg = (n) => `${Math.round(n)}°`;
export default function WeatherCard({ resource }) {
    const { data, status, fetchedAt, refresh } = resource;
    const [open, setOpen] = useState(false);
    if (!data) {
        return (_jsxs("section", { className: `${styles.card} ${styles.weather}`, children: [_jsxs("small", { className: styles.label, children: ["\uD83C\uDF24 ", LOCATION.name] }), status === 'loading' ? (_jsx("p", { className: styles.status, children: "\uB0A0\uC528\uB97C \uBD88\uB7EC\uC624\uB294 \uC911\u2026" })) : (_jsxs(_Fragment, { children: [_jsx("p", { className: styles.sub, children: "\uB0A0\uC528\uB97C \uBD88\uB7EC\uC624\uC9C0 \uBABB\uD588\uC5B4\uC694." }), _jsx("button", { type: "button", className: styles.retry, onClick: () => void refresh(), children: "\uB2E4\uC2DC \uC2DC\uB3C4" })] }))] }));
    }
    const info = weatherInfo(data.code, data.isDay);
    return (_jsxs("section", { className: `${styles.card} ${styles.weather} ${open ? styles.open : ''}`, "aria-label": "\uB0A0\uC528", children: [_jsxs("small", { className: styles.label, children: [info.icon, " ", LOCATION.name] }), _jsxs("b", { className: styles.big, children: [deg(data.temp), "C"] }), _jsxs("em", { className: styles.sub, children: [info.label, " \u00B7 \uCCB4\uAC10 ", deg(data.feelsLike), "C"] }), _jsxs("div", { className: styles.details, children: [_jsxs("p", { className: styles.sub, children: ["\uC2B5\uB3C4 ", Math.round(data.humidity), "%"] }), _jsx("ul", { className: styles.forecast, children: data.daily.map((d, i) => {
                            const f = weatherInfo(d.code);
                            return (_jsxs("li", { children: [_jsx("span", { children: i === 0 ? '오늘' : i === 1 ? '내일' : weekdayKo(d.date) }), _jsx("b", { "aria-label": f.label, children: f.icon }), _jsxs("span", { children: [deg(d.max), " ", _jsx("i", { children: deg(d.min) })] })] }, d.date));
                        }) })] }), _jsx("button", { type: "button", className: styles.more, "aria-expanded": open, onClick: () => setOpen((o) => !o), children: open ? '접기 ▴' : '예보 ▾' }), _jsx(StatusLine, { status: status, fetchedAt: fetchedAt, onRetry: () => void refresh() })] }));
}
