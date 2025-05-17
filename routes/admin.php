<?php

use App\Http\Controllers\ActivityController;
use App\Http\Controllers\Admin\ClubController;
use App\Http\Controllers\Admin\NominationApplicationController;
use App\Http\Controllers\Admin\NominationController;
use App\Http\Controllers\Admin\PaymentMethodController;
use App\Http\Controllers\Admin\RoleController;
use App\Http\Controllers\Admin\Settings\PasswordController;
use App\Http\Controllers\Admin\Settings\ProfileController;
use App\Http\Controllers\Admin\UserController;
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

// User management
Route::resource('users', UserController::class);
Route::post('users/{user}/roles', [UserController::class, 'updateRoles'])->name('users.roles.update');

// Role management
Route::resource('roles', RoleController::class);

// Activity logs
Route::get('activities', [ActivityController::class, 'index'])->name('activities.index');

Route::resource('nominations', NominationController::class);
Route::get('clubs/{club}/positions', [NominationController::class, 'getClubPositions'])
    ->name('clubs.positions');

// Nomination Application routes
Route::resource('applications', NominationApplicationController::class);
Route::post('applications/batch-update', [NominationApplicationController::class, 'batchUpdate'])
    ->name('applications.batch-update');

// Payment methods
Route::resource('payment-methods', PaymentMethodController::class);
