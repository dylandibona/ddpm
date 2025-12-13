import Link from "next/link";
import { SyncButton } from "./sync-button";

export function Header() {
  return (
    <header className="border-b border-border bg-card">
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Type-Driven Logo */}
          <Link href="/" className="group">
            <h1 className="text-2xl font-extrabold tracking-tighter text-foreground group-hover:text-primary transition-colors">
              DD <span className="text-muted-foreground">/</span> PM
            </h1>
          </Link>

          {/* Actions */}
          <div className="flex items-center gap-4">
            <Link
              href="/tax-prep"
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              Tax Prep
            </Link>
            <SyncButton />
          </div>
        </div>
      </div>
    </header>
  );
}
