<?php

namespace App\Http\Controllers\User\Settings;

use App\Http\Controllers\Controller;
use App\Http\Requests\User\Settings\ProfileUpdateRequest;
use App\Models\Department;
use App\Support\MediaHelper;
use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class ProfileController extends Controller
{

    /**
     * Show the user's profile settings page.
     */
    public function edit(Request $request): Response
    {
        return Inertia::render('user/settings/profile', [
            'mustVerifyEmail' => $request->user() instanceof MustVerifyEmail,
            'status'          => $request->session()->get('status'),
            'departments'     => Department::select('id', 'name')->orderBy('name')->get(),
        ]);
    }

    /**
     * Update the user's profile settings.
     */
    public function update(ProfileUpdateRequest $request): RedirectResponse
    {
        $validated = $request->validated();
        $user      = $request->user();

        // Handle the avatar file upload if present
        if ($request->hasFile('avatar_file')) {
            $media = MediaHelper::isValidBase64Image($validated['avatar'])
                ? MediaHelper::addMediaFromBase64($user, $validated['avatar'], 'avatar', $user->student_id)
                : MediaHelper::addMediaFromUpload($user, $request->file('avatar_file'), 'avatar', $user->student_id);
            unset($validated['avatar']);
            unset($validated['avatar_file']);
        }

        $user->fill($validated);

        if ($user->isDirty('email')) {
            $user->email_verified_at = NULL;
        }

        $user->save();

        return to_route('user.settings.profile.edit')->with('success', 'Profile updated successfully');
    }

    /**
     * Delete the user's account.
     */
    public function destroy(Request $request): RedirectResponse
    {
        $request->validate([
            'password' => ['required', 'current_password'],
        ]);

        $user = $request->user();

        Auth::logout();

        $user->delete();

        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return redirect('/');
    }

}
