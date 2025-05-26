@component('mail::message')
# Action Required: Tie Detected in Voting Event

Dear {{ $user->name }},

A tie has been detected in the voting event **{{ $votingEvent->title }}** for the **{{ $club->name }}** club.

## Tie Details:
- **Position:** {{ $position->name }}
- **Votes:** {{ $voteCount }} votes each
- **Tied Candidates:**
@foreach($tiedCandidates as $candidate)
  - {{ $candidate['user']['name'] }} ({{ $candidate['user']['email'] }})
@endforeach

The automatic winner selection process has been halted due to this tie. **Manual intervention is required.**

Please log in to the admin panel to resolve this tie by manually selecting a winner or taking other appropriate action.

@component('mail::button', ['url' => route('admin.voting-events.show', $votingEvent->id)])
View Voting Event
@endcomponent

This voting event will remain in 'active' status until the tie is resolved.

Thank you,<br>
{{ config('app.name') }}
@endcomponent
