import Link from "next/link";
import { PLACEMENTS, placementCard, visiblePlacements } from "@/data/dougu";

/* 8つのステップ。名前と順番は変えない。
   split は PC で2行に割る位置(助詞の後)。スマホでは割らない。 */
export const STEPS = [
  { title: "初診日を確認する", split: 4 },
  { title: "納付要件を確認する", split: 5 },
  { title: "年金事務所へ相談する", split: 6 },
  { title: "必要書類をそろえる", split: 5 },
  { title: "診断書の準備をする", split: 4 },
  { title: "申立書を作成する", split: 4 },
  { title: "年金事務所へ提出する", split: 6 },
  { title: "結果を待つ", split: 3 },
] as const;

function Node({ step, index }: { step: (typeof STEPS)[number]; index: number }) {
  const n = index + 1;
  const stepId = `step-${n}`;
  const placement = visiblePlacements(PLACEMENTS.shinseiSteps[stepId])[0];
  const card = placement ? placementCard(placement) : null;
  const head = step.title.slice(0, step.split);
  const tail = step.title.slice(step.split);

  return (
    <li className={`step-flow-node${card ? " has-tool" : ""}`} data-n={n}>
      <span className="step-flow-number" aria-hidden="true">{n}</span>
      <Link className="step-flow-title" href={`/shinsei#${stepId}`}>
        {head}
        <span className="step-flow-break">{tail}</span>
      </Link>
      {card && (
        <Link className={`step-flow-tool${stepId === "step-6" ? " is-featured" : ""}`} href={card.href}>
          <strong>→ {card.title}</strong>
          <span>{card.blurb}</span>
        </Link>
      )}
    </li>
  );
}

export default function StepFlow() {
  return (
    <ol className="step-flow" aria-label="申請の流れ 8つのステップ">
      {STEPS.map((step, index) => <Node step={step} index={index} key={step.title} />)}
    </ol>
  );
}
