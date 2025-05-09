<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use App\Http\Controllers\Auth\StudentController;

Route::get('/', function () {
    return Inertia::render('welcome');
})->name('home');

require __DIR__.'/auth.php';

// Student API routes
Route::post('/verify-student', [StudentController::class, 'verifyStudent'])->name('verify-student');
