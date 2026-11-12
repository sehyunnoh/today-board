import { afterEach, describe, expect, it, vi } from 'vitest';
import { TEST_LIST } from '../test/fixture';
import { EMPTY_LIST } from '../domain/emptyList';
import { buildDayLog, toggleWithMark } from '../domain/log';
import { mergeList, mergeLogs } from '../domain/merge';
import type { BoardList, DayLog } from '../domain/types';
import { GithubError, PublicRepoError, b64decode, b64encode, getFile, putFile, verifyAccess } from './github';
import { LIST_PATH, logPath, syncWithRetry, type FileStore, type LocalBoard } from './syncCore';

/** 메모리 속 가짜 GitHub 저장소. sha가 어긋나면 실제처럼 409를 던진다. */
class FakeRepo implements FileStore {
  files = new Map<string, { text: string; sha: number }>();
  nextSha = 1;
  puts = 0;
  conflicts = 0;
  /** 저장 직전에 다른 기기가 먼저 저장한 것처럼 만드는 훅 (한 번만 실행) */
  beforePut?: () => Promise<void>;

  async get(path: string) {
    const f = this.files.get(path);
    return f ? { text: f.text, sha: String(f.sha) } : null;
  }
  async put(path: string, text: string, sha: string | null) {
    const hook = this.beforePut;
    this.beforePut = undefined;
    await hook?.();
    const cur = this.files.get(path);
    if ((cur && String(cur.sha) !== sha) || (!cur && sha)) {
      this.conflicts++;
      throw new GithubError(409, 'sha conflict');
    }
    this.files.set(path, { text, sha: this.nextSha++ });
    this.puts++;
  }
}

/** 한 기기의 앱 상태 */
class FakeDevice implements LocalBoard {
  list: BoardList = TEST_LIST;
  logs: Record<string, DayLog> = {};
  constructor(
    private repo: FakeRepo,
    private clock: { now: number },
  ) {}
  getList() { return this.list; }
  getLogs() { return this.logs; }
  mergeList(remote: BoardList) { this.list = mergeList(this.list, remote); }
  mergeLogs(remote: Record<string, DayLog>) { this.logs = mergeLogs(this.list, this.logs, remote); }
  toggle(date: string, id: string) {
    this.clock.now += 1000;
    const { checked, marks } = toggleWithMark(this.logs[date], id, this.clock.now);
    this.logs = { ...this.logs, [date]: buildDayLog(this.list, checked, marks) };
  }
  sync() { return syncWithRetry(this.repo, this, ['2026-11'], 't'); }
}

const D = '2026-11-12';

describe('두 기기 동기화 (가짜 GitHub)', () => {
  it('빈 저장소에 처음 동기화하면 목록과 기록이 올라간다', async () => {
    const repo = new FakeRepo();
    const a = new FakeDevice(repo, { now: 1000 });
    a.toggle(D, 'i_a4');
    await a.sync();
    expect(repo.files.has(LIST_PATH)).toBe(true);
    expect(JSON.parse(repo.files.get(logPath('2026-11'))!.text).days[D].checked).toEqual(['i_a4']);
  });

  it('다른 기기의 체크가 내려오고, 서로 다른 체크는 둘 다 남는다', async () => {
    const repo = new FakeRepo();
    const clock = { now: 1000 };
    const a = new FakeDevice(repo, clock);
    const b = new FakeDevice(repo, clock);
    a.toggle(D, 'i_a4');
    b.toggle(D, 'i_d1'); // 서로 모르는 채로 각자 체크
    await a.sync();
    await b.sync();
    await a.sync();
    expect(a.logs[D].checked).toEqual(['i_a4', 'i_d1']);
    expect(b.logs[D].checked).toEqual(['i_a4', 'i_d1']);
  });

  it('한 기기에서 한 해제가 다른 기기에 전달된다', async () => {
    const repo = new FakeRepo();
    const clock = { now: 1000 };
    const a = new FakeDevice(repo, clock);
    const b = new FakeDevice(repo, clock);
    a.toggle(D, 'i_a4');
    await a.sync();
    await b.sync();
    expect(b.logs[D].checked).toEqual(['i_a4']);
    b.toggle(D, 'i_a4'); // b에서 해제
    await b.sync();
    await a.sync();
    expect(a.logs[D].checked).toEqual([]);
  });

  it('빈 기기가 연결하면 저장소의 목록을 받아오고, 저장소에 목록이 없어도 빈 목록을 올리지 않는다', async () => {
    const repo = new FakeRepo();
    const clock = { now: 1000 };
    const source = new FakeDevice(repo, clock);
    source.toggle(D, 'i_a4');
    await source.sync(); // 저장소에 실제 목록이 올라간다

    const fresh = new FakeDevice(repo, clock);
    fresh.list = EMPTY_LIST; // 처음 연 새 기기: 목록이 비어 있다
    await fresh.sync();
    expect(fresh.list.categories).toHaveLength(9); // 저장소의 목록이 이긴다
    expect(fresh.logs[D].checked).toEqual(['i_a4']);

    const emptyRepo = new FakeRepo();
    const empty = new FakeDevice(emptyRepo, clock);
    empty.list = EMPTY_LIST;
    await empty.sync();
    expect(emptyRepo.files.has(LIST_PATH)).toBe(false); // 빈 목록을 올리지 않는다
  });

  it('변경이 없으면 다시 저장(커밋)하지 않는다', async () => {
    const repo = new FakeRepo();
    const a = new FakeDevice(repo, { now: 1000 });
    a.toggle(D, 'i_a4');
    await a.sync();
    const puts = repo.puts;
    await a.sync();
    await a.sync();
    expect(repo.puts).toBe(puts);
  });

  it('저장 직전에 다른 기기가 먼저 저장하면(충돌) 다시 읽어 합친 뒤 재시도한다', async () => {
    const repo = new FakeRepo();
    const clock = { now: 1000 };
    const a = new FakeDevice(repo, clock);
    const b = new FakeDevice(repo, clock);
    a.toggle(D, 'i_a4');
    await a.sync(); // 저장소에 파일이 생김
    await b.sync();
    a.toggle(D, 'i_a6');
    b.toggle(D, 'i_d1');
    // a가 저장하려는 바로 그 순간, b가 먼저 저장해 버린다
    repo.beforePut = async () => {
      await b.sync();
    };
    await a.sync(); // a의 저장은 sha가 어긋나 충돌 → 다시 읽어 합친 뒤 재시도
    expect(repo.conflicts).toBe(1);
    await b.sync();
    expect(new Set(a.logs[D].checked)).toEqual(new Set(['i_a4', 'i_a6', 'i_d1']));
    expect(new Set(b.logs[D].checked)).toEqual(new Set(['i_a4', 'i_a6', 'i_d1']));
  });

  it('원격 파일 형식이 이상하면 덮어쓰지 않고 오류를 낸다', async () => {
    const repo = new FakeRepo();
    repo.files.set(LIST_PATH, { text: '{"oops":true}', sha: 1 });
    const a = new FakeDevice(repo, { now: 1000 });
    await expect(a.sync()).rejects.toThrow('형식');
    expect(repo.files.get(LIST_PATH)!.text).toBe('{"oops":true}');
  });

  it('충돌이 계속되면 포기하고 오류를 던진다', async () => {
    const repo = new FakeRepo();
    repo.put = async () => { throw new GithubError(409, 'always'); };
    const a = new FakeDevice(repo, { now: 1000 });
    await expect(a.sync()).rejects.toBeInstanceOf(GithubError);
  });
});

describe('GitHub 클라이언트', () => {
  afterEach(() => vi.unstubAllGlobals());
  const cfg = { owner: 'o', repo: 'r', token: 'SECRET_TOKEN' };

  it('base64 인코딩/디코딩은 한글을 보존한다', () => {
    const text = '한글 💪 text\n';
    expect(b64decode(b64encode(text))).toBe(text);
  });

  it('getFile: 없으면 null, 있으면 디코딩', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => new Response('{}', { status: 404 })));
    expect(await getFile(cfg, 'data/list.json')).toBeNull();
    vi.stubGlobal('fetch', vi.fn(async () => new Response(JSON.stringify({ content: b64encode('안녕\n') .replace(/(.{20})/g, '$1\n'), sha: 'abc' }), { status: 200 })));
    expect(await getFile(cfg, 'data/list.json')).toEqual({ text: '안녕\n', sha: 'abc' });
  });

  it('putFile: 요청 모양과 충돌 오류', async () => {
    const fetchMock = vi.fn(async () => new Response(JSON.stringify({ message: 'does not match' }), { status: 409 }));
    vi.stubGlobal('fetch', fetchMock);
    await expect(putFile(cfg, 'data/list.json', 'x', 'sha1', 'msg')).rejects.toMatchObject({ status: 409 });
    const [url, init] = fetchMock.mock.calls[0] as unknown as [string, RequestInit];
    expect(url).toBe('https://api.github.com/repos/o/r/contents/data/list.json');
    expect(JSON.parse(init.body as string)).toMatchObject({ message: 'msg', sha: 'sha1', content: b64encode('x') });
  });

  it('verifyAccess: Public 저장소는 막고, Private이면 쓰기 권한을 알려준다', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => new Response(JSON.stringify({ private: false }), { status: 200 })));
    await expect(verifyAccess(cfg)).rejects.toBeInstanceOf(PublicRepoError);
    vi.stubGlobal('fetch', vi.fn(async () => new Response(JSON.stringify({ private: true, permissions: { push: true } }), { status: 200 })));
    expect(await verifyAccess(cfg)).toEqual({ canPush: true });
    vi.stubGlobal('fetch', vi.fn(async () => new Response(JSON.stringify({ private: true, permissions: { push: false } }), { status: 200 })));
    expect(await verifyAccess(cfg)).toEqual({ canPush: false });
  });

  it('오류 메시지에 토큰이 들어가지 않는다', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => new Response(JSON.stringify({ message: 'Bad credentials' }), { status: 401 })));
    const err = await getFile(cfg, 'a').catch((e: Error) => e);
    expect(String((err as Error).message)).not.toContain('SECRET_TOKEN');
  });
});
