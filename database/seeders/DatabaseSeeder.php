<?php

namespace Database\Seeders;

use App\Models\AttendanceRecord;
use App\Models\AttendanceSession;
use App\Models\Coach;
use App\Models\Group;
use App\Models\Player;
use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        $this->call(RolesAndPermissionsSeeder::class);

        $admin = User::firstOrCreate(
            ['email' => 'admin@example.com'],
            [
                'name' => 'Admin',
                'password' => 'password',
            ]
        );
        $admin->syncRoles(['admin']);

        $profesorUser = User::firstOrCreate(
            ['email' => 'profe@example.com'],
            [
                'name' => 'Profesor Demo',
                'password' => 'password',
            ]
        );
        $profesorUser->syncRoles(['profesor']);

        User::query()->where('email', 'coordinador@example.com')->delete();

        $coach = Coach::updateOrCreate(
            ['user_id' => $profesorUser->id],
            [
                'name' => 'Profesor Demo',
                'phone' => '1122334455',
            ]
        );

        $groupA = Group::updateOrCreate(
            ['name' => 'Tira 1'],
            [
                'schedule' => 'Lun/Mie/Vie 18:00',
                'category_year' => 2010,
            ]
        );

        $groupB = Group::updateOrCreate(
            ['name' => 'Tira 2'],
            [
                'schedule' => 'Mar/Jue 17:30',
                'category_year' => 2011,
            ]
        );

        $coach->groups()->syncWithoutDetaching([$groupA->id, $groupB->id]);

        $playerJuan = Player::updateOrCreate([
            'dni' => '40111222',
        ], [
            'nombre' => 'Juan',
            'apellido' => 'Perez',
            'numero_socio' => '1001',
            'category_year' => $groupA->category_year,
            'group_id' => $groupA->id,
            'medical_check' => true,
            'imagen_compromiso' => true,
            'registered' => true,
            'scholarship' => null,
            'telefono' => '1155667788',
            'mail' => 'juan.perez@example.com',
            'notes' => 'Jugador con buen rendimiento',
        ]);

        $playerLucas = Player::updateOrCreate([
            'dni' => '40222333',
        ], [
            'nombre' => 'Lucas',
            'apellido' => 'Gomez',
            'numero_socio' => '1002',
            'category_year' => $groupA->category_year,
            'group_id' => $groupA->id,
            'medical_check' => false,
            'imagen_compromiso' => false,
            'registered' => true,
            'scholarship' => '50%',
            'telefono' => null,
            'mail' => null,
            'notes' => 'Pendiente ficha médica',
        ]);

        $playerMateo = Player::updateOrCreate([
            'dni' => '40333444',
        ], [
            'nombre' => 'Mateo',
            'apellido' => 'Diaz',
            'numero_socio' => '1003',
            'category_year' => $groupB->category_year,
            'group_id' => $groupB->id,
            'medical_check' => true,
            'imagen_compromiso' => true,
            'registered' => false,
            'scholarship' => null,
            'telefono' => null,
            'mail' => null,
            'notes' => null,
        ]);

        $todaySession = AttendanceSession::firstOrCreate(
            [
                'group_id' => $groupB->id,
                'scheduled_at' => now()->setTime(17, 30, 0),
            ],
            [
                'taken_by_user_id' => $profesorUser->id,
            ]
        );

        AttendanceRecord::upsert(
            [
                [
                    'attendance_session_id' => $todaySession->id,
                    'player_id' => $playerMateo->id,
                    'status' => 'pending',
                    'notes' => null,
                    'created_at' => now(),
                    'updated_at' => now(),
                ],
            ],
            ['attendance_session_id', 'player_id'],
            ['status', 'notes', 'updated_at']
        );

        $pastSession = AttendanceSession::firstOrCreate(
            [
                'group_id' => $groupA->id,
                'scheduled_at' => now()->subDays(1)->setTime(18, 0, 0),
            ],
            [
                'taken_by_user_id' => $profesorUser->id,
                'closed_at' => now()->subDays(1)->setTime(19, 15, 0),
            ]
        );

        AttendanceRecord::upsert(
            [
                [
                    'attendance_session_id' => $pastSession->id,
                    'player_id' => $playerJuan->id,
                    'status' => 'present',
                    'notes' => null,
                    'created_at' => now(),
                    'updated_at' => now(),
                ],
                [
                    'attendance_session_id' => $pastSession->id,
                    'player_id' => $playerLucas->id,
                    'status' => 'absent',
                    'notes' => 'Avisó que no asistía.',
                    'created_at' => now(),
                    'updated_at' => now(),
                ],
            ],
            ['attendance_session_id', 'player_id'],
            ['status', 'notes', 'updated_at']
        );
    }
}
