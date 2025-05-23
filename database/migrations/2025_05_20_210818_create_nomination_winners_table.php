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
        Schema::create('nomination_winners', function (Blueprint $table) {
            $table->id();
            $table->foreignId('nomination_id')->constrained()->onDelete('cascade');
            $table->foreignId('voting_event_id')->constrained()->onDelete('cascade');
            $table->foreignId('nomination_application_id')->constrained()->onDelete('cascade');
            $table->foreignId('club_position_id')->constrained()->onDelete('cascade');
            $table->foreignId('winner_id')->nullable()->constrained('users')->onDelete('cascade');
            $table->integer('votes_count')->default(0);
            $table->boolean('is_tie_resolved')->default(false);
            $table->timestamps();

            // Ensure each position has only one winner per nomination and voting event
            $table->unique(['nomination_id', 'voting_event_id', 'club_position_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('nomination_winners');
    }
};
