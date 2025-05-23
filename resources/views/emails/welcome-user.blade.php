@component('mail::message')
Hello <strong>{{ $user->name ?? 'there' }}</strong>!

Your account has been successfully created on {{ config('app.name') }}.

@component('mail::user-card', ['title' => 'Your Login Credentials'])
**Email:** {{ $user->email }}<br>
**Password:** {{ $password }}
@endcomponent

For security reasons, we recommend changing your password after your first login.

@component('mail::button', ['url' => route('login'), 'color' => 'blue'])
Login to Your Account
@endcomponent

If you have any questions or need assistance, please don't hesitate to contact us.

Thanks,<br>
<strong>{{ config('app.name') }} Team</strong>

@slot('subcopy')
If you're having trouble clicking the "Login to Your Account" button, copy and paste the URL below into your web browser: <span class="break-all">[{{ route('login') }}]({{ route('login') }})</span>
@endslot
@endcomponent
