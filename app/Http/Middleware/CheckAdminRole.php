<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Symfony\Component\HttpFoundation\Response;

class CheckAdminRole
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        if (!$user) {
            return redirect('/login');
        }

        $allRoles = $user->roles->filter(function ($role) {
                return str_starts_with($role->name, 'c_admin_');
            })->pluck('name')->toArray();

        if ($user->hasRole('admin') || $user->hasAnyRole($allRoles)) {
            return $next($request);
        }

        return redirect(route('user.dashboard'))->with('error', 'You do not have permission to access the admin panel.');
    }
}
