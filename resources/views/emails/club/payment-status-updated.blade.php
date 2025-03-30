@component('mail::message')
Hello <strong>{{ $user->name ?? 'there' }}</strong>!

@if($status === 'approved')
<p style="color: green;">Your payment has been approved and your membership is now active. Welcome to the club!</p>
@else
<p style="color: red;">Your payment has been rejected. Please contact the club office for more information or submit a new payment.</p>
@endif

@component('mail::user-card', ['title' => 'Your Payment Status'])
**Club:** {{ $club->name }}<br>
**Payment Status:** <strong>{{ ucfirst($status) }}</strong><br>
**Amount:** {{ number_format($payment->amount, 2) }} BDT<br>
**Payment Method:** {{ $payment->paymentMethod->name ?? 'N/A' }}<br>
**Transaction ID:** {{ $payment->transaction_id }}<br>
**Date:** {{ $payment->created_at->format('F j, Y') }}
@endcomponent

@component('mail::button', ['url' => route('user.clubs.index'), 'color' => 'blue'])
View Club
@endcomponent

If you have any questions or need assistance, please don't hesitate to contact the club office or send an email to <a href="mailto:{{ config('app.support_email') }}">{{ config('app.support_email') }}</a>.

Thanks,<br>
<strong>{{ config('app.name') }} Team</strong>

@slot('subcopy')
If you're having trouble clicking the "View Club" button, copy and paste the URL below into your web browser: <span class="break-all">[{{ route('user.clubs.index') }}]({{ route('user.clubs.index') }})</span>
@endslot
@endcomponent
