@component('mail::message')
Hello <strong>{{ $user->name ?? 'there' }}</strong>!

Your club member manual position has been updated on {{ config('app.name') }}.

@component('mail::user-card', ['title' => 'Your Club Member Position'])
**Club:** {{ $club->name }}<br>
**Manual Position:** {{ $position->name }}
@endcomponent

@component('mail::button', ['url' => route('user.clubs.index'), 'color' => 'blue'])
View Club
@endcomponent

If you have any questions or need assistance, please don't hesitate to contact us.

Thanks,<br>
<strong>{{ config('app.name') }} Team</strong>

@slot('subcopy')
If you're having trouble clicking the "View Club" button, copy and paste the URL below into your web browser: <span class="break-all">[{{ route('user.clubs.index') }}]({{ route('user.clubs.index') }})</span>
@endslot
@endcomponent
