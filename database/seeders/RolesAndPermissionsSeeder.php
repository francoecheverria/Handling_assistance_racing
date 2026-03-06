<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;

class RolesAndPermissionsSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Reset cached roles and permissions
        app()[\Spatie\Permission\PermissionRegistrar::class]->forgetCachedPermissions();

        // Permisos base de gestión
        $permissions = [
            'ver tiras',
            'gestionar tiras',
            'ver jugadores',
            'crear jugadores',
            'editar jugadores',
            'eliminar jugadores',
            'ver asistencias',
            'fichar asistencias',
            'editar asistencias',
            'gestionar profesores',
            'gestionar administradores',
        ];

        foreach ($permissions as $name) {
            Permission::firstOrCreate(['name' => $name, 'guard_name' => 'web']);
        }

        Role::query()
            ->where('guard_name', 'web')
            ->whereNotIn('name', ['administrador_general', 'admin', 'profesor'])
            ->delete();

        // Rol administrador_general: todos los permisos (incluye gestionar administradores)
        $superAdmin = Role::firstOrCreate(['name' => 'administrador_general', 'guard_name' => 'web']);
        $superAdmin->syncPermissions(Permission::all());

        // Rol admin: mismos permisos que administrador_general EXCEPTO gestionar administradores
        $admin = Role::firstOrCreate(['name' => 'admin', 'guard_name' => 'web']);
        $admin->syncPermissions(
            Permission::where('name', '!=', 'gestionar administradores')->get()
        );

        $profesor = Role::firstOrCreate(['name' => 'profesor', 'guard_name' => 'web']);
        $profesor->syncPermissions([
            'ver tiras',
            'ver jugadores',
            'crear jugadores',
            'editar jugadores',
            'eliminar jugadores',
            'ver asistencias',
            'fichar asistencias',
            'editar asistencias',
        ]);

        Permission::query()
            ->where('guard_name', 'web')
            ->whereNotIn('name', $permissions)
            ->delete();
    }
}
