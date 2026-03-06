<?php

use App\Http\Controllers\AttendanceController;
use App\Http\Controllers\CoachController;
use App\Http\Controllers\GroupController;
use App\Http\Controllers\PlayerController;
use App\Http\Controllers\ProfileController;
use App\Models\Group;
use Illuminate\Foundation\Application;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('Welcome', [
        'canLogin' => Route::has('login'),
        'canRegister' => Route::has('register'),
        'laravelVersion' => Application::VERSION,
        'phpVersion' => PHP_VERSION,
    ]);
});

Route::get('/dashboard', function (Request $request) {
    $user = $request->user();

    $groupsQuery = Group::query()
        ->select('id', 'name', 'schedule')
        ->orderBy('name');

    if (! $user->isAdmin()) {
        $coach = $user->coach()->first();

        if ($coach) {
            $groupsQuery->whereHas('coaches', function ($query) use ($coach) {
                $query->where('coaches.id', $coach->id);
            });
        } else {
            $groupsQuery->whereRaw('1 = 0');
        }
    }

    return Inertia::render('Dashboard', [
        'groups' => $groupsQuery->get(),
    ]);
})->middleware(['auth', 'verified'])->name('dashboard');

// Ejemplos de rutas con roles/permisos (Spatie):
// ->middleware(['auth', 'role:admin'])
// ->middleware(['auth', 'permission:gestionar profesores'])
// ->middleware(['auth', 'role_or_permission:admin|gestionar tiras'])

Route::middleware('auth')->group(function () {
    Route::get('/profesores', [CoachController::class, 'index'])
        ->middleware('permission:gestionar profesores')
        ->name('coaches.index');
    Route::post('/profesores', [CoachController::class, 'store'])
        ->middleware('permission:gestionar profesores')
        ->name('coaches.store');
    Route::put('/profesores/{coach}', [CoachController::class, 'update'])
        ->middleware('permission:gestionar profesores')
        ->name('coaches.update');
    Route::delete('/profesores/{coach}', [CoachController::class, 'destroy'])
        ->middleware('permission:gestionar profesores')
        ->name('coaches.destroy');

    Route::get('/mis-tiras', [GroupController::class, 'index'])
        ->middleware('permission:ver tiras')
        ->name('groups.index');
    Route::post('/mis-tiras', [GroupController::class, 'store'])
        ->middleware('permission:gestionar tiras')
        ->name('groups.store');
    Route::get('/mis-tiras/{group}', [GroupController::class, 'show'])
        ->middleware('permission:ver jugadores')
        ->name('groups.show');
    Route::get('/mis-jugadores', [GroupController::class, 'myPlayers'])
        ->middleware('permission:ver jugadores')
        ->name('players.mine');

    Route::get('/asistencias', [AttendanceController::class, 'index'])
        ->middleware('permission:ver asistencias')
        ->name('attendances.index');
    Route::post('/asistencias/sesiones', [AttendanceController::class, 'storeOrOpenSession'])
        ->middleware('permission:fichar asistencias')
        ->name('attendances.sessions.store');
    Route::put('/asistencias/sesiones/{session}/registros', [AttendanceController::class, 'bulkUpsertRecords'])
        ->middleware('permission:editar asistencias|fichar asistencias')
        ->name('attendances.sessions.records.update');

    Route::post('/mis-tiras/{group}/jugadores', [PlayerController::class, 'store'])
        ->name('groups.players.store');
    Route::put('/mis-tiras/{group}/jugadores/{player}', [PlayerController::class, 'update'])
        ->name('groups.players.update');
    Route::delete('/mis-tiras/{group}/jugadores/{player}', [PlayerController::class, 'destroy'])
        ->name('groups.players.destroy');

    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

require __DIR__.'/auth.php';
