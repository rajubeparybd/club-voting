<?php

use App\Http\Controllers\ActivityController;
use App\Http\Controllers\User\ClubMembershipController;
use App\Http\Controllers\User\DashboardController;
use App\Http\Controllers\User\Settings\PasswordController;
use App\Http\Controllers\User\Settings\ProfileController;
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
