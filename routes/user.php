<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use App\Http\Controllers\User\Settings\ProfileController;
use App\Http\Controllers\User\Settings\PasswordController;
use App\Http\Controllers\ActivityController;

Route::redirect('/', 'dashboard')->name('index');

Route::get('dashboard', function () {
    return Inertia::render('user/dashboard');
})->name('dashboard');

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