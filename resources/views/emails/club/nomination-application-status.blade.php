@component('mail::message')
# Hello {{ $user->name ?? 'there' }}!

@if($status === 'approved')
<p style="color: green;">Congratulations! Your application has been approved. You are now officially a candidate for this position.</p>
@elseif($status === 'rejected')
<p style="color: red;">We regret to inform you that your application has been rejected. If you have any questions, please contact the club administration.</p>
@else
<p>Your application is currently under review. We will notify you once a decision has been made.</p>
@endif

@component('mail::user-card', ['title' => 'Application Status'])
**Club:** {{ $club->name }}<br>
**Position:** {{ $position->name }}<br>
**Nomination:** {{ $nomination->title }}<br>
**Status:** <strong>{{ ucfirst($status) }}</strong>
@endcomponent

@if($application->admin_notes)
## Admin Notes
<div style="background-color: #e7e7e7; padding: 10px; border-radius: 5px;">
    {{ $application->admin_notes }}
</div>
@endif

@component('mail::button', ['url' => route('user.nominations.index'), 'color' => 'blue'])
View Applications
@endcomponent

If you have any questions or need assistance, please don't hesitate to contact us.

Thanks,<br>
<strong>{{ config('app.name') }} Team</strong>

@slot('subcopy')
If you're having trouble clicking the "View Applications" button, copy and paste the URL below into your web browser: <span class="break-all">[{{ route('user.nominations.index') }}]({{ route('user.nominations.index') }})</span>
@endslot
@endcomponent
