export type HackathonStatus = 'draft' | 'upcoming' | 'active' | 'judging' | 'completed' | 'cancelled'

export type Hackathon = {
  hackathon_id: string
  name: string
  description?: string
  organizer_id: string
  status: HackathonStatus
  start_date: string
  end_date: string
  location?: string
  registration_deadline?: string
  max_participants?: number
  website_url?: string
  logo_url?: string
  is_online?: boolean
  participant_count?: number
  prizes?: Record<string, any>
  rules?: string
  is_deleted?: boolean
  created_at: string
  updated_at: string
}

export type Track = {
  track_id: string
  hackathon_id: string
  name: string
  description: string
}

export type Participant = {
  participant_id: string
  name: string
  email: string
  org?: string
}

export type HackathonParticipant = {
  hackathon_id: string
  participant_id: string
  role: 'BUILDER' | 'JUDGE' | 'MENTOR' | 'ORGANIZER' | 'SPONSOR'
}

export type Team = {
  team_id: string
  hackathon_id: string
  name: string
  track_id?: string
}

export type TeamMember = {
  team_id: string
  participant_id: string
  role: 'LEAD' | 'MEMBER'
}

export type Project = {
  project_id: string
  hackathon_id: string
  team_id: string
  title: string
  one_liner?: string
  status: 'IDEA' | 'BUILDING' | 'SUBMITTED'
  repo_url?: string
  demo_url?: string
}

export type Submission = {
  submission_id: string
  project_id: string
  submitted_at: string
  submission_text: string
  artifact_links_json: string
}

export type Rubric = {
  rubric_id: string
  hackathon_id: string
  title: string
  criteria_json: string
}

export type Score = {
  score_id: string
  submission_id: string
  judge_participant_id: string
  score_json: string
  total_score: number
  feedback?: string
}

export type Prize = {
  prize_id: string
  hackathon_id: string
  title: string
  description: string
  amount: string
  rank: number
  track_id?: string
}

export type Invitation = {
  invitation_id: string
  hackathon_id: string
  email: string
  role: 'JUDGE' | 'MENTOR' | 'SPONSOR'
  status: 'PENDING' | 'ACCEPTED' | 'DECLINED'
  message?: string
  created_at: string
}

export type UserRole = 'ORGANIZER' | 'BUILDER' | 'JUDGE'
