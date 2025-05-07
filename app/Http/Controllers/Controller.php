<?php

namespace App\Http\Controllers;

use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response as InertiaResponse;

abstract class Controller
{

    /**
     * Check if the user has the given ability.
     *
     * @param  string   $ability   The ability to check for.
     * @param  Request  $request   The request instance.
     * @param  bool     $redirect  Whether to redirect or not.
     * @param  string   $route     The route to redirect to if the user does not have the ability.
     * @param  string   $message   The message to show if the user does not have the ability.
     *
     * @return InertiaResponse | RedirectResponse
     */
    public function checkAuthorization(string $ability, Request $request, bool $redirect = false, string $route = 'admin.dashboard', string $message = 'You do not have permission to view this page.')
    {
        $response = false;

        if ( ! $request->user()->hasPermissionTo($ability)) {
            if ( ! $redirect) {
                $response = Inertia::render('errors/403')->with('error', $message);
            } else {
                $response = to_route($route)->with('error', $message);
            }
        }

        return $response;
    }

    /**
     * Log an activity.
     *
     * @param  string  $message  This is the message that will be logged.
     * @param  string  $event    This is the event that will be logged. Default is 'system'.
     */
    public function logActivity(string $message, string $event = 'system'): void
    {
        activity()
            ->causedBy(auth()->user())
            ->event($event)
            ->log($message);
    }

}
