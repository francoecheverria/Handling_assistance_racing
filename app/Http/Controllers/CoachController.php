<?php

namespace App\Http\Controllers;

use App\Models\Coach;
use App\Models\Group;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class CoachController extends Controller
{
    public function index(Request $request): Response
    {
        abort_unless($request->user()->can('gestionar profesores'), 403);

        $coaches = Coach::query()
            ->with(['user:id,email,name', 'groups:id,name'])
            ->orderBy('name')
            ->get();

        $groups = Group::query()
            ->orderBy('name')
            ->get(['id', 'name']);

        return Inertia::render('Coaches/Index', [
            'coaches' => $coaches,
            'groups' => $groups,
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        abort_unless($request->user()->can('gestionar profesores'), 403);

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'phone' => ['nullable', 'string', 'max:50'],
            'group_ids' => ['nullable', 'array'],
            'group_ids.*' => ['integer', 'exists:groups,id'],
        ]);

        $groupIds = $validated['group_ids'] ?? [];
        unset($validated['group_ids']);

        $coach = Coach::create($validated);
        $coach->groups()->sync($groupIds);

        return back();
    }

    public function update(Request $request, Coach $coach): RedirectResponse
    {
        abort_unless($request->user()->can('gestionar profesores'), 403);

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'phone' => ['nullable', 'string', 'max:50'],
            'group_ids' => ['nullable', 'array'],
            'group_ids.*' => ['integer', 'exists:groups,id'],
        ]);

        $groupIds = $validated['group_ids'] ?? [];
        unset($validated['group_ids']);

        $coach->update($validated);
        $coach->groups()->sync($groupIds);

        return back();
    }

    public function destroy(Request $request, Coach $coach): RedirectResponse
    {
        abort_unless($request->user()->can('gestionar profesores'), 403);

        $coach->delete();

        return back();
    }
}
