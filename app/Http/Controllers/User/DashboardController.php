<?php
namespace App\Http\Controllers\User;

use App\Http\Controllers\Controller;
use App\Models\Club;
use App\Models\Nomination;
use App\Models\NominationApplication;
use App\Models\PaymentMethod;
use Inertia\Inertia;

class DashboardController extends Controller
{
    public function index()
    {
        $userClubs = auth()->user()->clubs()->pluck('clubs.id');

        return Inertia::render('user/dashboard', [
            'clubs'          => Club::where('status', 'active')->with('users')->get(),
            'paymentMethods' => PaymentMethod::where('is_active', true)->get(),
            'nominations'    => Nomination::with(['club'])->whereIn('club_id', $userClubs)->where('status', 'active')->where('end_date', '>=', now())->get(),
            'applications'   => NominationApplication::where('user_id', auth()->user()->id)->with(['club', 'clubPosition', 'nomination'])->get(),
        ]);
    }
}
