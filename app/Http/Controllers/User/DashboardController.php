<?php
namespace App\Http\Controllers\User;

use App\Http\Controllers\Controller;
use App\Models\Club;
use App\Models\Nomination;
use App\Models\NominationApplication;
use App\Models\PaymentMethod;
use App\Models\Vote;
use App\Models\VotingEvent;
use Inertia\Inertia;

class DashboardController extends Controller
{
    public function index()
    {
        // Get only active club memberships
        $userClubs = auth()->user()->clubs()
            ->where('club_user.status', 'active')
            ->pluck('clubs.id');

        // Get active voting events for clubs where the user is an active member
        $activeVotingEvents = VotingEvent::with(['club'])
            ->whereIn('club_id', $userClubs)
            ->where('status', 'active')
            ->where('start_date', '<=', now())
            ->where('end_date', '>=', now())
            ->limit(3)
            ->get();

        // Get upcoming voting events
        $upcomingVotingEvents = VotingEvent::with(['club'])
            ->whereIn('club_id', $userClubs)
            ->where('status', 'active')
            ->where('start_date', '>', now())
            ->limit(1)
            ->get();

        $activeNominations = Nomination::with(['club'])
            ->whereIn('club_id', $userClubs)
            ->where('status', 'active')
            ->where('start_date', '<=', now())
            ->where('end_date', '>=', now())
            ->limit(3)
            ->get();

        $upcomingNominations = Nomination::with(['club'])
            ->whereIn('club_id', $userClubs)
            ->where('status', 'active')
            ->where('start_date', '>', now())
            ->limit(1)
            ->get();

        // Get user's votes
        $userVotes = Vote::where('user_id', auth()->user()->id)->get();

        // Group votes by voting event
        $votesByEvent = $userVotes->groupBy('voting_event_id');

        // Process voting events to check voting status
        $allEvents = $activeVotingEvents->concat($upcomingVotingEvents);

        foreach ($allEvents as $votingEvent) {
            // Check if user has voted for this event
            $votingEvent->has_voted_all = isset($votesByEvent[$votingEvent->id]);
            $votingEvent->has_any_votes = isset($votesByEvent[$votingEvent->id]) && $votesByEvent[$votingEvent->id]->count() > 0;
        }

        return Inertia::render('user/dashboard', [
            'clubs'                => Club::where('status', 'active')->with('users')->limit(3)->get(),
            'paymentMethods'       => PaymentMethod::where('is_active', true)->get(),
            'activeNominations'    => $activeNominations,
            'upcomingNominations'  => $upcomingNominations,
            'applications'         => NominationApplication::where('user_id', auth()->user()->id)->with(['club', 'clubPosition'])->get(),
            'activeVotingEvents'   => $activeVotingEvents,
            'upcomingVotingEvents' => $upcomingVotingEvents,
        ]);
    }
}
