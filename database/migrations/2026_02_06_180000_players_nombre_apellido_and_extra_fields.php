<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('players', function (Blueprint $table) {
            $table->string('nombre')->nullable()->after('id');
            $table->string('apellido')->nullable()->after('nombre');
            $table->string('numero_socio')->nullable()->after('dni');
            $table->date('fecha_nacimiento')->nullable()->after('numero_socio');
            $table->boolean('imagen_compromiso')->default(false)->after('scholarship');
            $table->string('telefono')->nullable()->after('imagen_compromiso');
            $table->string('mail')->nullable()->after('telefono');
        });

        DB::table('players')->update([
            'nombre' => DB::raw('full_name'),
            'apellido' => '',
        ]);

        Schema::table('players', function (Blueprint $table) {
            $table->dropColumn('full_name');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('players', function (Blueprint $table) {
            $table->string('full_name')->nullable()->after('id');
        });

        DB::table('players')->update([
            'full_name' => DB::raw("TRIM(CONCAT(COALESCE(nombre,''), ' ', COALESCE(apellido,'')))"),
        ]);

        Schema::table('players', function (Blueprint $table) {
            $table->dropColumn([
                'nombre',
                'apellido',
                'numero_socio',
                'fecha_nacimiento',
                'imagen_compromiso',
                'telefono',
                'mail',
            ]);
        });
    }
};
