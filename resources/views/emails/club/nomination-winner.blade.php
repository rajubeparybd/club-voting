@component('mail::message')
# Congratulations, {{ $user->name ?? 'there' }}!

You have been elected to a position in {{ $club->name }} through our recent club election.

@component('mail::user-card', ['title' => 'Election Results'])
**Club:** {{ $club->name }}<br>
**Position:** {{ $position->name }}<br>
**Election:** {{ $votingEvent->title }}<br>
**Votes Received:** {{ $votesCount }}
@endcomponent

This is a significant achievement, and we're excited to have you as part of the club's leadership.

@component('mail::button', ['url' => route('user.voting-events.show', $votingEvent->id), 'color' => 'blue'])
View Club
@endcomponent

If you have any questions about your new role or responsibilities, please contact the club office or send an email to <a href="mailto:{{ config('app.support_email') }}">{{ config('app.support_email') }}</a>.

Thanks,<br>
<strong>{{ config('app.name') }} Team</strong>

@slot('subcopy')
If you're having trouble clicking the "View Club" button, copy and paste the URL below into your web browser: <span class="break-all">[{{ route('user.clubs.show', $club->id) }}]({{ route('user.clubs.show', $club->id) }})</span>
@endslot
@endcomponent
