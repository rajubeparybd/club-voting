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
        Schema::create('votes', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->foreignId('voting_event_id')->constrained()->onDelete('cascade');
            $table->foreignId('nomination_application_id')->constrained()->onDelete('cascade');
            $table->json('metadata')->nullable(); // For any additional voting data
            $table->timestamps();

            // Ensure each user can only vote once per candidate in a voting event
            $table->unique(['user_id', 'voting_event_id', 'nomination_application_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('votes');
    }
};
