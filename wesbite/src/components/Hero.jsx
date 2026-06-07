import { ArrowRight, Code2, Terminal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import LiquidEther from '@/components/LiquidEther';

export default function Hero() {
  return (
    <section className="relative min-h-screen overflow-hidden bg-[#050508] text-white">
      <div className="absolute inset-0">
        <LiquidEther
          colors={['#5227FF', '#FF9FFC', '#B497CF']}
          mouseForce={20}
          cursorSize={100}
          isViscous={false}
          viscous={30}
          iterationsViscous={32}
          iterationsPoisson={32}
          resolution={0.5}
          isBounce={false}
          autoDemo
          autoSpeed={0.5}
          autoIntensity={2.2}
          takeoverDuration={0.25}
          autoResumeDelay={3000}
          autoRampDuration={0.6}
          className="h-full w-full"
        />
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,#050508_72%)]" />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-[#050508]/30 via-transparent to-[#050508]" />
      </div>

      <header className="relative z-10 mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-6">
        <div className="flex items-center gap-2">
          <span className="flex size-8 items-center justify-center rounded-lg bg-white/10 text-sm font-bold backdrop-blur-sm">
            C
          </span>
          <span className="text-lg font-semibold tracking-tight">Clienvy</span>
        </div>
        <nav className="hidden items-center gap-6 text-sm text-white/70 md:flex">
          <a href="#features" className="transition-colors hover:text-white">
            Features
          </a>
          <a href="#install" className="transition-colors hover:text-white">
            Install
          </a>
          <a
            href="https://github.com/Annanyatiwary4/clienvy"
            target="_blank"
            rel="noreferrer"
            className="transition-colors hover:text-white"
          >
            GitHub
          </a>
        </nav>
      </header>

      <div className="relative z-10 mx-auto flex min-h-[calc(100vh-5rem)] max-w-6xl flex-col items-center justify-center px-6 pb-20 pt-10 text-center">
        <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-sm text-white/80 backdrop-blur-sm">
          <span className="size-2 rounded-full bg-[#FF9FFC] shadow-[0_0_12px_#FF9FFC]" />
          v2.0 — Secret detection &amp; env migration
        </div>

        <h1 className="max-w-4xl text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl">
          Find secrets.
          <br />
          <span className="bg-gradient-to-r from-[#B497CF] via-[#FF9FFC] to-[#5227FF] bg-clip-text text-transparent">
            Fix your codebase.
          </span>
        </h1>

        <p className="mt-6 max-w-2xl text-base text-white/65 sm:text-lg md:text-xl">
          Clienvy scans for hardcoded API keys, validates them with entropy scoring,
          generates <code className="rounded bg-white/10 px-1.5 py-0.5 text-sm text-[#FF9FFC]">.env</code>{' '}
          files, and replaces secrets with{' '}
          <code className="rounded bg-white/10 px-1.5 py-0.5 text-sm text-[#FF9FFC]">process.env</code> — in one command.
        </p>

        <div id="install" className="mt-8 flex w-full max-w-xl flex-col gap-3 sm:flex-row sm:justify-center">
          <Button
            size="lg"
            className="h-11 gap-2 border-0 bg-[#5227FF] px-6 text-white hover:bg-[#5227FF]/90"
            asChild
          >
            <a href="https://www.npmjs.com/package/clienvy" target="_blank" rel="noreferrer">
              <Terminal className="size-4" />
              npm install -g clienvy
            </a>
          </Button>
          <Button
            size="lg"
            variant="outline"
            className="h-11 gap-2 border-white/15 bg-white/5 px-6 text-white hover:bg-white/10 hover:text-white"
            asChild
          >
            <a href="https://github.com/Annanyatiwary4/clienvy" target="_blank" rel="noreferrer">
              <Code2 className="size-4" />
              View on GitHub
            </a>
          </Button>
        </div>

        <div className="mt-10 w-full max-w-2xl overflow-hidden rounded-xl border border-white/10 bg-black/40 text-left shadow-2xl backdrop-blur-md">
          <div className="flex items-center gap-2 border-b border-white/10 px-4 py-3">
            <span className="size-3 rounded-full bg-red-400/80" />
            <span className="size-3 rounded-full bg-yellow-400/80" />
            <span className="size-3 rounded-full bg-green-400/80" />
            <span className="ml-2 text-xs text-white/40">terminal</span>
          </div>
          <pre className="overflow-x-auto p-4 font-mono text-sm leading-relaxed text-white/80">
            <span className="text-[#FF9FFC]">$</span> clenv init{'\n'}
            <span className="text-white/40">→ extract → validate → generate → replace</span>
          </pre>
        </div>

        <a
          href="#features"
          className="mt-12 inline-flex items-center gap-1 text-sm text-white/50 transition-colors hover:text-white/80"
        >
          See how it works
          <ArrowRight className="size-4" />
        </a>
      </div>
    </section>
  );
}
