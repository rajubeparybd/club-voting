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
        Schema::create('nominations', function (Blueprint $table) {
            $table->id();
            $table->foreignId('club_id')->constrained()->onDelete('cascade');
            $table->string('title');
            $table->text('description')->nullable();
            $table->dateTime('start_date');
            $table->dateTime('end_date');
            $table->json('eligibility_criteria')->nullable();
            $table->integer('max_applicants')->nullable()->comment('Maximum number of applicants that can be accepted for this nomination');
            $table->enum('status', ['draft', 'active', 'closed', 'archived'])->default('draft');
            $table->timestamps();
        });

        Schema::create('nomination_applications', function (Blueprint $table) {
            $table->id();
            $table->foreignId('nomination_id')->constrained()->onDelete('cascade');
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->text('statement')->nullable();
            $table->timestamps();
        });

        Schema::create('nomination_application_positions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('nomination_application_id')->constrained()->onDelete('cascade');
            $table->foreignId('club_position_id')->constrained()->onDelete('cascade');
            $table->text('additional_requirements')->nullable();
            $table->enum('status', ['pending', 'approved', 'rejected'])->default('pending');
            $table->integer('max_applicants')->nullable()->comment('Maximum number of applicants that can be accepted for this position');
            $table->text('admin_notes')->nullable();
            $table->timestamps();
        });

    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('nominations');
        Schema::dropIfExists('nomination_applications');
        Schema::dropIfExists('nomination_application_positions');
    }
};
