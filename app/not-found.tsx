import Link from "next/link";

export default function NotFound() {
  return (
    <div className="not-found">
      <h1>ページが見つかりません</h1>
      <p>
        お探しのページは、移動または削除された可能性があります。
        お手数ですが、トップページからご覧ください。
      </p>
      <p>
        <Link href="/">トップページへ戻る</Link>
      </p>
    </div>
  );
}
