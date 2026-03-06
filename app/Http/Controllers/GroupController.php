<?php

namespace App\Http\Controllers;

use App\Models\Group;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class GroupController extends Controller
{
    public function index(Request $request): Response
    {
        $user = $request->user();

        $groupsQuery = Group::query()
            ->withCount('players')
            ->with(['coaches:id,name'])
            ->orderBy('name');

        if (! $user->isAdmin()) {
            $coach = $user->coach()->first();

            if (! $coach) {
                return Inertia::render('Groups/Index', [
                    'groups' => [],
                    'can' => [
                        'createGroup' => $user->can('gestionar tiras'),
                    ],
                ]);
            }

            $groupsQuery->whereHas('coaches', function ($query) use ($coach) {
                $query->where('coaches.id', $coach->id);
            });
        }

        return Inertia::render('Groups/Index', [
            'groups' => $groupsQuery->get(),
            'can' => [
                'createGroup' => $user->can('gestionar tiras'),
            ],
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        abort_unless($request->user()->can('gestionar tiras'), 403);

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255', 'unique:groups,name'],
            'schedule' => ['nullable', 'string', 'max:255'],
            'category_year' => ['required', 'integer', 'min:1990', 'max:2100'],
        ]);

        Group::create($validated);

        return back();
    }

    public function show(Request $request, Group $group): Response
    {
        $this->ensureUserCanAccessGroup($request->user(), $group);

        $group->load([
            'coaches:id,name',
            'players' => fn ($query) => $query->orderBy('nombre')->orderBy('apellido'),
        ]);

        return Inertia::render('Groups/Show', [
            'group' => $group,
            'can' => [
                'createPlayer' => $request->user()->can('crear jugadores'),
                'editPlayer' => $request->user()->can('editar jugadores'),
                'deletePlayer' => $request->user()->can('eliminar jugadores'),
            ],
        ]);
    }

    public function myPlayers(Request $request): Response
    {
        $user = $request->user();

        $groupsQuery = Group::query()
            ->with([
                'players' => fn ($query) => $query->orderBy('nombre')->orderBy('apellido'),
                'coaches:id,name',
            ])
            ->orderBy('name');

        if (! $user->isAdmin()) {
            $coach = $user->coach()->first();

            if (! $coach) {
                return Inertia::render('Players/MyPlayers', [
                    'groups' => [],
                ]);
            }

            $groupsQuery->whereHas('coaches', function ($query) use ($coach) {
                $query->where('coaches.id', $coach->id);
            });
        }

        return Inertia::render('Players/MyPlayers', [
            'groups' => $groupsQuery->get(),
        ]);
    }

    private function ensureUserCanAccessGroup(User $user, Group $group): void
    {
        if ($user->isAdmin()) {
            return;
        }

        $coach = $user->coach()->first();

        abort_unless(
            $coach && $group->coaches()->where('coaches.id', $coach->id)->exists(),
            403
        );
    }
}
