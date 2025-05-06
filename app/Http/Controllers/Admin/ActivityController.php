<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Resources\Admin\ActivityResource;
use App\Models\User;
use Illuminate\Http\Request;
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
        $activities = Activity::causedBy(User::find(auth()->id()))
            ->orderBy('created_at', 'desc')
            ->get();

        return Inertia::render('admin/activities/index', [
            'activities' => ActivityResource::collection($activities),
            'events' => [...$activities->pluck('event')->unique()],
        ]);
    }

}
