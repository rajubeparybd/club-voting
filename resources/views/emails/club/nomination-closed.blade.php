@component('mail::message')
# Nomination Period Closed

Dear {{ $user->name }},

This is to inform you that the nomination period for **{{ $nomination->title }}** in **{{ $club->name }}** has been automatically closed as it has reached its end date.

## Nomination Details:
- **Title:** {{ $nomination->title }}
- **Club:** {{ $club->name }}
- **Start Date:** {{ $nomination->start_date->format('F j, Y') }}
- **End Date:** {{ $nomination->end_date->format('F j, Y') }}
- **Total Applications:** {{ $nomination->applications->count() }}

Please review the applications and proceed with the election process as needed.

@component('mail::button', ['url' => route('admin.nominations.show', $nomination->id)])
View Nomination Details
@endcomponent

Thank you,<br>
{{ config('app.name') }} Team
@endcomponent
