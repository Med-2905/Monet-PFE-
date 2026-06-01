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
        Schema::create('rdv_medical_records', function (Blueprint $table) {
            $table->id();

            $table->foreignId('rdv_id')
                ->constrained('r_d_v_s')
                ->onDelete('cascade');

            $table->foreignId('patient_id')
                ->constrained()
                ->onDelete('cascade');

            $table->foreignId('doctor_id')
                ->constrained()
                ->onDelete('cascade');

            $table->text('condition')->nullable(); 
            $table->text('symptoms')->nullable();
            $table->text('diagnosis')->nullable();
            $table->text('treatment_plan')->nullable();
            $table->text('doctor_notes')->nullable();

            $table->timestamps();

            $table->unique('rdv_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('rdv_medical_records');
    }
};
