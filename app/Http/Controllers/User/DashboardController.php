<?php
namespace App\Http\Controllers\User;

use App\Http\Controllers\Controller;
use App\Models\Club;
use App\Models\PaymentMethod;
use Inertia\Inertia;

class DashboardController extends Controller
{
    public function index()
    {
        return Inertia::render('user/dashboard', [
            'clubs'          => Club::where('status', 'active')->with('users')->get(),
            'paymentMethods' => PaymentMethod::where('is_active', true)->get(),
        ]);
    }
}
