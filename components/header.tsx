import Link from "next/link";
import { SyncButton } from "./sync-button";

export function Header() {
  return (
    <header className="border-b border-border bg-background">
      <div className="max-w-7xl mx-auto px-8 py-4">
        <div className="flex items-center justify-between">
          {/* Type-Driven Logo */}
          <Link href="/" className="group">
            <h1 className="text-xl font-extrabold tracking-tighter text-foreground group-hover:text-primary transition-colors">
              DD <span className="text-muted-foreground">/</span> PM
            </h1>
          </Link>

          {/* Actions */}
          <div className="flex items-center gap-3">
            <SyncButton />
          </div>
        </div>
      </div>
    </header>
  );
}
