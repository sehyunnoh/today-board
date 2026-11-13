import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useMemo } from 'react';
import { shortLabel, weekdayKo } from '../domain/date';
import { GOOD_DAY_RATE, averageRate, categoryRates, heatmap, monthsBack, recentDays, streaks } from '../domain/stats';
import { requestHistory } from '../services/sync';
import { useBoardStore } from '../store/useBoardStore';
import { useSyncStore } from '../store/useSyncStore';
import styles from './HistoryPage.module.css';
const pct = (rate) => (rate === null ? '-' : `${Math.round(rate * 100)}%`);
export default function HistoryPage() {
    const list = useBoardStore((s) => s.list);
    const logs = useBoardStore((s) => s.logs);
    const today = useBoardStore((s) => s.today);
    const syncStatus = useSyncStore((s) => s.status);
    const connected = useSyncStore((s) => s.config !== null);
    // 이 기기에 없는 지난 기록이 GitHub에 있으면 받아온다. (최근 13주가 걸친 달)
    useEffect(() => requestHistory(monthsBack(today, 91)), [today]);
    const days = useMemo(() => recentDays(logs, today, 14), [logs, today]);
    const streak = useMemo(() => streaks(logs, today), [logs, today]);
    const cells = useMemo(() => heatmap(logs, today, 13), [logs, today]);
    const cats = useMemo(() => categoryRates(list, logs, today, 7), [list, logs, today]);
    const avg = averageRate(days, today);
    const empty = Object.keys(logs).length === 0;
    const past = cells.filter((c) => !c.future && c.rate !== null);
    const heatSummary = `최근 13주 중 기록한 날 ${past.filter((c) => (c.rate ?? 0) > 0).length}일, 달성한 날 ${past.filter((c) => (c.rate ?? 0) >= GOOD_DAY_RATE).length}일`;
    const monthLabels = Array.from({ length: 13 }, (_, c) => {
        const first = cells[c * 7].date;
        return Number(first.slice(8, 10)) <= 7 ? `${Number(first.slice(5, 7))}월` : '';
    });
    return (_jsxs("main", { className: styles.page, children: [_jsxs("header", { className: styles.head, children: [_jsx("h1", { className: styles.title, children: "\uB098\uC758 \uAFB8\uC900\uD568 \uD83C\uDF31" }), _jsxs("p", { className: styles.sub, children: ["\uD558\uB8E8 \uC644\uB8CC\uC728\uC774 ", Math.round(GOOD_DAY_RATE * 100), "% \uC774\uC0C1\uC774\uBA74 \"\uB2EC\uC131\uD55C \uB0A0\"\uB85C \uC138\uC694.", connected && syncStatus === 'syncing' && ' 지난 기록을 불러오는 중…'] })] }), empty && _jsx("p", { className: styles.empty, children: "\uC544\uC9C1 \uAE30\uB85D\uC774 \uC5C6\uC5B4\uC694. \uC624\uB298 \uCCAB \uCCB4\uD06C\uB97C \uD574 \uBCF4\uC138\uC694! \uCCB4\uD06C\uD55C \uB0A0\uBD80\uD130 \uC5EC\uAE30\uC5D0 \uC313\uC5EC\uC694." }), _jsxs("section", { className: styles.tiles, "aria-label": "\uC694\uC57D", children: [_jsxs("div", { className: styles.tile, children: [_jsx("span", { children: "\uD83D\uDD25 \uD604\uC7AC \uC5F0\uC18D" }), _jsxs("b", { children: [streak.current, "\uC77C"] })] }), _jsxs("div", { className: styles.tile, children: [_jsx("span", { children: "\uD83C\uDFC6 \uCD5C\uACE0 \uC5F0\uC18D" }), _jsxs("b", { children: [streak.best, "\uC77C"] })] }), _jsxs("div", { className: styles.tile, children: [_jsx("span", { children: "\uD83D\uDCC8 14\uC77C \uD3C9\uADE0" }), _jsx("b", { children: pct(avg) })] })] }), _jsxs("section", { className: `${styles.panel} ${styles.bars}`, "aria-label": "\uCD5C\uADFC 14\uC77C \uC644\uB8CC\uC728", children: [_jsx("h2", { children: "\uCD5C\uADFC 14\uC77C \uC644\uB8CC\uC728" }), _jsxs("div", { className: styles.chart, children: [_jsx("div", { className: styles.goal, style: { bottom: `${GOOD_DAY_RATE * 100}%` }, "aria-hidden": "true", children: _jsxs("span", { children: ["\uBAA9\uD45C ", Math.round(GOOD_DAY_RATE * 100), "%"] }) }), days.map((d) => {
                                const isToday = d.date === today;
                                const label = `${shortLabel(d.date)} (${weekdayKo(d.date)}) ${d.rate === null ? '기록 없음' : `${pct(d.rate)}${d.total ? ` · ${d.done}/${d.total}` : ''}`}`;
                                return (_jsxs("div", { className: styles.col, role: "img", "aria-label": label, title: label, children: [_jsx("div", { className: styles.track, children: d.rate === null ? (_jsx("i", { className: styles.none })) : (_jsx("i", { className: `${styles.bar} ${isToday ? styles.today : ''} ${d.rate >= GOOD_DAY_RATE ? styles.good : ''}`, style: { height: `${Math.max(d.rate * 100, 3)}%` } })) }), _jsx("span", { className: `${styles.day} ${isToday ? styles.dayToday : ''}`, children: Number(d.date.slice(8, 10)) })] }, d.date));
                            })] }), _jsx("p", { className: styles.note, children: "\uC9C4\uD55C \uB9C9\uB300\uB294 \uB2EC\uC131\uD55C \uB0A0, \uD14C\uB450\uB9AC \uB9C9\uB300\uB294 \uC624\uB298(\uC9C4\uD589 \uC911)\uC774\uC5D0\uC694." })] }), _jsxs("section", { className: `${styles.panel} ${styles.heat}`, "aria-label": "\uCD5C\uADFC 13\uC8FC \uB2EC\uB825", children: [_jsx("h2", { children: "\uCD5C\uADFC 13\uC8FC \uB2EC\uB825" }), _jsx("div", { className: styles.months, "aria-hidden": "true", children: monthLabels.map((m, i) => (_jsx("span", { children: m }, i))) }), _jsx("p", { className: styles.srOnly, children: heatSummary }), _jsx("div", { className: styles.grid, "aria-hidden": "true", children: cells.map((c) => {
                            const label = c.future ? '' : `${c.date} · ${c.rate === null ? '기록 없음' : `${pct(c.rate)}${c.total ? ` (${c.done}/${c.total})` : ''}`}`;
                            return _jsx("i", { className: `${styles.cell} ${styles[`l${c.level}`]}`, style: c.future ? { visibility: 'hidden' } : undefined, title: label }, c.date);
                        }) }), _jsxs("div", { className: styles.legend, "aria-hidden": "true", children: ["\uC801\uC74C", _jsx("i", { className: `${styles.cell} ${styles.l0}` }), _jsx("i", { className: `${styles.cell} ${styles.l1}` }), _jsx("i", { className: `${styles.cell} ${styles.l2}` }), _jsx("i", { className: `${styles.cell} ${styles.l3}` }), "\uB9CE\uC74C"] })] }), _jsxs("section", { className: `${styles.panel} ${styles.cats}`, "aria-label": "\uCE74\uD14C\uACE0\uB9AC\uBCC4 \uB2EC\uC131", children: [_jsx("h2", { children: "\uCE74\uD14C\uACE0\uB9AC\uBCC4 \uB2EC\uC131 (\uCD5C\uADFC 7\uC77C)" }), cats.map((c) => (_jsxs("div", { className: styles.catRow, children: [_jsxs("span", { className: styles.catName, children: [c.emoji, " ", c.name] }), _jsx("div", { className: styles.catTrack, role: "img", "aria-label": `${c.name} ${c.done}/${c.days}일`, children: _jsx("i", { style: { width: `${(c.rate ?? 0) * 100}%` } }) }), _jsxs("span", { className: styles.catNum, children: [c.done, "/", c.days, "\uC77C"] })] }, c.id)))] })] }));
}
