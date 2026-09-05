"use client";
/* 「この段階ですること」。チェックはこの端末のブラウザの中だけに残る。送信しない。
   JavaScript が動かないときは、ふつうの箇条書きとして読める(下の noscript)。 */
import { useEffect, useState, useSyncExternalStore } from "react";
import { ensureLoaded, getServerSnapshot, getSnapshot, isChecked, subscribe, toggle } from "@/components/platform/shinseiProgress";

export default function ShinseiTasks({ stepId, tasks }: { stepId: string; tasks: readonly string[] }) {
  useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const [ready, setReady] = useState(false);
  useEffect(() => { ensureLoaded(); setReady(true); }, []);

  return (
    <ul className="shinsei-task-list">
      {tasks.map((task, index) => {
        const key = `${stepId}:${index}`;
        return (
          <li key={task}>
            <label>
              <input
                checked={ready && isChecked(key)}
                onChange={(event) => toggle(key, event.target.checked)}
                type="checkbox"
              />
              <span>{task}</span>
            </label>
          </li>
        );
      })}
    </ul>
  );
}
