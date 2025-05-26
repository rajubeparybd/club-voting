<?php

use App\Http\Controllers\Auth\StudentController;
use App\Http\Controllers\User\DashboardController;
use Illuminate\Support\Facades\Route;

Route::get('/', [DashboardController::class, 'landingPage'])->name('home');
Route::group(['prefix' => 'clubs', 'as' => 'clubs.'], function () {
    Route::get('/', [DashboardController::class, 'showAllClubs'])->name('index');
    Route::get('/{club}', [DashboardController::class, 'showClub'])->name('show');
    Route::get('/{club}/events/{votingEvent}/results', [DashboardController::class, 'showVotingEventResults'])->name('events.results');
});

require __DIR__ . '/auth.php';

// Student API routes
Route::post('/verify-student', [StudentController::class, 'verifyStudent'])->name('verify-student');

Route::get('/test', function () {
    $event = \App\Models\VotingEvent::find(8);
    $event->update(['status' => 'active']);
    return 'done';
});
