import { render, screen } from '@/__tests__/utils/test-utils'
import { InvitationCard } from '@/components/invitations/InvitationCard'
import type { InvitationDetails } from '@/lib/api/invitations'

const mockInvitation: InvitationDetails = {
  invitation_id: 'inv-123',
  hackathon_id: 'hack-123',
  hackathon_name: 'AI Innovation Hackathon',
  hackathon_description: 'Build the future of AI applications',
  hackathon_start_at: '2025-02-01T00:00:00Z',
  hackathon_end_at: '2025-02-03T00:00:00Z',
  invitee_email: 'builder@example.com',
  inviter_name: 'John Organizer',
  inviter_email: 'organizer@example.com',
  role: 'BUILDER',
  status: 'PENDING',
  custom_message: 'We would love to have you join our team!',
  expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days from now
  created_at: new Date().toISOString(),
  token: 'test-token-123',
}

describe('InvitationCard', () => {
  it('should render invitation details correctly', () => {
    render(<InvitationCard invitation={mockInvitation} />)

    expect(screen.getByText("You're Invited!")).toBeInTheDocument()
    expect(screen.getByText(/John Organizer has invited you to join/)).toBeInTheDocument()
    expect(screen.getByText('AI Innovation Hackathon')).toBeInTheDocument()
    expect(screen.getByText('Build the future of AI applications')).toBeInTheDocument()
  })

  it('should display role badge with correct styling', () => {
    render(<InvitationCard invitation={mockInvitation} />)

    const roleBadge = screen.getByText(/Role: BUILDER/)
    expect(roleBadge).toBeInTheDocument()
    expect(roleBadge).toHaveClass('bg-blue-100', 'text-blue-800')
  })

  it('should display custom message when provided', () => {
    render(<InvitationCard invitation={mockInvitation} />)

    expect(screen.getByText(/Message from John Organizer:/)).toBeInTheDocument()
    expect(screen.getByText(/We would love to have you join our team!/)).toBeInTheDocument()
  })

  it('should not display custom message section when not provided', () => {
    const invitationWithoutMessage = { ...mockInvitation, custom_message: undefined }
    render(<InvitationCard invitation={invitationWithoutMessage} />)

    expect(screen.queryByText(/Message from/)).not.toBeInTheDocument()
  })

  it('should display hackathon dates when provided', () => {
    render(<InvitationCard invitation={mockInvitation} />)

    expect(screen.getByText(/Feb 1, 2025/)).toBeInTheDocument()
    expect(screen.getByText(/Feb 3, 2025/)).toBeInTheDocument()
  })

  it('should display invitee email', () => {
    render(<InvitationCard invitation={mockInvitation} />)

    expect(screen.getByText('builder@example.com')).toBeInTheDocument()
  })

  it('should display correct expiry text for upcoming expiration', () => {
    render(<InvitationCard invitation={mockInvitation} />)

    expect(screen.getByText(/Expires in 7 days/)).toBeInTheDocument()
  })

  it('should display "Expired" for past expiration date', () => {
    const expiredInvitation = {
      ...mockInvitation,
      expires_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // Yesterday
    }
    render(<InvitationCard invitation={expiredInvitation} />)

    expect(screen.getByText('Expired')).toBeInTheDocument()
  })

  it('should display "Expires today" for same-day expiration', () => {
    const todayInvitation = {
      ...mockInvitation,
      expires_at: new Date(Date.now() + 1 * 60 * 60 * 1000).toISOString(), // 1 hour from now
    }
    render(<InvitationCard invitation={todayInvitation} />)

    expect(screen.getByText('Expires today')).toBeInTheDocument()
  })

  it('should display "Expires tomorrow" for next-day expiration', () => {
    const tomorrowInvitation = {
      ...mockInvitation,
      expires_at: new Date(Date.now() + 25 * 60 * 60 * 1000).toISOString(), // 25 hours from now
    }
    render(<InvitationCard invitation={tomorrowInvitation} />)

    expect(screen.getByText('Expires tomorrow')).toBeInTheDocument()
  })

  it('should apply correct role colors for ORGANIZER', () => {
    const organizerInvitation = { ...mockInvitation, role: 'ORGANIZER' as const }
    render(<InvitationCard invitation={organizerInvitation} />)

    const roleBadge = screen.getByText(/Role: ORGANIZER/)
    expect(roleBadge).toHaveClass('bg-purple-100', 'text-purple-800')
  })

  it('should apply correct role colors for JUDGE', () => {
    const judgeInvitation = { ...mockInvitation, role: 'JUDGE' as const }
    render(<InvitationCard invitation={judgeInvitation} />)

    const roleBadge = screen.getByText(/Role: JUDGE/)
    expect(roleBadge).toHaveClass('bg-green-100', 'text-green-800')
  })

  it('should apply correct role colors for MENTOR', () => {
    const mentorInvitation = { ...mockInvitation, role: 'MENTOR' as const }
    render(<InvitationCard invitation={mentorInvitation} />)

    const roleBadge = screen.getByText(/Role: MENTOR/)
    expect(roleBadge).toHaveClass('bg-yellow-100', 'text-yellow-800')
  })

  it('should render with minimal data (no optional fields)', () => {
    const minimalInvitation: InvitationDetails = {
      invitation_id: 'inv-123',
      hackathon_id: 'hack-123',
      hackathon_name: 'Minimal Hackathon',
      invitee_email: 'user@example.com',
      inviter_name: 'Organizer',
      inviter_email: 'org@example.com',
      role: 'BUILDER',
      status: 'PENDING',
      expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      created_at: new Date().toISOString(),
      token: 'token-123',
    }

    render(<InvitationCard invitation={minimalInvitation} />)

    expect(screen.getByText('Minimal Hackathon')).toBeInTheDocument()
    expect(screen.queryByText(/Message from/)).not.toBeInTheDocument()
  })
})
