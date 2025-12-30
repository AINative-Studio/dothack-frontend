import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'

export const metadata = {
  title: 'Access Denied - DotHack',
  description: 'You do not have permission to access this page',
}

export default function UnauthorizedPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-red-100">
            <svg
              className="h-10 w-10 text-red-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>
          <CardTitle className="text-2xl">Access Denied</CardTitle>
          <CardDescription>
            You don't have permission to access this page
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="rounded-lg bg-gray-50 border border-gray-200 p-4">
            <h3 className="font-medium text-gray-900 mb-2">Why am I seeing this?</h3>
            <ul className="text-sm text-gray-600 space-y-1 list-disc list-inside">
              <li>You may not have the required role for this hackathon</li>
              <li>This page may be restricted to organizers only</li>
              <li>Your account may not be enrolled in this hackathon</li>
            </ul>
          </div>

          <div className="rounded-lg bg-blue-50 border border-blue-200 p-4">
            <h3 className="font-medium text-blue-900 mb-2">What can I do?</h3>
            <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
              <li>Contact the hackathon organizer for access</li>
              <li>Check if you're enrolled in the correct hackathon</li>
              <li>Verify your role assignment</li>
            </ul>
          </div>
        </CardContent>

        <CardFooter className="flex flex-col gap-2">
          <Button asChild className="w-full">
            <Link href="/hackathons">Back to Hackathons</Link>
          </Button>
          <Button asChild variant="outline" className="w-full">
            <Link href="/">Go to Homepage</Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
