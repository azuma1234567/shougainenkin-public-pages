"use client";
/* /shinsei の固定目次。1000px 以上は左の列、それ未満は横に流れるチップ列(どちらも sticky)。
   いま見ているステップを IntersectionObserver で強調し、チェックが全部ついた
   ステップは番号を ✓ にする。進み具合は端末の中の記録から数える。 */
import { useEffect, useState, useSyncExternalStore } from "react";
import { ensureLoaded, getServerSnapshot, getSnapshot, isStepDone, reset, subscribe } from "@/components/platform/shinseiProgress";

export type RailStep = { id: string; short: string; taskCount: number };

export default function ShinseiRail({ steps }: { steps: RailStep[] }) {
  useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const [current, setCurrent] = useState("");
  const [ready, setReady] = useState(false);

  useEffect(() => {
    ensureLoaded();
    setReady(true);
    if (typeof IntersectionObserver === "undefined") return;
    const targets = steps.map((step) => document.getElementById(step.id)).filter((el): el is HTMLElement => el !== null);
    if (targets.length === 0) return;
    const visible = new Set<string>();
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) visible.add(entry.target.id);
          else visible.delete(entry.target.id);
        }
        const first = steps.find((step) => visible.has(step.id));
        if (first) setCurrent(first.id);
      },
      { rootMargin: "-80px 0px -60% 0px" },
    );
    for (const target of targets) observer.observe(target);
    return () => observer.disconnect();
  }, [steps]);

  const done = ready ? steps.filter((step) => isStepDone(step.id, step.taskCount)).length : 0;

  return (
    <nav className="shinsei-rail" aria-label="申請の流れの目次">
      <p className="shinsei-rail-progress">
        進み具合 <strong>{done}/{steps.length}</strong>
        <span aria-hidden="true"><i style={{ width: `${(done / steps.length) * 100}%` }} /></span>
      </p>
      <ol>
        {steps.map((step, index) => {
          const finished = ready && isStepDone(step.id, step.taskCount);
          return (
            <li key={step.id}>
              <a aria-current={current === step.id ? "true" : undefined} className={finished ? "is-done" : undefined} href={`#${step.id}`}>
                <b aria-hidden="true">{finished ? "✓" : index + 1}</b>
                <span>{step.short}</span>
              </a>
            </li>
          );
        })}
      </ol>
      {ready && done > 0 ? (
        <p className="shinsei-rail-note">
          この端末だけに保存されます <button onClick={() => reset()} type="button">リセット</button>
        </p>
      ) : null}
    </nav>
  );
}
