@component('mail::message')
Hello <strong>{{ $user->name ?? 'there' }}</strong>!

Your roles have been updated on {{ config('app.name') }}.

@component('mail::user-card', ['title' => 'Your Roles'])
**Roles:** {{ implode(', ', $roles) }}
@endcomponent

@component('mail::button', ['url' => route('user.dashboard'), 'color' => 'blue'])
View in Portal
@endcomponent

If you have any questions or need assistance, please don't hesitate to contact us.

Thanks,<br>
<strong>{{ config('app.name') }} Team</strong>

@slot('subcopy')
If you're having trouble clicking the "View in Portal" button, copy and paste the URL below into your web browser: <span class="break-all">[{{ route('user.dashboard') }}]({{ route('user.dashboard') }})</span>
@endslot
@endcomponent
