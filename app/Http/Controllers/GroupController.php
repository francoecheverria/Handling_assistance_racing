<?php

namespace App\Http\Controllers;

use App\Models\Category;
use App\Models\Coach;
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
            ->with(['coaches:id,name', 'categories:id,group_id,category_year'])
            ->orderBy('name');

        if (! $user->isAdmin()) {
            $coach = $user->coach()->first();

            if (! $coach) {
                return Inertia::render('Groups/Index', [
                    'groups' => [],
                    'coaches' => Coach::query()->select('id', 'name')->orderBy('name')->get(),
                    'can' => [
                        'createGroup' => $user->can('gestionar tiras'),
                        'deleteGroup' => $user->can('gestionar tiras'),
                    ],
                ]);
            }

            $groupsQuery->whereHas('coaches', function ($query) use ($coach) {
                $query->where('coaches.id', $coach->id);
            });
        }

        $coaches = Coach::query()->select('id', 'name')->orderBy('name')->get();

        return Inertia::render('Groups/Index', [
            'groups' => $groupsQuery->get(),
            'coaches' => $coaches,
            'can' => [
                'createGroup' => $user->can('gestionar tiras'),
                'deleteGroup' => $user->can('gestionar tiras'),
            ],
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        abort_unless($request->user()->can('gestionar tiras'), 403);

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255', 'unique:groups,name'],
            'schedule' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string', 'max:5000'],
            'categories' => ['required', 'array', 'min:1'],
            'categories.*' => ['required', 'integer', 'min:1990', 'max:2100'],
            'coach_ids' => ['nullable', 'array'],
            'coach_ids.*' => ['integer', 'exists:coaches,id'],
        ]);

        $categories = $validated['categories'];
        $coachIds = $validated['coach_ids'] ?? [];
        unset($validated['categories'], $validated['coach_ids']);

        $group = Group::create($validated);
        foreach ($categories as $year) {
            $group->categories()->create(['category_year' => $year]);
        }
        $group->coaches()->sync($coachIds);

        return back();
    }

    public function edit(Request $request, Group $group): Response
    {
        $this->ensureUserCanAccessGroup($request->user(), $group);

        $group->load('categories:id,group_id,category_year', 'coaches:id,name');

        return Inertia::render('Groups/Edit', [
            'group' => $group,
            'coaches' => Coach::query()->select('id', 'name')->orderBy('name')->get(),
        ]);
    }

    public function update(Request $request, Group $group): RedirectResponse
    {
        $this->ensureUserCanAccessGroup($request->user(), $group);

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255', 'unique:groups,name,' . $group->id],
            'schedule' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string', 'max:5000'],
            'categories' => ['required', 'array', 'min:1'],
            'categories.*' => ['required', 'integer', 'min:1990', 'max:2100'],
            'coach_ids' => ['nullable', 'array'],
            'coach_ids.*' => ['integer', 'exists:coaches,id'],
        ]);

        $categoryYears = array_values(array_unique($validated['categories']));
        sort($categoryYears);
        $coachIds = $validated['coach_ids'] ?? [];
        unset($validated['categories'], $validated['coach_ids']);

        $group->update($validated);

        $existingYears = $group->categories()->pluck('category_year')->all();
        $toAdd = array_diff($categoryYears, $existingYears);
        $toRemove = array_diff($existingYears, $categoryYears);

        foreach ($toAdd as $year) {
            $group->categories()->create(['category_year' => $year]);
        }
        $group->categories()->whereIn('category_year', $toRemove)->delete();

        $group->coaches()->sync($coachIds);

        return redirect()->route('groups.show', $group);
    }

    public function show(Request $request, Group $group): Response
    {
        $this->ensureUserCanAccessGroup($request->user(), $group);

        $group->load([
            'coaches:id,name',
            'categories' => fn ($query) => $query->orderBy('category_year')->with([
                'players' => fn ($q) => $q->orderBy('nombre')->orderBy('apellido'),
            ]),
        ]);

        return Inertia::render('Groups/Show', [
            'group' => $group,
            'coaches' => Coach::query()->select('id', 'name')->orderBy('name')->get(),
            'can' => [
                'createPlayer' => $request->user()->can('crear jugadores'),
                'editPlayer' => $request->user()->can('editar jugadores'),
                'deletePlayer' => $request->user()->can('eliminar jugadores'),
                'deleteGroup' => $request->user()->can('gestionar tiras'),
            ],
        ]);
    }

    public function destroy(Request $request, Group $group): RedirectResponse
    {
        abort_unless($request->user()->can('gestionar tiras'), 403);
        $this->ensureUserCanAccessGroup($request->user(), $group);

        $group->attendanceSessions->each(fn ($session) => $session->records()->delete());
        $group->attendanceSessions()->delete();
        $group->coaches()->detach();
        $group->delete();

        return redirect()->route('groups.index');
    }

    public function myPlayers(Request $request): Response
    {
        $user = $request->user();

        $groupsQuery = Group::query()
            ->with([
                'categories' => fn ($query) => $query->orderBy('category_year')->with([
                    'players' => fn ($q) => $q->orderBy('nombre')->orderBy('apellido'),
                ]),
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
