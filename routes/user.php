<?php

use App\Http\Controllers\ActivityController;
use App\Http\Controllers\User\ClubMembershipController;
use App\Http\Controllers\User\DashboardController;
use App\Http\Controllers\User\NominationController;
use App\Http\Controllers\User\PaymentLogController;
use App\Http\Controllers\User\Settings\PasswordController;
use App\Http\Controllers\User\Settings\ProfileController;
use App\Http\Controllers\User\VotingEventController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::redirect('/', 'dashboard')->name('index');

Route::get('dashboard', [DashboardController::class, 'index'])->name('dashboard');

// Club Membership
Route::prefix('clubs')->name('clubs.')->group(function () {
    Route::get('/', [ClubMembershipController::class, 'index'])->name('index');
    Route::get('/{club}', [ClubMembershipController::class, 'show'])->name('show');
    Route::post('/join', [ClubMembershipController::class, 'join'])->name('join');
});

// Nominations
Route::prefix('nominations')->name('nominations.')->group(function () {
    Route::get('/', [NominationController::class, 'index'])->name('index');
    Route::post('/become-candidate', [NominationController::class, 'becomeCandidate'])->name('become-candidate');
    Route::post('/apply', [NominationController::class, 'apply'])->name('apply');
});

// Voting Events
Route::prefix('voting-events')->name('voting-events.')->group(function () {
    Route::get('/', [VotingEventController::class, 'index'])->name('index');
    Route::get('/{votingEvent}', [VotingEventController::class, 'show'])->name('show');
    Route::post('/vote', [VotingEventController::class, 'vote'])->name('vote');
});

Route::prefix('settings')->name('settings.')->group(function () {
    Route::redirect('/', 'profile')->name('index');

    Route::get('profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('profile', [ProfileController::class, 'destroy'])->name('profile.destroy');

    Route::get('password', [PasswordController::class, 'edit'])->name('password.edit');
    Route::put('password', [PasswordController::class, 'update'])->name('password.update');

    Route::get('appearance', function () {
        return Inertia::render('user/settings/appearance');
    })->name('appearance');
});

// Activity logs
Route::get('activities', [ActivityController::class, 'index'])->name('activities.index');

// Payment logs
Route::get('payment-logs', [PaymentLogController::class, 'index'])->name('payment-logs.index');
