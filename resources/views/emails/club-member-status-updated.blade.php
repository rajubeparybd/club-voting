@component('mail::message')
Hello <strong>{{ $user->name ?? 'there' }}</strong>!

Your club member status has been updated on {{ config('app.name') }}.

@component('mail::user-card', ['title' => 'Your Club Member Status'])
**Club:** {{ $club->name }}<br>
**Status:** {{ $status }}
@endcomponent

@component('mail::button', ['url' => route('user.clubs.show'), 'color' => 'blue'])
View Club
@endcomponent

If you have any questions or need assistance, please don't hesitate to contact us.

Thanks,<br>
<strong>{{ config('app.name') }} Team</strong>

@slot('subcopy')
If you're having trouble clicking the "View Club" button, copy and paste the URL below into your web browser: <span class="break-all">[{{ route('user.clubs.show', $club->id) }}]({{ route('user.clubs.show', $club->id) }})</span>
@endslot
@endcomponent
