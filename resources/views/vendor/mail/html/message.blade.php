@component('mail::layout')
{{-- Header --}}
{{-- @slot('header')
@component('mail::header', ['url' => config('app.url')])

@endcomponent
@endslot --}}
<a href="{{ config('app.url') }}">
    <div style="display: flex; justify-content: center; align-items: center; gap: 10px; margin-bottom: 20px;">
    <img src="{{ asset('logo.svg') }}" alt="Logo" style="width: 52px;">
    <span style="font-size: 24px; font-weight: bold;">{{ config('app.name') }}</span>
</div>
</a>

{{-- Body --}}
{{ $slot }}

{{-- Subcopy --}}
@isset($subcopy)
@slot('subcopy')
@component('mail::subcopy')
{{ $subcopy }}
@endcomponent
@endslot
@endisset

{{-- Footer --}}
@slot('footer')
@component('mail::footer')
© {{ date('Y') }} {{ config('app.name') }}. All rights reserved.
@endcomponent
@endslot
@endcomponent
