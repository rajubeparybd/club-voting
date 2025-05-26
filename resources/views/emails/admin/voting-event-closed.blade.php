@component('mail::message')
# Voting Event Closed Successfully

Dear {{ $user->name }},

The voting event **{{ $votingEvent->title }}** for the **{{ $club->name }}** club has been automatically closed as scheduled.

## Voting Event Details:
- **Title:** {{ $votingEvent->title }}
- **Club:** {{ $club->name }}
- **Start Date:** {{ $votingEvent->start_date->format('F j, Y \a\t g:i A') }}
- **End Date:** {{ $votingEvent->end_date->format('F j, Y \a\t g:i A') }}

@if(count($winners) > 0)
## Winners:
@foreach($winners as $positionId => $winner)
- **{{ $winner['position_name'] }}:** {{ $winner['user_name'] }} ({{ $winner['votes_count'] }} votes)
@endforeach
@else
No winners were determined for this voting event.
@endif

@component('mail::button', ['url' => route('admin.voting-events.show', $votingEvent->id)])
View Voting Event
@endcomponent

Thank you,<br>
{{ config('app.name') }}
@endcomponent
