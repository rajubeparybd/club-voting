<?php
namespace App\Http\Controllers\User;

use App\Http\Controllers\Controller;
use App\Models\Club;
use App\Models\PaymentLog;
use App\Models\PaymentMethod;
use App\Support\MediaHelper;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class ClubMembershipController extends Controller
{
    /**
     * Display a listing of the clubs.
     */
    public function index()
    {
        $user = auth()->user();

        $clubs = Club::where('status', 'active')
            ->withCount('users as members_count')
            ->with(['users' => function ($query) use ($user) {
                $query->where('user_id', $user->id);
            }])
            ->paginate(9);

        $paymentMethods = PaymentMethod::where('is_active', true)->get();

        return Inertia::render('user/clubs/index', [
            'clubs'          => $clubs,
            'paymentMethods' => $paymentMethods,
        ]);
    }

    /**
     * Display a specific club details.
     */
    public function show(Club $club)
    {
        //
    }

    /**
     * Join a club by making a payment
     */
    public function join(Request $request)
    {
        $validated = $request->validate([
            'club_id'               => 'required|exists:clubs,id',
            'payment_method_id'     => 'required|exists:payment_methods,id',
            'transaction_id'        => 'required|string',
            'transaction_amount'    => 'required|numeric|min:0',
            'sender_account_number' => 'required|string',
            'screenshot'            => 'required|string',
        ]);

        // Check if user is already a member of this club
        $club     = Club::findOrFail($validated['club_id']);
        $user     = auth()->user();
        $isMember = $club->users()->where('user_id', $user->id)->exists();

        if ($isMember) {
            return back()->with('error', 'You are already a member of this club.');
        }

        try {
            DB::beginTransaction();

            // Create payment log
            $paymentLog = PaymentLog::create([
                'user_id'               => $user->id,
                'club_id'               => $validated['club_id'],
                'payment_method_id'     => $validated['payment_method_id'],
                'transaction_id'        => $validated['transaction_id'],
                'amount'                => $validated['transaction_amount'],
                'sender_account_number' => $validated['sender_account_number'],
                'status'                => 'pending',
            ]);

            // Add payment screenshot using media library
            if (! empty($validated['screenshot'])) {
                MediaHelper::addMediaFromBase64(
                    $paymentLog,
                    $validated['screenshot'],
                    'payment_screenshots',
                    'payment_' . $user->id . '_' . time()
                );
            }

            // Add user to club with pending status
            $club->users()->attach($user->id, [
                'status'    => 'pending',
                'joined_at' => now(),
            ]);

            DB::commit();

            $this->logActivity(sprintf('Submitted payment for joining %s club', $club->name), 'club');

            return redirect()->route('user.dashboard')->with('success', 'Your club membership request has been submitted and is pending approval.');

        } catch (\Exception $e) {
            DB::rollBack();
            return back()->with('error', 'An error occurred: ' . $e->getMessage());
        }
    }
}
