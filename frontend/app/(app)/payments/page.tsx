"use client"

export const dynamic = 'force-dynamic'

import { useAuth } from '@/lib/auth/auth-context'

// ---------------------------------------------------------------------------
// Info card
// ---------------------------------------------------------------------------

function InfoCard({
  label,
  value,
  mono,
}: {
  label: string
  value: string
  mono?: boolean
}) {
  return (
    <div className="border-2 border-ink px-5 py-4 bg-cream-dark">
      <p className="font-mono text-[9px] uppercase tracking-widest text-muted mb-1">{label}</p>
      <p
        className={
          mono
            ? 'font-mono text-[13px] text-ink'
            : 'font-archivo font-bold text-[14px] text-ink'
        }
      >
        {value}
      </p>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Main page
// ---------------------------------------------------------------------------

export default function PaymentsPage() {
  useAuth()

  return (
    <div className="p-8 max-w-[1360px]">
      {/* Page title */}
      <div className="mb-8">
        <h1 className="font-archivo font-black text-[38px] uppercase leading-none tracking-tight text-ink">
          Payments
        </h1>
        <p className="font-mono text-[10px] uppercase tracking-widest text-muted mt-2">
          Billing, payouts, and financial management
        </p>
      </div>

      {/* Coming soon banner */}
      <div className="border-2 border-ink bg-ink text-cream px-6 py-5 mb-8 flex items-center justify-between">
        <div>
          <p className="font-archivo font-black text-[16px] uppercase tracking-tight">
            Payment Integration Coming Soon
          </p>
          <p className="font-mono text-[10px] uppercase tracking-widest text-muted-light mt-1">
            Prize payouts and billing will be available in a future release
          </p>
        </div>
        <span className="font-mono text-[9px] uppercase tracking-widest px-3 py-1.5 border border-muted text-muted shrink-0">
          Q3 2026
        </span>
      </div>

      {/* Stripe Connect info card */}
      <div className="border-2 border-ink mb-6">
        <div className="bg-ink px-5 py-3 flex items-center gap-3">
          <div className="w-5 h-5 bg-[#635BFF] flex items-center justify-center shrink-0">
            <span className="font-archivo font-black text-[9px] text-white">S</span>
          </div>
          <span className="font-archivo font-black text-[13px] uppercase text-cream tracking-tight">
            Stripe Connect
          </span>
        </div>
        <div className="p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <InfoCard label="Integration Status" value="Not Connected" mono />
          <InfoCard label="Payout Method" value="Pending Setup" mono />
          <InfoCard label="Currency" value="USD" mono />
        </div>
        <div className="border-t-2 border-ink px-6 py-4 flex items-center justify-between bg-cream-dark">
          <p className="font-mono text-[10px] text-muted uppercase tracking-widest">
            Connect your Stripe account to enable prize payouts directly to winners
          </p>
          <button
            disabled
            className="bg-[#635BFF] text-white font-archivo font-bold text-[11px] uppercase tracking-wide px-5 py-2 opacity-50 cursor-not-allowed shrink-0"
          >
            Connect Stripe
          </button>
        </div>
      </div>

      {/* Feature list */}
      <div className="border-2 border-dashed border-ink p-8">
        <p className="font-archivo font-black text-[13px] uppercase text-ink mb-5">
          Planned Features
        </p>
        <ul className="space-y-3">
          {[
            'Automated prize payout to winners via Stripe Connect',
            'Sponsor billing and invoice generation',
            'Entry fee collection for paid hackathons',
            'Real-time payout status and transaction history',
            'Multi-currency support with automatic conversion',
            'Tax form generation (1099-K) for US recipients',
          ].map((feature) => (
            <li key={feature} className="flex items-start gap-3">
              <span className="w-1.5 h-1.5 bg-ink shrink-0 mt-1.5" />
              <span className="font-mono text-[11px] text-muted uppercase tracking-widest">
                {feature}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
