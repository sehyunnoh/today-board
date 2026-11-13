import { mergeLogs, stableStringify } from '../domain/merge';
import { isConflict } from './github';
/**
 * 동기화 핵심 로직. 저장소(FileStore)와 앱 상태(LocalBoard)를 주입받아서
 * 실제 GitHub나 화면 없이도 두 기기의 동기화를 테스트할 수 있다.
 */
export const LIST_PATH = 'data/list.json';
export const logPath = (month) => `data/logs/${month}.json`;
/** 'YYYY-MM-DD' → 'YYYY-MM' */
export const monthOf = (date) => date.slice(0, 7);
export function parseList(text) {
    const j = JSON.parse(text);
    if (j?.version !== 1 || !Array.isArray(j.categories) || typeof j.updatedAt !== 'string') {
        throw new Error('data/list.json 형식이 올바르지 않아요');
    }
    return j;
}
export function parseLogs(text) {
    const j = JSON.parse(text);
    if (j?.version !== 1 || !j.days || typeof j.days !== 'object') {
        throw new Error('월별 기록 파일 형식이 올바르지 않아요');
    }
    return j.days;
}
const toJson = (v) => `${JSON.stringify(v, null, 2)}\n`;
const pickMonth = (logs, month) => Object.fromEntries(Object.entries(logs).filter(([date]) => monthOf(date) === month));
/** 원격을 읽어 로컬과 합치고, 원격과 달라졌으면 저장한다. 한 번 실행. */
export async function syncOnce(files, board, months, stamp) {
    // 1. 목록
    const listFile = await files.get(LIST_PATH);
    const remoteList = listFile ? parseList(listFile.text) : null;
    if (remoteList)
        board.mergeList(remoteList);
    const list = board.getList();
    // 아직 목록이 하나도 없는 기기가 빈 목록을 저장소에 올리지 않는다. (저장소에 목록이 없을 때만 해당)
    const nothingToUpload = !remoteList && list.categories.length === 0;
    if (!nothingToUpload && (!remoteList || stableStringify(list) !== stableStringify(remoteList))) {
        await files.put(LIST_PATH, toJson(list), listFile?.sha ?? null, `sync: list ${stamp}`);
    }
    // 2. 월별 기록
    for (const month of months) {
        const file = await files.get(logPath(month));
        const remoteDays = file ? parseLogs(file.text) : {};
        board.mergeLogs(remoteDays);
        const merged = mergeLogs(board.getList(), {}, pickMonth(board.getLogs(), month));
        if (Object.keys(merged).length > 0 && stableStringify(merged) !== stableStringify(remoteDays)) {
            await files.put(logPath(month), toJson({ version: 1, days: merged }), file?.sha ?? null, `sync: ${month} ${stamp}`);
        }
    }
}
/** 충돌(두 기기가 동시에 수정)이면 다시 읽어서 합친 뒤 재시도한다. */
export async function syncWithRetry(files, board, months, stamp, maxAttempts = 4) {
    let lastError;
    for (let attempt = 0; attempt < maxAttempts; attempt++) {
        try {
            await syncOnce(files, board, months, stamp);
            return;
        }
        catch (e) {
            if (!isConflict(e))
                throw e;
            lastError = e;
        }
    }
    throw lastError;
}
