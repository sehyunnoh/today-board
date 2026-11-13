import { parseFx } from '../domain/fx';
export async function fetchFx() {
    const res = await fetch('https://api.frankfurter.dev/v1/latest?base=CAD&symbols=KRW', {
        signal: AbortSignal.timeout(10_000),
    });
    if (!res.ok)
        throw new Error(`환율 요청 실패 (${res.status})`);
    return parseFx(await res.json());
}
