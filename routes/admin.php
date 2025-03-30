<?php

use App\Http\Controllers\ActivityController;
use App\Http\Controllers\Admin\ClubController;
use App\Http\Controllers\Admin\NominationController;
use App\Http\Controllers\Admin\PaymentMethodController;
use App\Http\Controllers\Admin\RoleController;
use App\Http\Controllers\Admin\Settings\PasswordController;
use App\Http\Controllers\Admin\Settings\ProfileController;
use App\Http\Controllers\Admin\UserController;
use App\Http\Controllers\Admin\VotingEventController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::redirect('/', 'dashboard')->name('index');

Route::get('dashboard', function () {
    return Inertia::render('admin/dashboard');
})->name('dashboard');

Route::prefix('settings')->name('settings.')->group(function () {
    Route::redirect('/', 'profile')->name('index');

    Route::get('profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('profile', [ProfileController::class, 'destroy'])->name('profile.destroy');

    Route::get('password', [PasswordController::class, 'edit'])->name('password.edit');
    Route::put('password', [PasswordController::class, 'update'])->name('password.update');

    Route::get('appearance', function () {
        return Inertia::render('admin/settings/appearance');
    })->name('appearance');
});

Route::resource('clubs', ClubController::class);

// Club member management routes
Route::post('clubs/{club}/members/{user}/update-status', [ClubController::class, 'updateMemberStatus'])->name('clubs.members.update-status');
Route::post('clubs/{club}/members/{user}/update-position', [ClubController::class, 'updateMemberPosition'])->name('clubs.members.update-position');
Route::delete('clubs/{club}/members/{user}/remove', [ClubController::class, 'removeMember'])->name('clubs.members.remove');
Route::post('clubs/{club}/members/{user}/payment/{payment}/update-status', [ClubController::class, 'updatePaymentStatus'])->name('clubs.members.update-payment-status');
Route::post('clubs/{club}/members/add', [ClubController::class, 'addMembers'])->name('clubs.members.add');
Route::get('clubs/{club}/non-members', [ClubController::class, 'getNonMembers'])->name('clubs.non-members');

// User management
Route::resource('users', UserController::class);
Route::post('users/{user}/roles', [UserController::class, 'updateRoles'])->name('users.roles.update');
Route::put('users/{user}/status', [UserController::class, 'updateStatus'])->name('users.update-status');
Route::post('users/store-from-api', [UserController::class, 'storeFromApi'])->name('users.store-from-api');

// Role management
Route::resource('roles', RoleController::class);

// Activity logs
Route::get('activities', [ActivityController::class, 'index'])->name('activities.index');

Route::resource('nominations', NominationController::class);
Route::get('clubs/{club}/positions', [NominationController::class, 'getClubPositions'])
    ->name('clubs.positions');
Route::put('nominations/{nomination}/status', [NominationController::class, 'updateStatus'])
    ->name('nominations.update-status');

// Nomination Application routes
Route::put('applications/{application}/update', [NominationController::class, 'updateApplication'])
    ->name('applications.update');

// Payment methods
Route::resource('payment-methods', PaymentMethodController::class);

// Voting Events
Route::resource('voting-events', VotingEventController::class);
Route::put('voting-events/{votingEvent}/status', [VotingEventController::class, 'updateStatus'])
    ->name('voting-events.update-status');
Route::get('voting-events/{votingEvent}/check-ties', [VotingEventController::class, 'checkTies'])
    ->name('voting-events.check-ties');
