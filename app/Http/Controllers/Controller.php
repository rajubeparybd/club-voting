<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response as InertiaResponse;

abstract class Controller
{
    /**
     * Check if the user has the given ability.
     *
     * @param string $ability
     * @param Request $request
     * @param bool $redirect
     * @param string $route
     * @param string $message
     * @return RedirectResponse | InertiaResponse | void
     */
    public function checkAuthorization($ability, Request $request, $redirect = false, $route = 'admin.dashboard', $message = 'You do not have permission to view this page.')
    {
        $response = false;

        if (!$request->user()->hasPermissionTo($ability)) {
            if (!$redirect) {
                $response = Inertia::render('errors/403')->with('error', $message);
            } else {
                $response = to_route($route)->with('error', $message);
            }
        }

        return $response;
    }
}
