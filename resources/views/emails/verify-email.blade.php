@component('mail::message')
Hello <strong>{{ $user->name }}</strong>,

Thank you for registering with {{ config('app.name') }}!

Please click the button below to verify your email address and access all features.

<x-mail::button :url="$url">
Verify Email Address
</x-mail::button>

If you did not create an account, no further action is required.

Thanks,<br>
<strong>{{ config('app.name') }} Team</strong>
@endcomponent
