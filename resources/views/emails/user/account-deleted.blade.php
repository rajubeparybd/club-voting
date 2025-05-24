@component('mail::message')
Hello <strong>{{ $user->name ?? 'there' }}</strong>!

<p>We regret to inform you that your account on {{ config('app.name') }} has been deleted by an administrator.</p>

<p>If you believe this was done in error or have any questions, please contact our support team at <a href="mailto:{{ config('app.support_email') }}">{{ config('app.support_email') }}</a>.</p>

<br>

Thanks,<br>
<strong>{{ config('app.name') }} Team</strong>
@endcomponent
