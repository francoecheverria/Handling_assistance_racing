<?php

namespace App\Http\Controllers;

use App\Models\Group;
use App\Models\Player;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

class PlayerController extends Controller
{
    public function store(Request $request, Group $group): RedirectResponse
    {
        $this->ensureUserCanManageGroup($request->user(), $group, 'crear jugadores');

        $validated = $request->validate([
            'category_id' => ['required', 'integer', 'exists:categories,id'],
            'nombre' => ['required', 'string', 'max:255'],
            'apellido' => ['nullable', 'string', 'max:255'],
            'dni' => ['required', 'string', 'max:50', 'unique:players,dni'],
            'numero_socio' => ['nullable', 'string', 'max:100'],
            'fecha_nacimiento' => ['nullable', 'date'],
            'medical_check' => ['boolean'],
            'imagen_compromiso' => ['boolean'],
            'registered' => ['boolean'],
            'scholarship' => ['nullable', 'string', 'max:255'],
            'telefono' => ['nullable', 'string', 'max:50'],
            'mail' => ['nullable', 'email', 'max:255'],
            'notes' => ['nullable', 'string'],
        ]);

        $this->ensureCategoryBelongsToGroup($group, (int) $validated['category_id']);
        Player::create($validated);

        return back();
    }

    public function update(Request $request, Group $group, Player $player): RedirectResponse
    {
        $this->ensurePlayerBelongsToGroup($group, $player);
        $this->ensureUserCanManageGroup($request->user(), $group, 'editar jugadores');

        $validated = $request->validate([
            'category_id' => ['nullable', 'integer', 'exists:categories,id'],
            'nombre' => ['required', 'string', 'max:255'],
            'apellido' => ['nullable', 'string', 'max:255'],
            'dni' => ['required', 'string', 'max:50', 'unique:players,dni,'.$player->id],
            'numero_socio' => ['nullable', 'string', 'max:100'],
            'fecha_nacimiento' => ['nullable', 'date'],
            'medical_check' => ['boolean'],
            'imagen_compromiso' => ['boolean'],
            'registered' => ['boolean'],
            'scholarship' => ['nullable', 'string', 'max:255'],
            'telefono' => ['nullable', 'string', 'max:50'],
            'mail' => ['nullable', 'email', 'max:255'],
            'notes' => ['nullable', 'string'],
        ]);

        if (isset($validated['category_id'])) {
            $this->ensureCategoryBelongsToGroup($group, (int) $validated['category_id']);
        } else {
            $validated['category_id'] = $player->category_id;
        }
        $player->update($validated);

        return back();
    }

    public function destroy(Request $request, Group $group, Player $player): RedirectResponse
    {
        $this->ensurePlayerBelongsToGroup($group, $player);
        $this->ensureUserCanManageGroup($request->user(), $group, 'eliminar jugadores');

        $player->delete();

        return back();
    }

    private function ensurePlayerBelongsToGroup(Group $group, Player $player): void
    {
        $player->load('category');
        abort_unless($player->category && (int) $player->category->group_id === (int) $group->id, 404);
    }

    private function ensureCategoryBelongsToGroup(Group $group, int $categoryId): void
    {
        $category = \App\Models\Category::query()->find($categoryId);
        abort_unless($category && (int) $category->group_id === (int) $group->id, 404);
    }

    private function ensureUserCanManageGroup(User $user, Group $group, string $permission): void
    {
        abort_unless($user->can($permission), 403);

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
