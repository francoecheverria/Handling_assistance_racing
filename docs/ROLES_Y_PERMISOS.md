# Roles y permisos (Spatie Laravel Permission)

## Configuración

- **Modelo User:** trait `HasRoles` (ya añadido).
- **Middleware:** alias `role`, `permission`, `role_or_permission` en `bootstrap/app.php`.
- **Inertia:** en cada request se comparten `auth.user.roles` y `auth.user.permissions` para el frontend.

## Roles y permisos por defecto (seeder)

- **admin:** todos los permisos.
- **user:** solo permiso "ver usuarios".

Permisos definidos: `ver usuarios`, `crear usuarios`, `editar usuarios`, `eliminar usuarios`, `gestionar roles`.

## Uso en rutas

```php
// Solo rol admin
Route::get('/admin')->middleware(['auth', 'role:admin']);

// Solo un permiso
Route::get('/usuarios')->middleware(['auth', 'permission:editar usuarios']);

// Varios roles (cualquiera)
Route::get('/reports')->middleware(['auth', 'role:admin|manager']);

// Rol o permiso
Route::get('/config')->middleware(['auth', 'role_or_permission:admin|gestionar roles']);
```

## Uso en controladores / Blade

```php
$user->hasRole('admin');
$user->can('editar usuarios');
$user->hasAnyRole(['admin', 'manager']);
$user->hasAllRoles(['admin', 'editor']);
```

## Uso en React (Inertia)

`auth.user.roles` y `auth.user.permissions` son arrays de strings.

```jsx
// En un componente
const { auth } = usePage().props;

if (auth?.user?.roles?.includes('admin')) {
  // mostrar opción solo para admin
}

if (auth?.user?.permissions?.includes('editar usuarios')) {
  // mostrar botón editar
}
```

## Comandos útiles

```bash
# Ejecutar seeder de roles/permisos
docker compose exec app php artisan db:seed --class=RolesAndPermissionsSeeder

# Asignar rol a un usuario (Tinker)
docker compose exec app php artisan tinker
>>> $u = User::find(1); $u->assignRole('admin');
```

## Usuarios de prueba (DatabaseSeeder)

- **admin@example.com** → rol `admin`
- **test@example.com** → rol `user`

Contraseña la que genere el factory (por defecto `password` en Breeze).
