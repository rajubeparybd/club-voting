<?php
namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\PaymentMethod;
use Illuminate\Http\Request;
use Inertia\Inertia;

class PaymentMethodController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $response = $this->checkAuthorization('view_payment_methods', $request);
        if ($response) {
            return $response;
        }

        return Inertia::render('admin/payment-methods/index', [
            'paymentMethods' => PaymentMethod::all(),
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        return back();
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $response = $this->checkAuthorization('create_payment_methods', $request);
        if ($response) {
            return $response;
        }

        $validated = $request->validate([
            'name'        => 'required|string|max:255',
            'description' => 'required|string',
            'type'        => 'required|string|in:manual,automatic',
            'provider'    => 'required|string|in:bkash,rocket,nagad,bank,cash',
            'is_active'   => 'required|boolean',
            'logo'        => 'required|image|mimes:jpeg,png,jpg,gif,svg|max:2048',
        ]);

        $paymentMethod = PaymentMethod::create($validated);

        if ($request->hasFile('logo')) {
            $paymentMethod->addMediaFromRequest('logo')->toMediaCollection('payment_methods');
        }

        $this->logActivity('Payment method created successfully', 'payment method');

        return redirect()->route('admin.payment-methods.index')->with('success', 'Payment method created successfully');
    }

    /**
     * Display the specified resource.
     */
    public function show(PaymentMethod $paymentMethod)
    {
        return back();
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(PaymentMethod $paymentMethod)
    {
        return back();
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, PaymentMethod $paymentMethod)
    {
        $response = $this->checkAuthorization('edit_payment_methods', $request);
        if ($response) {
            return $response;
        }

        $validated = $request->validate([
            'name'        => 'required|string|max:255',
            'description' => 'required|string',
            'type'        => 'required|string|in:manual,automatic',
            'provider'    => 'required|string|in:bkash,rocket,nagad,bank,cash',
            'is_active'   => 'required|boolean',
            'logo'        => 'nullable|image|mimes:jpeg,png,jpg,gif,svg|max:2048',
        ]);

        $paymentMethod->update($validated);

        if ($request->hasFile('logo')) {
            $paymentMethod->addMediaFromRequest('logo')->toMediaCollection('payment_methods');
        }

        $this->logActivity('Payment method updated successfully', 'payment method');

        return redirect()->route('admin.payment-methods.index')->with('success', 'Payment method updated successfully');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Request $request, PaymentMethod $paymentMethod)
    {
        $response = $this->checkAuthorization('delete_payment_methods', $request);
        if ($response) {
            return $response;
        }

        $paymentMethod->delete();

        $this->logActivity('Payment method deleted successfully', 'payment method');

        return redirect()->route('admin.payment-methods.index')->with('success', 'Payment method deleted successfully');
    }
}
