import { Laptop } from "lucide-react";

export default function MobileBlocker() {
  return (
    <div className="fixed inset-0 z-[9999] flex md:hidden flex-col items-center justify-center gap-4 bg-background px-6 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
        <Laptop className="h-8 w-8 text-primary" />
      </div>
      <h1 className="text-xl font-semibold text-foreground">
        Best experienced on a laptop
      </h1>
      <p className="max-w-xs text-sm text-muted-foreground">
        Evalio isn&apos;t designed for mobile devices yet. Please switch to a
        laptop or desktop to continue.
      </p>
    </div>
  );
}
