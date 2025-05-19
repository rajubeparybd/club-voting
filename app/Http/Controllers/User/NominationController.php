<?php
namespace App\Http\Controllers\User;

use App\Http\Controllers\Controller;
use App\Models\Nomination;
use Illuminate\Http\Request;
use Inertia\Inertia;

class NominationController extends Controller
{
    /**
     * Display a listing of nominations.
     */
    public function index(Request $request)
    {
        // Get user's club memberships
        $userClubs = $request->user()->clubs()->pluck('clubs.id');

        // Get active nominations for clubs where the user is a member
        $nominations = Nomination::with(['club'])
            ->whereIn('club_id', $userClubs)
            ->where('status', 'active')
            ->where('end_date', '>=', now())
            ->get();

        return Inertia::render('user/nominations/index', [
            'nominations' => $nominations,
        ]);
    }

    /**
     * Mark user as a candidate.
     */
    public function becomeCandidate(Request $request)
    {
        $user               = $request->user();
        $user->is_candidate = true;
        $user->save();

        return redirect()->route('user.nominations.index')
            ->with('success', 'You are now a candidate and can apply for nominations.');
    }
}
