<?php
namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Support\MediaHelper;
use Illuminate\Auth\Events\Registered;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Illuminate\Validation\Rules;
use Inertia\Inertia;
use Inertia\Response;

class RegisteredUserController extends Controller
{

    /**
     * Store the registration data from the final step.
     */
    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'student_id'    => 'required|string|max:20|unique:' . User::class,
            'intake'        => 'required|string',
            'name'          => 'required|string|max:255',
            'email'         => 'required|string|lowercase|email|max:255|unique:' . User::class,
            'gender'        => 'required|in:M,F,O',
            'department_id' => 'required|exists:departments,id',
            'avatar'        => 'required|string',
            'password'      => ['required', 'confirmed', Rules\Password::defaults()],
        ]);

        $user = User::create([
            'student_id'    => $validated['student_id'],
            'intake'        => $validated['intake'],
            'name'          => $validated['name'],
            'email'         => $validated['email'],
            'gender'        => $validated['gender'],
            'department_id' => $validated['department_id'],
            'password'      => Hash::make($validated['password']),
        ]);

        // Handle avatar upload using the helper
        MediaHelper::addMediaFromBase64($user, $validated['avatar'], 'avatar', $user->student_id);

        $user->assignRole('user');

        event(new Registered($user));

        Auth::login($user);

        activity()
            ->causedBy($user)
            ->event('register')
            ->log('Register new account using this IP: ' . $request->ip());

        return to_route('verification.notice');
    }

    /**
     * Show the registration page.
     */
    public function create(): Response
    {
        return Inertia::render('auth/register');
    }

}
