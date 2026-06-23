import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Check } from 'lucide-react'

// ─── Pricing tiers ────────────────────────────────────────────────────────────
const tiers = [
  {
    name: 'Free',
    price: '$0',
    period: '/month',
    desc: 'Perfect for internal events',
    highlight: false,
    cta: { label: 'Get Started', href: '/hackathons', variant: 'outline' as const },
    features: [
      'Up to 50 participants',
      'Unlimited teams',
      'Basic judging',
      '2 custom tracks',
      'Leaderboard & CSV export',
    ],
  },
  {
    name: 'Team',
    price: '$99',
    period: '/month',
    desc: 'For professional hackathons',
    highlight: true,
    cta: { label: 'Get Started', href: '/hackathons', variant: 'default' as const },
    features: [
      'Up to 500 participants',
      'Unlimited teams',
      'Advanced judging & rubrics',
      'Unlimited tracks',
      'Priority support',
      'Custom branding',
    ],
    badge: 'Most Popular',
  },
  {
    name: 'Enterprise',
    price: 'Custom',
    period: '',
    desc: 'For large-scale events',
    highlight: false,
    cta: { label: 'Contact Sales', href: '/contact', variant: 'outline' as const },
    features: [
      'Unlimited participants',
      'Unlimited everything',
      'Dedicated support',
      'On-premise deployment',
      'SLA guarantee',
      'Custom integrations',
    ],
  },
]

export default function PricingPage() {
  return (
    <div>
      {/* Header */}
      <section className="bg-cream border-b-2 border-ink">
        <div className="max-w-7xl mx-auto px-6 py-16 md:py-20">
          <div className="max-w-2xl">
            <div className="inline-flex items-center border-[1.5px] border-ink px-3 py-1 mb-8">
              <span className="font-mono text-[11px] uppercase tracking-[0.08em] text-ink">
                Pricing
              </span>
            </div>
            <h1 className="font-archivo font-black text-5xl md:text-6xl uppercase leading-[1] tracking-[-0.03em] text-ink mb-5">
              Simple, transparent pricing.
            </h1>
            <p className="font-sans text-[17px] leading-relaxed text-muted">
              Hackathon operations for every scale — from a 50-person team sprint to a 5,000-builder public event.
            </p>
            <div className="mt-6 inline-flex items-center border-[1.5px] border-ink px-3 py-1">
              <span className="font-mono text-[9px] uppercase tracking-[0.08em] text-muted">
                Pricing shown is placeholder (frontend demo only)
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing cards */}
      <section className="bg-cream-dark border-b-2 border-ink">
        <div className="max-w-7xl mx-auto px-6 py-16 md:py-24">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-0 border-2 border-ink">
            {tiers.map((tier, i) => (
              <div
                key={tier.name}
                className={`relative flex flex-col ${
                  tier.highlight ? 'bg-ink' : 'bg-cream'
                } ${i < tiers.length - 1 ? 'border-b-2 md:border-b-0 md:border-r-2 border-ink' : ''}`}
              >
                {/* Popular badge */}
                {tier.badge && (
                  <div className="absolute -top-px left-0 right-0 flex justify-center">
                    <div className="bg-accent px-4 py-1">
                      <span className="font-mono text-[9px] uppercase tracking-[0.08em] text-white">
                        {tier.badge}
                      </span>
                    </div>
                  </div>
                )}

                {/* Tier header */}
                <div
                  className={`px-6 pt-8 pb-6 border-b-2 ${
                    tier.highlight ? 'border-[#2a2720]' : 'border-ink'
                  }`}
                >
                  <h2
                    className={`font-archivo font-black text-2xl uppercase tracking-[-0.02em] mb-1 ${
                      tier.highlight ? 'text-cream' : 'text-ink'
                    }`}
                  >
                    {tier.name}
                  </h2>
                  <p
                    className={`font-sans text-sm mb-5 ${
                      tier.highlight ? 'text-muted' : 'text-muted'
                    }`}
                  >
                    {tier.desc}
                  </p>
                  <div className="flex items-baseline gap-1">
                    <span
                      className={`font-archivo font-black text-5xl leading-none tracking-[-0.04em] ${
                        tier.highlight ? 'text-cream' : 'text-ink'
                      }`}
                    >
                      {tier.price}
                    </span>
                    {tier.period && (
                      <span className="font-sans text-sm text-muted">{tier.period}</span>
                    )}
                  </div>
                </div>

                {/* Body */}
                <div className="px-6 py-6 flex flex-col flex-1">
                  <Link href={tier.cta.href} className="block mb-6">
                    <button
                      className={`w-full inline-flex items-center justify-center font-archivo font-extrabold uppercase tracking-wider text-sm h-11 px-6 border-2 transition-colors ${
                        tier.highlight
                          ? 'bg-accent text-white border-accent hover:bg-[#e03a14] hover:border-[#e03a14]'
                          : 'bg-transparent text-ink border-ink hover:bg-ink hover:text-cream'
                      }`}
                    >
                      {tier.cta.label}
                    </button>
                  </Link>

                  <ul className="space-y-3">
                    {tier.features.map((f) => (
                      <li key={f} className="flex items-start gap-3">
                        <div
                          className={`w-4 h-4 flex items-center justify-center flex-shrink-0 mt-0.5 border ${
                            tier.highlight ? 'border-[#2a2720] bg-[#2a2720]' : 'border-ink bg-cream-mid'
                          }`}
                        >
                          <Check
                            className={`h-2.5 w-2.5 ${tier.highlight ? 'text-cream' : 'text-ink'}`}
                          />
                        </div>
                        <span
                          className={`font-sans text-sm ${
                            tier.highlight ? 'text-cream' : 'text-ink'
                          }`}
                        >
                          {f}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ strip */}
      <section className="bg-cream border-b-2 border-ink">
        <div className="max-w-7xl mx-auto px-6 py-16">
          <div className="border-b-2 border-ink pb-6 mb-10">
            <h2 className="font-archivo font-black text-3xl uppercase tracking-[-0.03em] text-ink">
              Common Questions
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl">
            {[
              {
                q: 'Can I upgrade or downgrade at any time?',
                a: 'Yes. You can change your plan at any time. Upgrades take effect immediately; downgrades apply at the next billing cycle.',
              },
              {
                q: 'Is there a free trial for the Team plan?',
                a: 'Yes — all paid plans include a 14-day free trial. No credit card required to start.',
              },
              {
                q: 'What counts as a participant?',
                a: 'Any user registered in a hackathon — builders, judges, mentors, and organizers all count toward the participant limit.',
              },
              {
                q: 'Do you offer non-profit or educational discounts?',
                a: 'Yes. Contact our sales team for special pricing for non-profit organizations and academic institutions.',
              },
            ].map((item) => (
              <div key={item.q} className="border-l-2 border-ink pl-5">
                <h3 className="font-archivo font-bold text-sm uppercase tracking-wide text-ink mb-2">
                  {item.q}
                </h3>
                <p className="font-sans text-sm leading-relaxed text-muted">{item.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-ink">
        <div className="max-w-7xl mx-auto px-6 py-16 flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <h3 className="font-archivo font-black text-2xl uppercase tracking-[-0.02em] text-cream mb-1">
              Not sure which plan fits?
            </h3>
            <p className="font-sans text-sm text-muted">
              Talk to our team — we will find the right fit for your event size and goals.
            </p>
          </div>
          <Link href="/contact">
            <Button size="lg" variant="default">
              Talk to sales
            </Button>
          </Link>
        </div>
      </section>
    </div>
  )
}
