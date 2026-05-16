<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        //
        Schema::table('doctors', function (Blueprint $table) {
            $table->dropForeign(['specialty_id']);
            $table->dropForeign(['city_id']);

            $table->foreign('specialty_id')
                ->references('id')
                ->on('specialties')
                ->restrictOnDelete();

            $table->foreign('city_id')
                ->references('id')
                ->on('cities')
                ->restrictOnDelete();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        //
        Schema::table('doctors', function (Blueprint $table) {
            $table->dropForeign(['specialty_id']);
            $table->dropForeign(['city_id']);

            $table->foreign('specialty_id')
                ->references('id')
                ->on('specialties')
                ->cascadeOnDelete();

            $table->foreign('city_id')
                ->references('id')
                ->on('cities')
                ->cascadeOnDelete();
        });
    }
};
