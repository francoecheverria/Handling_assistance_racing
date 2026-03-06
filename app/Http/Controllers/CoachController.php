<?php

namespace App\Http\Controllers;

use App\Models\Coach;
use App\Models\Group;
use App\Models\User;
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
            ->get()
            ->map(fn (Coach $c) => array_merge($c->toArray(), [
                'email' => $c->user?->email,
            ]));

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
            'email' => ['required', 'string', 'email', 'max:255', 'unique:users,email'],
            'password' => ['required', 'string', 'min:8', 'confirmed'],
            'group_ids' => ['nullable', 'array'],
            'group_ids.*' => ['integer', 'exists:groups,id'],
        ]);

        $groupIds = $validated['group_ids'] ?? [];
        unset($validated['group_ids'], $validated['password_confirmation']);

        $password = $validated['password'];
        unset($validated['password']);

        $user = User::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'password' => $password,
        ]);
        $user->assignRole('profesor');

        $coach = Coach::create([
            'name' => $validated['name'],
            'phone' => $validated['phone'] ?? null,
            'user_id' => $user->id,
        ]);
        $coach->groups()->sync($groupIds);

        return back();
    }

    public function update(Request $request, Coach $coach): RedirectResponse
    {
        abort_unless($request->user()->can('gestionar profesores'), 403);

        $user = $coach->user;
        $rules = [
            'name' => ['required', 'string', 'max:255'],
            'phone' => ['nullable', 'string', 'max:50'],
            'group_ids' => ['nullable', 'array'],
            'group_ids.*' => ['integer', 'exists:groups,id'],
            'password' => ['nullable', 'string', 'min:8', 'confirmed'],
        ];
        if ($user) {
            $rules['email'] = ['required', 'string', 'email', 'max:255', 'unique:users,email,' . $user->id];
        } else {
            $rules['email'] = ['nullable', 'string', 'email', 'max:255', 'unique:users,email'];
            $rules['password'][] = 'required_with:email';
        }

        $validated = $request->validate($rules);

        $groupIds = $validated['group_ids'] ?? [];
        unset($validated['group_ids'], $validated['password_confirmation']);

        $coach->update([
            'name' => $validated['name'],
            'phone' => $validated['phone'] ?? null,
        ]);
        $coach->groups()->sync($groupIds);

        if ($user) {
            $user->name = $validated['name'];
            $user->email = $validated['email'];
            if (! empty($validated['password'] ?? null)) {
                $user->password = $validated['password'];
            }
            $user->save();
        } elseif (! empty($validated['email'] ?? null) && ! empty($validated['password'] ?? null)) {
            $newUser = User::create([
                'name' => $validated['name'],
                'email' => $validated['email'],
                'password' => $validated['password'],
            ]);
            $newUser->assignRole('profesor');
            $coach->update(['user_id' => $newUser->id]);
        }

        return back();
    }

    public function destroy(Request $request, Coach $coach): RedirectResponse
    {
        abort_unless($request->user()->can('gestionar profesores'), 403);

        $coach->delete();

        return back();
    }
}
