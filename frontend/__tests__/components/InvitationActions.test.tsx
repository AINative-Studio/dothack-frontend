import { render, screen, fireEvent, waitFor } from '@/__tests__/utils/test-utils'
import { InvitationActions } from '@/components/invitations/InvitationActions'
import type { InvitationDetails } from '@/lib/api/invitations'
import * as invitationsApi from '@/lib/api/invitations'
import { useRouter } from 'next/navigation'

jest.mock('@/lib/api/invitations')
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}))

const mockedApi = invitationsApi as jest.Mocked<typeof invitationsApi>
const mockedUseRouter = useRouter as jest.MockedFunction<typeof useRouter>

const mockInvitation: InvitationDetails = {
  invitation_id: 'inv-123',
  hackathon_id: 'hack-123',
  hackathon_name: 'AI Innovation Hackathon',
  invitee_email: 'builder@example.com',
  inviter_name: 'John Organizer',
  inviter_email: 'organizer@example.com',
  role: 'BUILDER',
  status: 'PENDING',
  expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
  created_at: new Date().toISOString(),
  token: 'test-token-123',
}

const mockPush = jest.fn()

describe('InvitationActions', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockedUseRouter.mockReturnValue({
      push: mockPush,
      back: jest.fn(),
      forward: jest.fn(),
      refresh: jest.fn(),
      replace: jest.fn(),
      prefetch: jest.fn(),
    } as any)
  })

  describe('Unauthenticated User', () => {
    it('should show account required message', () => {
      render(
        <InvitationActions
          invitation={mockInvitation}
          token="test-token"
          isAuthenticated={false}
        />
      )

      expect(screen.getByText('Account Required')).toBeInTheDocument()
      expect(
        screen.getByText(/You'll need to create an account or sign in to accept this invitation/)
      ).toBeInTheDocument()
    })

    it('should show "Sign Up & Accept" button text when not authenticated', () => {
      render(
        <InvitationActions
          invitation={mockInvitation}
          token="test-token"
          isAuthenticated={false}
        />
      )

      expect(screen.getByText('Sign Up & Accept')).toBeInTheDocument()
    })

    it('should redirect to signup with email and redirect params when accepting', () => {
      render(
        <InvitationActions
          invitation={mockInvitation}
          token="test-token"
          isAuthenticated={false}
        />
      )

      const acceptButton = screen.getByText('Sign Up & Accept')
      fireEvent.click(acceptButton)

      expect(mockPush).toHaveBeenCalledWith(
        '/signup?email=builder%40example.com&redirect=/invitations/test-token'
      )
    })

    it('should store token in sessionStorage when redirecting to signup', () => {
      const setItemSpy = jest.spyOn(Storage.prototype, 'setItem')

      render(
        <InvitationActions
          invitation={mockInvitation}
          token="test-token"
          isAuthenticated={false}
        />
      )

      const acceptButton = screen.getByText('Sign Up & Accept')
      fireEvent.click(acceptButton)

      expect(setItemSpy).toHaveBeenCalledWith('pending_invitation', 'test-token')

      setItemSpy.mockRestore()
    })
  })

  describe('Authenticated User - Email Match', () => {
    it('should show "Accept Invitation" button text when authenticated', () => {
      render(
        <InvitationActions
          invitation={mockInvitation}
          token="test-token"
          isAuthenticated={true}
          userEmail="builder@example.com"
        />
      )

      expect(screen.getByText('Accept Invitation')).toBeInTheDocument()
    })

    it('should not show account required message when authenticated', () => {
      render(
        <InvitationActions
          invitation={mockInvitation}
          token="test-token"
          isAuthenticated={true}
          userEmail="builder@example.com"
        />
      )

      expect(screen.queryByText('Account Required')).not.toBeInTheDocument()
    })

    it('should call acceptInvitation API and redirect on successful accept', async () => {
      mockedApi.acceptInvitation.mockResolvedValue({
        ...mockInvitation,
        status: 'ACCEPTED',
      })

      render(
        <InvitationActions
          invitation={mockInvitation}
          token="test-token"
          isAuthenticated={true}
          userEmail="builder@example.com"
        />
      )

      const acceptButton = screen.getByText('Accept Invitation')
      fireEvent.click(acceptButton)

      await waitFor(() => {
        expect(mockedApi.acceptInvitation).toHaveBeenCalledWith('test-token')
      })

      // Wait for redirect
      await waitFor(
        () => {
          expect(mockPush).toHaveBeenCalledWith('/hackathons/hack-123')
        },
        { timeout: 2000 }
      )
    })

    it('should show loading state when accepting', async () => {
      mockedApi.acceptInvitation.mockImplementation(
        () => new Promise((resolve) => setTimeout(resolve, 100))
      )

      render(
        <InvitationActions
          invitation={mockInvitation}
          token="test-token"
          isAuthenticated={true}
          userEmail="builder@example.com"
        />
      )

      const acceptButton = screen.getByText('Accept Invitation')
      fireEvent.click(acceptButton)

      expect(screen.getByText('Accepting...')).toBeInTheDocument()
      expect(acceptButton).toBeDisabled()
    })

    it('should handle API error when accepting', async () => {
      const errorMessage = 'Failed to accept invitation'
      mockedApi.acceptInvitation.mockRejectedValue(new Error(errorMessage))

      render(
        <InvitationActions
          invitation={mockInvitation}
          token="test-token"
          isAuthenticated={true}
          userEmail="builder@example.com"
        />
      )

      const acceptButton = screen.getByText('Accept Invitation')
      fireEvent.click(acceptButton)

      await waitFor(() => {
        expect(mockedApi.acceptInvitation).toHaveBeenCalled()
      })

      // Button should be re-enabled after error
      await waitFor(() => {
        expect(acceptButton).not.toBeDisabled()
      })
    })
  })

  describe('Authenticated User - Email Mismatch', () => {
    it('should show email mismatch warning', () => {
      render(
        <InvitationActions
          invitation={mockInvitation}
          token="test-token"
          isAuthenticated={true}
          userEmail="different@example.com"
        />
      )

      expect(screen.getByText('Email Mismatch')).toBeInTheDocument()
      expect(screen.getByText(/This invitation is for/)).toBeInTheDocument()
      expect(screen.getByText('builder@example.com')).toBeInTheDocument()
      expect(screen.getByText('different@example.com')).toBeInTheDocument()
    })

    it('should disable accept button when email mismatch', () => {
      render(
        <InvitationActions
          invitation={mockInvitation}
          token="test-token"
          isAuthenticated={true}
          userEmail="different@example.com"
        />
      )

      const acceptButton = screen.getByText('Accept Invitation')
      expect(acceptButton).toBeDisabled()
    })

    it('should not call API when trying to accept with email mismatch', async () => {
      render(
        <InvitationActions
          invitation={mockInvitation}
          token="test-token"
          isAuthenticated={true}
          userEmail="different@example.com"
        />
      )

      const acceptButton = screen.getByText('Accept Invitation')
      fireEvent.click(acceptButton)

      await waitFor(() => {
        expect(mockedApi.acceptInvitation).not.toHaveBeenCalled()
      })
    })
  })

  describe('Decline Flow', () => {
    it('should show decline button', () => {
      render(
        <InvitationActions
          invitation={mockInvitation}
          token="test-token"
          isAuthenticated={true}
          userEmail="builder@example.com"
        />
      )

      expect(screen.getByText('Decline')).toBeInTheDocument()
    })

    it('should open confirmation dialog when decline is clicked', () => {
      render(
        <InvitationActions
          invitation={mockInvitation}
          token="test-token"
          isAuthenticated={true}
          userEmail="builder@example.com"
        />
      )

      const declineButton = screen.getByText('Decline')
      fireEvent.click(declineButton)

      expect(screen.getByText('Decline Invitation?')).toBeInTheDocument()
      expect(
        screen.getByText(/Are you sure you want to decline the invitation to join/)
      ).toBeInTheDocument()
    })

    it('should close dialog when cancel is clicked', () => {
      render(
        <InvitationActions
          invitation={mockInvitation}
          token="test-token"
          isAuthenticated={true}
          userEmail="builder@example.com"
        />
      )

      // Open dialog
      const declineButton = screen.getByText('Decline')
      fireEvent.click(declineButton)

      // Click cancel
      const cancelButton = screen.getByText('Cancel')
      fireEvent.click(cancelButton)

      // Dialog should close
      expect(screen.queryByText('Decline Invitation?')).not.toBeInTheDocument()
    })

    it('should call declineInvitation API and redirect on confirmation', async () => {
      mockedApi.declineInvitation.mockResolvedValue({
        ...mockInvitation,
        status: 'DECLINED',
      })

      render(
        <InvitationActions
          invitation={mockInvitation}
          token="test-token"
          isAuthenticated={true}
          userEmail="builder@example.com"
        />
      )

      // Open dialog
      const declineButton = screen.getByText('Decline')
      fireEvent.click(declineButton)

      // Confirm decline
      const confirmButton = screen.getByText('Decline Invitation')
      fireEvent.click(confirmButton)

      await waitFor(() => {
        expect(mockedApi.declineInvitation).toHaveBeenCalledWith('test-token')
      })

      // Wait for redirect
      await waitFor(
        () => {
          expect(mockPush).toHaveBeenCalledWith('/')
        },
        { timeout: 2000 }
      )
    })

    it('should handle API error when declining', async () => {
      mockedApi.declineInvitation.mockRejectedValue(new Error('Failed to decline'))

      render(
        <InvitationActions
          invitation={mockInvitation}
          token="test-token"
          isAuthenticated={true}
          userEmail="builder@example.com"
        />
      )

      // Open dialog
      const declineButton = screen.getByText('Decline')
      fireEvent.click(declineButton)

      // Confirm decline
      const confirmButton = screen.getByText('Decline Invitation')
      fireEvent.click(confirmButton)

      await waitFor(() => {
        expect(mockedApi.declineInvitation).toHaveBeenCalled()
      })

      // Dialog should close after error
      await waitFor(() => {
        expect(screen.queryByText('Decline Invitation?')).not.toBeInTheDocument()
      })
    })
  })

  describe('Contact Organizer', () => {
    it('should show contact organizer link', () => {
      render(
        <InvitationActions
          invitation={mockInvitation}
          token="test-token"
          isAuthenticated={true}
          userEmail="builder@example.com"
        />
      )

      const contactLink = screen.getByText('Contact John Organizer')
      expect(contactLink).toBeInTheDocument()
      expect(contactLink).toHaveAttribute('href', 'mailto:organizer@example.com')
    })
  })
})
