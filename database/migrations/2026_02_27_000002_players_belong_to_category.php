<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Crear una categoría por cada (group_id, category_year) existente en groups
        $groups = DB::table('groups')->select('id', 'category_year')->get();
        foreach ($groups as $g) {
            DB::table('categories')->insert([
                'group_id' => $g->id,
                'category_year' => $g->category_year,
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }

        Schema::table('players', function (Blueprint $table) {
            $table->foreignId('category_id')->nullable()->after('id')->constrained()->cascadeOnDelete();
        });

        // Asignar category_id a cada jugador según su group_id y category_year
        $categories = DB::table('categories')->select('id', 'group_id', 'category_year')->get();
        foreach (DB::table('players')->select('id', 'group_id', 'category_year')->get() as $player) {
            $cat = $categories->first(fn ($c) => (int) $c->group_id === (int) $player->group_id && (int) $c->category_year === (int) $player->category_year);
            if ($cat) {
                DB::table('players')->where('id', $player->id)->update(['category_id' => $cat->id]);
            }
        }

        Schema::table('players', function (Blueprint $table) {
            $table->dropForeign(['group_id']);
            $table->dropColumn(['group_id', 'category_year']);
        });
    }

    public function down(): void
    {
        Schema::table('players', function (Blueprint $table) {
            $table->unsignedBigInteger('category_id')->nullable()->change();
        });

        Schema::table('players', function (Blueprint $table) {
            $table->foreignId('group_id')->nullable()->after('category_id')->constrained()->cascadeOnDelete();
            $table->integer('category_year')->nullable();
        });

        foreach (DB::table('players')->join('categories', 'players.category_id', '=', 'categories.id')->select('players.id', 'categories.group_id', 'categories.category_year')->get() as $row) {
            DB::table('players')->where('id', $row->id)->update(['group_id' => $row->group_id, 'category_year' => $row->category_year]);
        }

        Schema::table('players', function (Blueprint $table) {
            $table->dropForeign(['category_id']);
            $table->dropColumn('category_id');
            $table->unsignedBigInteger('group_id')->nullable(false)->change();
            $table->integer('category_year')->nullable(false)->change();
        });

        DB::table('categories')->delete();
    }
};
