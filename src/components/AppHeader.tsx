import Link from "next/link";

export function AppHeader() {
  return (
    <header className="top-nav">
      <Link href="/" className="brand">Loafline</Link>
      <nav>
        <Link href="/">Check</Link>
        <Link href="/history">Ledger</Link>
      </nav>
    </header>
  );
}
