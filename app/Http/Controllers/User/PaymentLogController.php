<?php
namespace App\Http\Controllers\User;

use App\Http\Controllers\Controller;
use App\Models\PaymentLog;
use Illuminate\Http\Request;
use Inertia\Inertia;

class PaymentLogController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $paymentLogs = PaymentLog::with(['club', 'paymentMethod'])
            ->where('user_id', auth()->id())
            ->orderBy('created_at', 'desc')
            ->get();

        return Inertia::render('user/payment-logs/index', [
            'paymentLogs' => $paymentLogs,
        ]);
    }
}
