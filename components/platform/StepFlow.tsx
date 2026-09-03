import Link from "next/link";
import { PLACEMENTS, placementCard, visiblePlacements } from "@/data/dougu";

export const STEPS = [
  "初診日を確認する",
  "納付要件を確認する",
  "年金事務所へ相談する",
  "必要書類をそろえる",
  "診断書の準備をする",
  "申立書を作成する",
  "年金事務所へ提出する",
  "結果を待つ",
] as const;

function Step({ title, index }: { title: string; index: number }) {
  const stepId = `step-${index + 1}`;
  const placement = visiblePlacements(PLACEMENTS.shinseiSteps[stepId])[0];
  const content = (
    <>
      <span className="step-flow-number" aria-hidden="true">{index + 1}</span>
      <span className="step-flow-content">
        <strong className="step-flow-title">{title}</strong>
        {placement ? (() => {
          const card = placementCard(placement);
          return (
            <span className={`step-flow-tool${stepId === "step-6" ? " is-featured" : ""}`}>
              <strong>→ {card.title}</strong>
              <span>{card.blurb}</span>
            </span>
          );
        })() : null}
      </span>
    </>
  );

  return placement ? (
    <Link className="step-flow-item has-tool" href={placementCard(placement).href}>{content}</Link>
  ) : (
    <div className="step-flow-item">{content}</div>
  );
}

export default function StepFlow() {
  return (
    <div className="step-flow" aria-label="申請の流れ 8つのステップ">
      {[STEPS.slice(0, 4), STEPS.slice(4)].map((column, columnIndex) => (
        <div className="step-flow-column" key={columnIndex}>
          {column.map((step, index) => (
            <Step title={step} index={index + columnIndex * 4} key={step} />
          ))}
        </div>
      ))}
    </div>
  );
}
