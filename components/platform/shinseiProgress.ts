"use client";
/* /shinsei の「この段階ですること」のチェック。
   この端末のブラウザの中だけに保存し、サーバーへは送らない。
   左の目次(ShinseiRail)とステップのチェック(ShinseiTasks)が同じ状態を見るので、
   モジュール内の小さなストアで持つ。 */

const KEY = "shougainenkin-note:shinsei-progress:v1";

type State = Record<string, boolean>;

let state: State = {};
let loaded = false;
const listeners = new Set<() => void>();
/* useSyncExternalStore は同じ参照を返さないと無限に描き直すので、要約を持っておく。 */
let snapshot = "";

function read(): State {
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return {};
    const parsed: unknown = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object") return {};
    const entries = Object.entries(parsed as Record<string, unknown>).filter(([, v]) => v === true) as [string, true][];
    return Object.fromEntries(entries);
  } catch {
    /* プライベートモードなどで読めないことがある。そのときは空で進む。 */
    return {};
  }
}

function save() {
  try {
    window.localStorage.setItem(KEY, JSON.stringify(state));
  } catch {
    /* 保存できなくても画面は動く。 */
  }
}

function refresh() {
  snapshot = Object.keys(state).filter((key) => state[key]).sort().join(",");
  for (const listener of listeners) listener();
}

export function ensureLoaded() {
  if (loaded) return;
  loaded = true;
  state = read();
  refresh();
}

export function getSnapshot() {
  return snapshot;
}

export function getServerSnapshot() {
  return "";
}

export function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => { listeners.delete(listener); };
}

export function isChecked(key: string) {
  return state[key] === true;
}

export function toggle(key: string, value: boolean) {
  if (value) state[key] = true;
  else delete state[key];
  save();
  refresh();
}

/* そのステップのタスクが全部ついているか。 */
export function isStepDone(stepId: string, taskCount: number) {
  if (taskCount === 0) return false;
  for (let i = 0; i < taskCount; i += 1) if (!state[`${stepId}:${i}`]) return false;
  return true;
}

export function reset() {
  state = {};
  save();
  refresh();
}
