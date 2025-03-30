@component('mail::message')
Hello <strong>{{ $user->name ?? 'there' }}</strong>!

<b>
@if($status === 'active')
<p style="color: green;">Your account has been activated on {{ config('app.name') }}.</p>
@elseif($status === 'inactive')
<p style="color: red;">Your account has been deactivated on {{ config('app.name') }}.</p>
@elseif($status === 'banned')
<p style="color: red;">Your account has been permanently banned on {{ config('app.name') }}. You will not be able to login to your account anymore.</p>
@endif
</b>

<br>
<br>

If you have any questions, please don't hesitate to contact us at <a href="mailto:{{ config('app.support_email') }}">{{ config('app.support_email') }}</a>.

Thanks,<br>
<strong>{{ config('app.name') }} Team</strong>

@slot('subcopy')
If you're having trouble clicking the "View in Portal" button, copy and paste the URL below into your web browser: <span class="break-all">[{{ route('user.dashboard') }}]({{ route('user.dashboard') }})</span>
@endslot
@endcomponent
