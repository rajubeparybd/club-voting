<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Http\Resources\Admin\ActivityResource;
use App\Models\User;
use Inertia\Inertia;
use Inertia\Response;
use Spatie\Activitylog\Models\Activity;

class ActivityController extends Controller
{

    /**
     * Display a listing of the personal activities.
     */
    public function index(): Response
    {
        $permissions = auth()->user()->hasAllPermissions([
            'view_other_activities',
            'view_other_activity_details',
        ]);

        $personalActivities = Activity::causedBy(User::find(auth()->id()))
            ->orderBy('created_at', 'desc')
            ->get();

        $allActivities = $permissions
            ? Activity::orderBy('created_at', 'desc')->get()
            : NULL;

        return Inertia::render('common/activities/index', [
            'personalActivities' => ActivityResource::collection($personalActivities),

            'allUsersActivities'       => $permissions
                ? ActivityResource::collection($allActivities)
                : NULL,
            'personalActivitiesEvents' => [...$personalActivities->pluck('event')->unique()],
            'allUsersActivitiesEvents' => $permissions
                ? [...$allActivities->pluck('event')->unique()]
                : NULL,
            'canViewOtherActivities'   => $permissions,
        ]);
    }

}
