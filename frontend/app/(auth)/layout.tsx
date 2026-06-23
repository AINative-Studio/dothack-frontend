import Link from 'next/link'

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen flex" style={{ backgroundColor: '#f4f1e8' }}>
      {/* Left side — form panel */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-12">
        {/* Top-left logo link */}
        <div className="w-full max-w-[420px] mb-10">
          <Link
            href="/"
            className="inline-block font-archivo text-xl font-black uppercase tracking-tight"
            style={{ color: '#16140f', textDecoration: 'none' }}
          >
            DotHack
          </Link>
        </div>

        {/* Form slot */}
        <div className="w-full max-w-[420px]">{children}</div>
      </div>

      {/* Right side — ink branding panel (hidden on small screens) */}
      <div
        className="hidden lg:flex flex-col justify-between w-[480px] flex-shrink-0 p-12 relative overflow-hidden"
        style={{ backgroundColor: '#16140f' }}
      >
        {/* Top branding */}
        <div>
          <p
            className="font-mono text-xs uppercase tracking-widest mb-8"
            style={{ color: '#8c8676', letterSpacing: '0.12em' }}
          >
            AINative Studio
          </p>
          <h1
            className="font-archivo font-black uppercase"
            style={{
              color: '#f4f1e8',
              fontSize: '52px',
              lineHeight: '1',
              letterSpacing: '-0.04em',
            }}
          >
            Dot
            <br />
            Hack
          </h1>
          <p
            className="mt-6 font-inter text-base leading-relaxed"
            style={{ color: '#8c8676', maxWidth: '280px' }}
          >
            Hackathon operations,
            <br />
            engineered.
          </p>
        </div>

        {/* Decorative accent block */}
        <div className="space-y-6">
          <div
            className="w-12 h-1"
            style={{ backgroundColor: '#ff4d23' }}
          />
          <ul className="space-y-3">
            {[
              'End-to-end hackathon management',
              'Real-time judging and scoring',
              'Team formation and projects',
              'Prizes and leaderboards',
            ].map((item) => (
              <li
                key={item}
                className="flex items-center gap-3 font-inter text-sm"
                style={{ color: '#8c8676' }}
              >
                <span
                  className="w-1 h-1 flex-shrink-0"
                  style={{ backgroundColor: '#ff4d23', display: 'inline-block' }}
                />
                {item}
              </li>
            ))}
          </ul>

          {/* Large decorative number */}
          <div
            className="font-archivo font-black select-none"
            style={{
              color: 'rgba(255,77,35,0.08)',
              fontSize: '160px',
              lineHeight: '1',
              letterSpacing: '-0.06em',
              position: 'absolute',
              bottom: '-20px',
              right: '-10px',
            }}
          >
            .HK
          </div>
        </div>
      </div>
    </div>
  )
}
