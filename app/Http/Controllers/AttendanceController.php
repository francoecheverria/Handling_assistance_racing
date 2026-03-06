<?php

namespace App\Http\Controllers;

use App\Models\AttendanceRecord;
use App\Models\AttendanceSession;
use App\Models\Group;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class AttendanceController extends Controller
{
    public function index(Request $request): Response
    {
        $user = $request->user();

        $validated = $request->validate([
            'date_from' => ['nullable', 'date'],
            'date_to' => ['nullable', 'date'],
            'group_id' => ['nullable', 'integer', 'exists:groups,id'],
        ]);

        $sessionsQuery = AttendanceSession::query()
            ->with([
                'group:id,name,schedule',
                'takenByUser:id,name',
                'records.player:id,nombre,apellido,dni,group_id',
            ])
            ->latest('scheduled_at');

        $groupsQuery = Group::query()
            ->select('id', 'name')
            ->orderBy('name');

        if (! $user->isAdmin()) {
            $coach = $user->coach()->first();

            if (! $coach) {
                return Inertia::render('Attendances/Index', [
                    'sessions' => [],
                    'groups' => [],
                    'filters' => $validated,
                ]);
            }

            $sessionsQuery->whereHas('group.coaches', function ($query) use ($coach) {
                $query->where('coaches.id', $coach->id);
            });

            $groupsQuery->whereHas('coaches', function ($query) use ($coach) {
                $query->where('coaches.id', $coach->id);
            });
        }

        if (! empty($validated['date_from'])) {
            $sessionsQuery->whereDate('scheduled_at', '>=', $validated['date_from']);
        }

        if (! empty($validated['date_to'])) {
            $sessionsQuery->whereDate('scheduled_at', '<=', $validated['date_to']);
        }

        if (! empty($validated['group_id'])) {
            $sessionsQuery->where('group_id', $validated['group_id']);
        }

        return Inertia::render('Attendances/Index', [
            'sessions' => $sessionsQuery->get(),
            'groups' => $groupsQuery->get(),
            'filters' => $validated,
        ]);
    }

    public function storeOrOpenSession(Request $request): JsonResponse
    {
        abort_unless($request->user()->can('fichar asistencias'), 403);

        $validated = $request->validate([
            'group_id' => ['required', 'integer', 'exists:groups,id'],
            'scheduled_at' => ['required', 'date'],
        ]);

        $group = Group::query()->findOrFail($validated['group_id']);
        $this->ensureUserCanAccessGroup($request->user(), $group);

        $session = AttendanceSession::query()->firstOrCreate(
            [
                'group_id' => $group->id,
                'scheduled_at' => $validated['scheduled_at'],
            ],
            [
                'taken_by_user_id' => $request->user()->id,
            ]
        );

        $players = $group->players()->select('id')->get();
        $existingPlayerIds = $session->records()->pluck('player_id')->all();

        $pendingRecords = $players
            ->whereNotIn('id', $existingPlayerIds)
            ->map(fn ($player) => [
                'attendance_session_id' => $session->id,
                'player_id' => $player->id,
                'status' => 'pending',
                'notes' => null,
                'created_at' => now(),
                'updated_at' => now(),
            ])
            ->values()
            ->all();

        if ($pendingRecords !== []) {
            AttendanceRecord::query()->insert($pendingRecords);
        }

        $session->load([
            'group:id,name,schedule',
            'records.player:id,nombre,apellido,dni,group_id',
        ]);

        return response()->json([
            'session' => $session,
        ]);
    }

    public function bulkUpsertRecords(Request $request, AttendanceSession $session): JsonResponse
    {
        abort_unless(
            $request->user()->can('editar asistencias') || $request->user()->can('fichar asistencias'),
            403
        );

        $this->ensureUserCanAccessGroup($request->user(), $session->group);

        $validated = $request->validate([
            'records' => ['required', 'array', 'min:1'],
            'records.*.player_id' => ['required', 'integer', 'exists:players,id'],
            'records.*.status' => ['required', Rule::in(['pending', 'present', 'absent'])],
            'records.*.notes' => ['nullable', 'string'],
            'close_session' => ['nullable', 'boolean'],
        ]);

        $allowedPlayerIds = $session->group->players()->pluck('id')->all();

        foreach ($validated['records'] as $record) {
            if (! in_array((int) $record['player_id'], $allowedPlayerIds, true)) {
                abort(422, 'Hay jugadores que no pertenecen a esta tira.');
            }
        }

        $upsertData = collect($validated['records'])
            ->map(fn ($record) => [
                'attendance_session_id' => $session->id,
                'player_id' => $record['player_id'],
                'status' => $record['status'],
                'notes' => $record['notes'] ?? null,
                'updated_at' => now(),
                'created_at' => now(),
            ])
            ->all();

        AttendanceRecord::query()->upsert(
            $upsertData,
            ['attendance_session_id', 'player_id'],
            ['status', 'notes', 'updated_at']
        );

        if (($validated['close_session'] ?? false) === true && $session->closed_at === null) {
            $session->update([
                'closed_at' => now(),
            ]);
        }

        return response()->json([
            'ok' => true,
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
