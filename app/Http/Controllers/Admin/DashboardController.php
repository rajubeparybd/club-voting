<?php
namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Club;
use App\Models\Nomination;
use App\Models\NominationApplication;
use App\Models\User;
use App\Models\Vote;
use App\Models\VotingEvent;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    // Cache TTL in minutes
    private const CACHE_TTL = 60;

    /**
     * Display the admin dashboard with stats.
     */
    public function index(Request $request): Response
    {
        // Get base statistics with caching
        $stats = Cache::remember('admin.dashboard.stats', self::CACHE_TTL, function () {
            return $this->getBaseStatistics();
        });

        // Get last events statistics with caching
        $lastEventStats = Cache::remember('admin.dashboard.last_events', self::CACHE_TTL, function () {
            return $this->getLastEventsStatistics();
        });

        // Merge statistics
        $stats = array_merge($stats, $lastEventStats);

        // Get recent activities with caching
        $recentActivitiesWithCauser = Cache::remember('admin.dashboard.activities', self::CACHE_TTL / 6, function () {
            return $this->getRecentActivities();
        });

        // Get trend data with caching
        $trends = Cache::remember('admin.dashboard.trends', self::CACHE_TTL, function () {
            return [
                'votes' => $this->getMonthlyTrendData(Vote::class),
                'users' => $this->getMonthlyTrendData(User::class),
                'clubs' => $this->getMonthlyTrendData(Club::class),
            ];
        });

        // Return all stats to the view
        return Inertia::render('admin/dashboard', [
            'stats'            => $stats,
            'recentActivities' => $recentActivitiesWithCauser,
            'trends'           => $trends,
        ]);
    }

    /**
     * Get base statistics for the dashboard.
     */
    private function getBaseStatistics(): array
    {
        // Get counts for different entities
        $totalUsers        = User::count();
        $totalClubs        = Club::count();
        $totalVotingEvents = VotingEvent::count();
        $totalNominations  = Nomination::count();

        // Active clubs
        $activeClubs  = Club::where('status', 'active')->count();
        $pendingClubs = Club::where('status', 'pending')->count();

        // Active voting events
        $activeVotingEvents = VotingEvent::where('status', 'active')
            ->where('start_date', '<=', now())
            ->where('end_date', '>=', now())
            ->count();

        // Active nominations
        $activeNominations = Nomination::where('status', 'active')
            ->where('start_date', '<=', now())
            ->where('end_date', '>=', now())
            ->count();

        // Total votes cast
        $totalVotes = Vote::count();

        // Total candidates
        $totalCandidates = NominationApplication::where('status', 'approved')->count();

        // Calculate average votes per club
        $avgVotesPerClub = $totalClubs > 0 ? $totalVotes / $totalClubs : 0;

        // Calculate total participation rate
        $uniqueVoters = DB::table('votes')
            ->select('user_id')
            ->distinct()
            ->count();

        $participationRate = $totalUsers > 0 ? ($uniqueVoters / $totalUsers) * 100 : 0;

        return [
            'totalUsers'         => $totalUsers,
            'totalClubs'         => $totalClubs,
            'totalVotingEvents'  => $totalVotingEvents,
            'totalNominations'   => $totalNominations,
            'activeClubs'        => $activeClubs,
            'pendingClubs'       => $pendingClubs,
            'activeVotingEvents' => $activeVotingEvents,
            'activeNominations'  => $activeNominations,
            'totalVotes'         => $totalVotes,
            'totalCandidates'    => $totalCandidates,
            'avgVotesPerClub'    => $avgVotesPerClub,
            'participationRate'  => $participationRate,
        ];
    }

    /**
     * Get statistics for the last closed events.
     */
    private function getLastEventsStatistics(): array
    {
        $allLastClosedEvents   = [];
        $lastEventsVotes       = 0;
        $lastEventsCandidates  = 0;
        $clubsWithClosedEvents = 0;

        // Use a more efficient query to get closed events
        $lastClosedEvents = VotingEvent::with(['votes', 'nominationWinners.nomination.applications'])
            ->where('status', 'closed')
            ->orderBy('end_date', 'desc')
            ->get()
            ->groupBy('club_id');

        foreach ($lastClosedEvents as $clubId => $events) {
            if ($events->isEmpty()) {
                continue;
            }

            $clubsWithClosedEvents++;
            $lastClosedEvent       = $events->first();
            $allLastClosedEvents[] = $lastClosedEvent;

            // Count votes for this event
            $eventVotes = $lastClosedEvent->votes->count();
            $lastEventsVotes += $eventVotes;

            // Count candidates for this event
            $eventCandidates = 0;

            // First, try to find the nomination associated with this voting event via nomination_winners
            $nominationWinner = $lastClosedEvent->nominationWinners->first();

            if ($nominationWinner && $nominationWinner->nomination) {
                $eventCandidates = $nominationWinner->nomination->applications
                    ->where('status', 'approved')
                    ->count();

                $lastEventsCandidates += $eventCandidates;
            } else {
                // Use a more efficient query to count unique nomination applications with votes
                $candidatesCount = $lastClosedEvent->votes()
                    ->distinct('nomination_application_id')
                    ->count('nomination_application_id');

                $lastEventsCandidates += $candidatesCount;
            }
        }

        // Calculate last events engagement rate
        $lastEventsEngagement = 0;
        if ($clubsWithClosedEvents > 0 && User::count() > 0) {
            $lastEventsEngagement = ($lastEventsVotes / (User::count() * $clubsWithClosedEvents)) * 100;
        }

        return [
            'lastClosedNominationVotes'      => $lastEventsVotes,
            'lastClosedNominationCandidates' => $lastEventsCandidates,
            'clubsWithClosedEvents'          => $clubsWithClosedEvents,
            'lastEventsEngagement'           => $lastEventsEngagement,
        ];
    }

    /**
     * Get recent activities with user information.
     */
    private function getRecentActivities(): array
    {
        // Recent activities - last 5 activities
        $recentActivities = DB::table('activity_log')
            ->select('description', 'event', 'causer_id', 'created_at')
            ->orderBy('created_at', 'desc')
            ->limit(5)
            ->get();

        // Get all causer IDs to perform a single query for users
        $causerIds = $recentActivities->pluck('causer_id')->filter()->unique()->toArray();
        $users     = User::findMany($causerIds)->keyBy('id');

        // Map activities with causer info
        return $recentActivities->map(function ($activity) use ($users) {
            $causer = null;
            if ($activity->causer_id && isset($users[$activity->causer_id])) {
                $causer = $users[$activity->causer_id];
            }

            return [
                'description' => $activity->description,
                'event'       => $activity->event,
                'causer'      => $causer ? [
                    'id'     => $causer->id,
                    'name'   => $causer->name,
                    'avatar' => $causer->avatar,
                ] : null,
                'created_at'  => $activity->created_at,
            ];
        })->toArray();
    }

    /**
     * Get monthly trend data for a model.
     */
    private function getMonthlyTrendData($model): array
    {
        // Get data for the last 6 months
        $data = [];
        for ($i = 5; $i >= 0; $i--) {
            $month = now()->subMonths($i);
            $count = $model::whereYear('created_at', $month->year)
                ->whereMonth('created_at', $month->month)
                ->count();

            $data[] = [
                'month' => $month->format('M'),
                'count' => $count,
            ];
        }

        return $data;
    }
}
