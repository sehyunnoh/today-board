export interface GithubConfig {
  owner: string;
  repo: string;
  token: string;
}

/** GitHub API가 오류 응답을 준 경우. 토큰은 메시지에 절대 넣지 않는다. */
export class GithubError extends Error {
  constructor(
    public readonly status: number,
    message: string,
  ) {
    super(message);
    this.name = 'GithubError';
  }
}

/** 저장소가 공개라서 데이터를 올리면 안 되는 경우 */
export class PublicRepoError extends Error {
  constructor() {
    super('공개(Public) 저장소라서 동기화하지 않아요. 데이터 저장소는 Private이어야 해요.');
    this.name = 'PublicRepoError';
  }
}

/** 두 기기가 동시에 고쳐서 파일의 sha가 어긋난 경우 */
export const isConflict = (e: unknown): boolean => e instanceof GithubError && (e.status === 409 || e.status === 422);

export function b64encode(text: string): string {
  const bytes = new TextEncoder().encode(text);
  let bin = '';
  for (const b of bytes) bin += String.fromCharCode(b);
  return btoa(bin);
}

export function b64decode(b64: string): string {
  const bin = atob(b64.replaceAll('\n', ''));
  return new TextDecoder().decode(Uint8Array.from(bin, (c) => c.charCodeAt(0)));
}

const encodePath = (path: string) => path.split('/').map(encodeURIComponent).join('/');

async function api(cfg: GithubConfig, method: 'GET' | 'PUT', path: string, body?: unknown): Promise<Response> {
  return fetch(`https://api.github.com/repos/${encodeURIComponent(cfg.owner)}/${encodeURIComponent(cfg.repo)}${path}`, {
    method,
    headers: {
      Authorization: `Bearer ${cfg.token}`,
      Accept: 'application/vnd.github+json',
      'X-GitHub-Api-Version': '2022-11-28',
      ...(body ? { 'Content-Type': 'application/json' } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
    cache: 'no-store',
    signal: AbortSignal.timeout(15_000),
  });
}

async function fail(res: Response): Promise<never> {
  let detail = '';
  try {
    detail = ((await res.json()) as { message?: string }).message ?? '';
  } catch {
    /* 본문이 JSON이 아니어도 상태 코드만으로 충분하다 */
  }
  throw new GithubError(res.status, detail || `GitHub 요청 실패 (${res.status})`);
}

/** 저장소 접근 확인. 토큰/저장소 이름이 틀렸거나 Public이면 예외를 던진다. */
export async function verifyAccess(cfg: GithubConfig): Promise<{ canPush: boolean }> {
  const res = await api(cfg, 'GET', '');
  if (!res.ok) return fail(res);
  const data = (await res.json()) as { private?: boolean; permissions?: { push?: boolean } };
  if (data.private === false) throw new PublicRepoError();
  return { canPush: data.permissions?.push !== false };
}

/** 파일 읽기. 없으면 null. */
export async function getFile(cfg: GithubConfig, path: string): Promise<{ text: string; sha: string } | null> {
  const res = await api(cfg, 'GET', `/contents/${encodePath(path)}`);
  if (res.status === 404) return null;
  if (!res.ok) return fail(res);
  const data = (await res.json()) as { content?: string; sha?: string };
  if (typeof data.content !== 'string' || typeof data.sha !== 'string') {
    throw new GithubError(500, `${path}는 파일이 아니에요`);
  }
  return { text: b64decode(data.content), sha: data.sha };
}

/** 파일 쓰기(커밋). 기존 파일이면 sha가 필요하고, 어긋나면 충돌(409/422)이다. */
export async function putFile(
  cfg: GithubConfig,
  path: string,
  text: string,
  sha: string | null,
  message: string,
): Promise<void> {
  const res = await api(cfg, 'PUT', `/contents/${encodePath(path)}`, {
    message,
    content: b64encode(text),
    ...(sha ? { sha } : {}),
  });
  if (!res.ok) return fail(res);
}
