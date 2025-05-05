export default function SetupLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className="flex min-h-dvh justify-center text-white">
      <div className="flex h-screen w-full max-w-[80rem] flex-col items-center gap-6 px-4">
        <header className="self-start pt-6">
          <h1 className="font-bold">High Card</h1>
        </header>
        <main className="flex w-full h-full flex-1 flex-col gap-6 pb-6">
          {children}
        </main>
      </div>
    </div>
  );
}
