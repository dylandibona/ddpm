import Link from "next/link";

export function Header() {
  return (
    <header className="border-b border-border bg-card/50 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          {/* DD/PM Logo */}
          <Link href="/" className="group">
            <h1 className="text-lg font-bold tracking-tighter text-foreground transition-colors group-hover:text-primary">
              DD <span className="text-muted-foreground">/</span> PM
            </h1>
          </Link>
        </div>
      </div>
    </header>
  );
}
