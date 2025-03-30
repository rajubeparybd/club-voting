<?php
namespace App\Http\Controllers\User;

use App\Http\Controllers\Controller;
use App\Models\Nomination;
use App\Models\NominationApplication;
use App\Notifications\User\NominationApplicationStatusUpdated;
use App\Support\MediaHelper;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class NominationController extends Controller
{
    /**
     * Display a listing of nominations.
     */
    public function index(Request $request)
    {
        // Get only active club memberships
        $userClubs = $request->user()->clubs()
            ->where('club_user.status', 'active')
            ->pluck('clubs.id');

        // Get active nominations for clubs where the user is an active member
        $nominations = Nomination::with(['club'])
            ->whereIn('club_id', $userClubs)
            ->where('status', 'active')
            ->where('end_date', '>=', now())
            ->get();

        $applications = NominationApplication::where('user_id', $request->user()->id)->with(['club', 'clubPosition', 'nomination'])->get();

        return Inertia::render('user/nominations/index', [
            'nominations'  => $nominations,
            'applications' => $applications,
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

    /**
     * Submit an application for a nomination.
     */
    public function apply(Request $request)
    {
        $validated = $request->validate([
            'nomination_id' => 'required|exists:nominations,id',
            'club_id'       => 'required|exists:clubs,id',
            'position_id'   => 'required|exists:club_positions,id',
            'statement'     => 'required|string|min:150',
            'cv'            => 'required|file|mimes:pdf,doc,docx|max:5120',
        ]);

        $user       = Auth::user();
        $nomination = Nomination::findOrFail($validated['nomination_id']);

        // Check if user is a member of the club
        $isMember = $user->clubs()
            ->where('clubs.id', $nomination->club_id)
            ->where('club_user.status', 'active')
            ->exists();

        if (! $isMember) {
            return back()->with('error', 'You must be an active member of this club to apply for positions.');
        }

        // Check if the position belongs to this nomination
        $positionExists = $nomination->club->positions()
            ->where('club_positions.id', $validated['position_id'])
            ->exists();

        if (! $positionExists) {
            return back()->with('error', 'The selected position is not available in this nomination.');
        }

        // Check if the user has already applied for this position
        $hasApplied = NominationApplication::where('user_id', $user->id)
            ->where('nomination_id', $nomination->id)
            ->where('club_position_id', $validated['position_id'])
            ->exists();

        if ($hasApplied) {
            return back()->with('error', 'You have already applied for this position.');
        }

        try {
            DB::beginTransaction();

            // Create the application
            $application = NominationApplication::create([
                'user_id'          => $user->id,
                'nomination_id'    => $nomination->id,
                'club_id'          => $validated['club_id'],
                'club_position_id' => $validated['position_id'],
                'statement'        => $validated['statement'],
                'status'           => 'pending',
            ]);

            // Handle CV upload
            if ($request->hasFile('cv')) {
                MediaHelper::addMediaFromUpload(
                    $application,
                    $request->file('cv'),
                    'cv',
                    'cv_' . $user->id . '_' . time()
                );
            }

            DB::commit();

            $user->notify(new NominationApplicationStatusUpdated($application, 'pending'));

            $this->logActivity('Applied for position in ' . $nomination->club->name, 'nomination');

            return redirect()->route('user.nominations.index')
                ->with('success', 'Your application has been submitted successfully.');

        } catch (\Exception $e) {
            DB::rollBack();
            return back()->with('error', 'An error occurred: ' . $e->getMessage());
        }
    }
}
