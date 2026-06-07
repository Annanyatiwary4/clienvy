import { ScanSearch, ShieldCheck, Sparkles, Wand2 } from 'lucide-react';

const features = [
  {
    icon: ScanSearch,
    title: 'Detect',
    description: 'Provider patterns for OpenAI, GitHub, AWS, Stripe plus generic KEY/TOKEN/SECRET assignments.',
  },
  {
    icon: ShieldCheck,
    title: 'Validate',
    description: 'Entropy analysis and confidence scoring filter false positives before anything changes.',
  },
  {
    icon: Sparkles,
    title: 'Generate',
    description: 'Creates .env and .env.template from storage/secrets.json — your single source of truth.',
  },
  {
    icon: Wand2,
    title: 'Replace',
    description: 'Swaps hardcoded values for process.env references with automatic file backups.',
  },
];

export default function Features() {
  return (
    <section id="features" className="bg-[#050508] px-6 py-24 text-white">
      <div className="mx-auto max-w-6xl">
        <div className="mb-14 text-center">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">One pipeline. Four steps.</h2>
          <p className="mt-4 text-white/60">Each command does exactly one job.</p>
        </div>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {features.map(({ icon: Icon, title, description }) => (
            <div
              key={title}
              className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 backdrop-blur-sm transition-colors hover:border-[#5227FF]/40 hover:bg-white/[0.05]"
            >
              <div className="mb-4 flex size-10 items-center justify-center rounded-lg bg-[#5227FF]/20 text-[#FF9FFC]">
                <Icon className="size-5" />
              </div>
              <h3 className="text-lg font-semibold">{title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-white/55">{description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
