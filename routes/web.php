<?php

use App\Http\Controllers\Auth\StudentController;
use App\Http\Controllers\User\DashboardController;
use Illuminate\Support\Facades\Route;

Route::get('/', [DashboardController::class, 'landingPage'])->name('home');

require __DIR__ . '/auth.php';

// Student API routes
Route::post('/verify-student', [StudentController::class, 'verifyStudent'])->name('verify-student');
