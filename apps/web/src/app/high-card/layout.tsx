import { HydrateClient } from "@/trpc/server";
import Link from "next/link";

export default function SetupLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <HydrateClient>
      <div className="flex min-h-dvh justify-center text-white">
        <div className="flex h-screen w-full max-w-[80rem] flex-col items-center gap-6 px-4">
          <header className="self-start pt-6">
            <Link href="/">
              <h1 className="font-bold">Card Games</h1>
            </Link>
          </header>
          <main className="flex w-full h-full flex-1 flex-col gap-6 pb-6">
            {children}
          </main>
        </div>
      </div>
    </HydrateClient>
  );
}
