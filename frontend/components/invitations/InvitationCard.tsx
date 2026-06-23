'use client'

interface InvitationCardProps {
  invitation: any
}

export function InvitationCard({ invitation }: InvitationCardProps) {
  const expiresAt = new Date(invitation.expires_at)
  const now = new Date()

  const isSameDay =
    expiresAt.getFullYear() === now.getFullYear() &&
    expiresAt.getMonth() === now.getMonth() &&
    expiresAt.getDate() === now.getDate()

  const tomorrow = new Date(now)
  tomorrow.setDate(tomorrow.getDate() + 1)
  const isTomorrow =
    expiresAt.getFullYear() === tomorrow.getFullYear() &&
    expiresAt.getMonth() === tomorrow.getMonth() &&
    expiresAt.getDate() === tomorrow.getDate()

  const daysUntilExpiry = Math.ceil((expiresAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))

  const isExpired = expiresAt < now
  const expiryText = isExpired
    ? 'Expired'
    : isSameDay
    ? 'Expires today'
    : isTomorrow
    ? 'Expires tomorrow'
    : `Expires in ${daysUntilExpiry} days`

  const roleLabelColors: Record<string, { bg: string; color: string }> = {
    BUILDER: { bg: '#16140f', color: '#f4f1e8' },
    ORGANIZER: { bg: '#ff4d23', color: '#f4f1e8' },
    JUDGE: { bg: '#f4f1e8', color: '#16140f' },
    MENTOR: { bg: '#8c8676', color: '#f4f1e8' },
  }
  const roleStyle = roleLabelColors[invitation.role] ?? { bg: '#16140f', color: '#f4f1e8' }

  const hackathonName =
    invitation.hackathon_name ?? invitation.hackathon?.name ?? 'Hackathon'
  const hackathonDesc =
    invitation.hackathon_description ?? invitation.hackathon?.description
  const inviterName = invitation.inviter_name ?? invitation.invited_by ?? 'Organizer'
  const inviterEmail = invitation.inviter_email
  const inviteeEmail = invitation.invitee_email ?? invitation.email
  const customMessage = invitation.custom_message
  const startAt = invitation.hackathon_start_at ?? invitation.hackathon?.start_date
  const endAt = invitation.hackathon_end_at ?? invitation.hackathon?.end_date

  const fmt = (iso: string) =>
    new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })

  return (
    <div style={{ border: '2px solid #16140f', background: '#f4f1e8' }}>
      {/* Header band */}
      <div
        style={{
          background: '#16140f',
          padding: '2rem',
          textAlign: 'center',
        }}
      >
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '3.5rem',
            height: '3.5rem',
            border: '2px solid #f4f1e8',
            marginBottom: '1rem',
          }}
        >
          <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="#f4f1e8" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
        </div>
        <p style={{ fontFamily: 'Inter, sans-serif', color: '#8c8676', fontSize: '0.875rem', marginBottom: '0.25rem' }}>
          {inviterName} has invited you to join
        </p>
        <h1 style={{ fontFamily: 'Archivo, sans-serif', fontWeight: 900, fontSize: '1.75rem', color: '#f4f1e8', margin: 0 }}>
          {hackathonName}
        </h1>
      </div>

      {/* Body */}
      <div style={{ padding: '2rem' }}>
        {/* Role badge */}
        <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
          <span
            style={{
              display: 'inline-block',
              padding: '0.375rem 1rem',
              background: roleStyle.bg,
              color: roleStyle.color,
              fontFamily: 'JetBrains Mono, monospace',
              fontSize: '0.75rem',
              fontWeight: 700,
              letterSpacing: '0.08em',
              border: '2px solid #16140f',
            }}
          >
            ROLE: {invitation.role}
          </span>
        </div>

        {/* Hackathon description */}
        {hackathonDesc && (
          <p
            style={{
              fontFamily: 'Inter, sans-serif',
              color: '#8c8676',
              fontSize: '0.875rem',
              lineHeight: 1.6,
              textAlign: 'center',
              marginBottom: '1.5rem',
            }}
          >
            {hackathonDesc}
          </p>
        )}

        {/* Custom message */}
        {customMessage && (
          <div
            style={{
              borderLeft: '4px solid #ff4d23',
              paddingLeft: '1rem',
              marginBottom: '1.5rem',
            }}
          >
            <p style={{ fontFamily: 'Archivo, sans-serif', fontWeight: 700, color: '#16140f', fontSize: '0.8rem', marginBottom: '0.25rem' }}>
              Message from {inviterName}:
            </p>
            <p style={{ fontFamily: 'Inter, sans-serif', color: '#16140f', fontStyle: 'italic', fontSize: '0.875rem' }}>
              "{customMessage}"
            </p>
          </div>
        )}

        {/* Detail grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
          {startAt && endAt && (
            <div style={{ border: '2px solid #16140f', padding: '0.875rem' }}>
              <p style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.65rem', color: '#8c8676', marginBottom: '0.25rem', letterSpacing: '0.08em' }}>
                DATES
              </p>
              <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.8rem', color: '#16140f' }}>
                {fmt(startAt)} – {fmt(endAt)}
              </p>
            </div>
          )}
          <div style={{ border: `2px solid ${isExpired ? '#ff4d23' : '#16140f'}`, padding: '0.875rem' }}>
            <p style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.65rem', color: '#8c8676', marginBottom: '0.25rem', letterSpacing: '0.08em' }}>
              INVITATION
            </p>
            <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.8rem', color: isExpired ? '#ff4d23' : '#16140f', fontWeight: isExpired ? 700 : 400 }}>
              {expiryText}
            </p>
          </div>
        </div>

        {/* Invitee */}
        {inviteeEmail && (
          <div
            style={{
              background: '#eae7de',
              border: '2px solid #16140f',
              padding: '0.75rem 1rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
            }}
          >
            <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.8rem', color: '#8c8676' }}>Invited as:</span>
            <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.8rem', color: '#16140f', fontWeight: 700 }}>
              {inviteeEmail}
            </span>
          </div>
        )}

        {/* Inviter contact */}
        {inviterEmail && (
          <p style={{ textAlign: 'center', marginTop: '1rem', fontFamily: 'Inter, sans-serif', fontSize: '0.8rem', color: '#8c8676' }}>
            Questions?{' '}
            <a href={`mailto:${inviterEmail}`} style={{ color: '#ff4d23', textDecoration: 'none', fontWeight: 700 }}>
              Contact {inviterName}
            </a>
          </p>
        )}
      </div>
    </div>
  )
}
