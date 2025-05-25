<?php
namespace App\Http\Controllers\User;

use App\Http\Controllers\Controller;
use App\Models\Club;
use App\Models\Nomination;
use App\Models\NominationApplication;
use App\Models\PaymentMethod;
use App\Models\User;
use App\Models\Vote;
use App\Models\VotingEvent;
use Illuminate\Support\Facades\DB;
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

            // Add positions and candidates count for active voting events too
            $votingEvent->positions_count = $votingEvent->club->positions()->where('is_active', true)->count();

            $latestNomination = $votingEvent->club->nominations()
                ->where('status', 'closed')
                ->orderBy('created_at', 'desc')
                ->first();

            $votingEvent->candidates_count = $latestNomination
            ? $latestNomination->applications()->where('status', 'approved')->count()
            : 0;
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

    public function landingPage()
    {
        // Get active clubs (limited to 4 for home page)
        $activeClubs = Club::where('status', 'active')
            ->with(['positions' => function ($query) {
                $query->where('is_active', true);
            }])
            ->limit(4)
            ->get();

        // Get all upcoming nominations
        $upcomingNominations = Nomination::with(['club'])
            ->where('status', 'active')
            ->where('start_date', '>', now())
            ->orderBy('start_date', 'asc')
            ->limit(5)
            ->get();

        // Get all active nominations
        $activeNominations = Nomination::with(['club'])
            ->where('status', 'active')
            ->where('start_date', '<=', now())
            ->where('end_date', '>=', now())
            ->orderBy('end_date', 'asc')
            ->limit(5)
            ->get();

        // Get all upcoming voting events
        $upcomingVotingEvents = VotingEvent::with(['club'])
            ->where('status', 'active')
            ->where('start_date', '>', now())
            ->orderBy('start_date', 'asc')
            ->limit(5)
            ->get();

        // Add positions and candidates count for upcoming voting events
        $upcomingVotingEvents->each(function ($event) {
            // Get active positions for this club
            $event->positions_count = $event->club->positions()->where('is_active', true)->count();

            // Get the latest nomination for this club
            $latestNomination = $event->club->nominations()
                ->where('status', 'closed')
                ->orderBy('created_at', 'desc')
                ->first();

            // Count approved candidates from the latest nomination
            $event->candidates_count = $latestNomination
            ? $latestNomination->applications()->where('status', 'approved')->count()
            : 0;
        });

        // Get all active voting events
        $activeVotingEvents = VotingEvent::with(['club'])
            ->where('status', 'active')
            ->where('start_date', '<=', now())
            ->where('end_date', '>=', now())
            ->orderBy('end_date', 'asc')
            ->limit(5)
            ->get();

        // Add positions and candidates count for active voting events
        $activeVotingEvents->each(function ($event) {
            // Get active positions for this club
            $event->positions_count = $event->club->positions()->where('is_active', true)->count();

            // Get the latest nomination for this club
            $latestNomination = $event->club->nominations()
                ->where('status', 'closed')
                ->orderBy('created_at', 'desc')
                ->first();

            // Count approved candidates from the latest nomination
            $event->candidates_count = $latestNomination
            ? $latestNomination->applications()->where('status', 'approved')->count()
            : 0;
        });

        // Get real statistics for the hero section
        $totalActiveClubs        = Club::where('status', 'active')->count();
        $totalMembers            = User::where('student_id', '!=', null)->count();
        $totalCompletedElections = VotingEvent::where('status', 'closed')->count();

        // Calculate satisfaction rate based on user votes
        $uniqueVoters = DB::table('votes')
            ->select('user_id')
            ->distinct()
            ->count();
        $totalUsers        = User::count();
        $participationRate = $totalUsers > 0 ? ($uniqueVoters / $totalUsers) * 100 : 0;
        $satisfactionRate  = min(round($participationRate + 5), 100);

        // Pack statistics for the frontend
        $siteStats = [
            [
                'number' => $totalActiveClubs > 0 ? $totalActiveClubs . '+' : '0',
                'label'  => 'Active Clubs',
            ],
            [
                'number' => $totalMembers > 0 ? $totalMembers . '+' : '0',
                'label'  => 'Members',
            ],
            [
                'number' => (string) $totalCompletedElections,
                'label'  => 'Elections',
            ],
            [
                'number' => $satisfactionRate . '%',
                'label'  => 'Satisfaction',
            ],
        ];

        // System information
        $appInfo = [
            'name'        => config('app.name'),
            'version'     => config('app.version'),
            'description' => 'A comprehensive club voting and management platform for educational institutions and organizations.',
        ];

        return Inertia::render('welcome', [
            'activeClubs'          => $activeClubs,
            'upcomingNominations'  => $upcomingNominations,
            'activeNominations'    => $activeNominations,
            'upcomingVotingEvents' => $upcomingVotingEvents,
            'activeVotingEvents'   => $activeVotingEvents,
            'appInfo'              => $appInfo,
            'siteStats'            => $siteStats,
        ]);
    }
}
