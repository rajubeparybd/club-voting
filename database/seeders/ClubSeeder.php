<?php
namespace Database\Seeders;

use App\Models\Club;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Arr;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

class ClubSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Sample club data
        $clubs = [
            [
                'name'        => 'Photography Club',
                'description' => 'A club for photography enthusiasts to share their passion, learn new techniques, and explore the world through a lens.',
                'status'      => 'active',
                'join_fee'    => 100,
                'image'       => '/storage/clubs/photography-club.jpg',
                'open_date'   => now()->subMonths(6),
                'positions'   => [
                    ['name' => 'President', 'description' => 'Club leader responsible for overall direction', 'is_active' => true],
                    ['name' => 'Vice President', 'description' => 'Assists the president and fills in when needed', 'is_active' => true],
                    ['name' => 'Secretary', 'description' => 'Handles administrative tasks and record keeping', 'is_active' => true],
                    ['name' => 'Treasurer', 'description' => 'Manages club finances and budget', 'is_active' => true],
                    ['name' => 'Event Coordinator', 'description' => 'Plans and organizes club events and outings', 'is_active' => true],
                ],
            ],
            [
                'name'        => 'Debate Society',
                'description' => 'A platform for students to develop their public speaking skills, critical thinking, and argumentation through organized debates.',
                'status'      => 'active',
                'join_fee'    => 100,
                'image'       => '/storage/clubs/debate-society.jpg',
                'open_date'   => now()->subMonths(8),
                'positions'   => [
                    ['name' => 'Chairperson', 'description' => 'Leads the society and moderates debates', 'is_active' => true],
                    ['name' => 'Deputy Chair', 'description' => 'Assists the chairperson and handles logistics', 'is_active' => true],
                    ['name' => 'Secretary', 'description' => 'Records meeting minutes and handles correspondence', 'is_active' => true],
                    ['name' => 'Research Head', 'description' => 'Coordinates research efforts for debates', 'is_active' => true],
                ],
            ],
            [
                'name'        => 'Computer Science Club',
                'description' => 'A community for coding enthusiasts to collaborate on projects, share knowledge, and explore new technologies.',
                'status'      => 'active',
                'join_fee'    => 100,
                'image'       => '/storage/clubs/cs-club.jpg',
                'open_date'   => now()->subMonths(3),
                'positions'   => [
                    ['name' => 'President', 'description' => 'Oversees all club activities and meetings', 'is_active' => true],
                    ['name' => 'Technical Lead', 'description' => 'Directs technical projects and workshops', 'is_active' => true],
                    ['name' => 'Secretary', 'description' => 'Handles administrative tasks', 'is_active' => true],
                    ['name' => 'Webmaster', 'description' => 'Manages club website and online presence', 'is_active' => true],
                    ['name' => 'Workshop Coordinator', 'description' => 'Organizes educational workshops', 'is_active' => false],
                ],
            ],
            [
                'name'        => 'Music Club',
                'description' => 'A space for music lovers to practice, perform, and appreciate various musical styles and instruments.',
                'status'      => 'inactive',
                'join_fee'    => 100,
                'image'       => '/storage/clubs/music-club.jpg',
                'open_date'   => now()->subMonths(12),
                'positions'   => [
                    ['name' => 'President', 'description' => 'Leads the club and coordinates performances', 'is_active' => true],
                    ['name' => 'Music Director', 'description' => 'Arranges music and directs performances', 'is_active' => true],
                    ['name' => 'Treasurer', 'description' => 'Manages club finances', 'is_active' => true],
                    ['name' => 'Equipment Manager', 'description' => 'Maintains musical equipment and setup', 'is_active' => false],
                ],
            ],
            [
                'name'        => 'Environmental Club',
                'description' => 'Dedicated to promoting environmental awareness, sustainability practices, and conservation efforts.',
                'status'      => 'pending',
                'join_fee'    => 100,
                'image'       => null,
                'open_date'   => null,
                'positions'   => [
                    ['name' => 'President', 'description' => 'Leads club initiatives and meetings', 'is_active' => true],
                    ['name' => 'Project Coordinator', 'description' => 'Manages environmental projects', 'is_active' => true],
                    ['name' => 'Outreach Officer', 'description' => 'Handles community engagement and partnerships', 'is_active' => true],
                ],
            ],
        ];

        // Get some users to assign to clubs
        $users = User::where('name', '!=', 'Admin User')->take(20)->get();

        if ($users->isEmpty()) {
            $this->command->info('No users found. Please run the UserSeeder first.');
            return;
        }

        foreach ($clubs as $clubData) {
            $positions = $clubData['positions'];
            unset($clubData['positions']);

            // Create the club
            $club = Club::create($clubData);

            // Create positions
            $createdPositions = [];
            foreach ($positions as $positionData) {
                $createdPositions[] = $club->positions()->create($positionData);
            }

            // Add random members to the club
            $memberCount = min(rand(5, 10), $users->count());
            $clubUsers   = $users->random($memberCount);

            foreach ($clubUsers as $index => $user) {
                // Determine if user gets a position
                $hasPosition = $index < count($createdPositions) && rand(0, 1) === 1;
                $positionId  = $hasPosition ? $createdPositions[$index]->id : null;

                // Assign random status
                $status     = ['active', 'pending', 'inactive', 'banned'];
                $weight     = [70, 20, 5, 5]; // More likely to be active
                $randStatus = $this->weightedRandom($status, $weight);

                // Join date between club open date and now
                $openDate = $clubData['open_date'] ?? now()->subMonths(6);
                $joinedAt = fake()->dateTimeBetween($openDate, now());

                // Check if status column exists in club_user table
                $hasStatusColumn = Schema::hasColumn('club_user', 'status');

                // Prepare data for insertion
                $userData = [
                    'club_id'     => $club->id,
                    'user_id'     => $user->id,
                    'position_id' => $positionId,
                    'joined_at'   => $joinedAt,
                    'created_at'  => now(),
                    'updated_at'  => now(),
                ];

                // Add status if the column exists
                if ($hasStatusColumn) {
                    $userData['status'] = $randStatus;
                }

                // Add user to club
                DB::table('club_user')->insert($userData);
            }
        }
    }

    /**
     * Get a weighted random item from array
     */
    private function weightedRandom(array $items, array $weights): mixed
    {
        if (count($items) !== count($weights)) {
            throw new \InvalidArgumentException("Items and weights must have the same count");
        }

        $sum           = array_sum($weights);
        $rand          = mt_rand(1, $sum);
        $currentWeight = 0;

        foreach ($items as $key => $item) {
            $currentWeight += $weights[$key];
            if ($rand <= $currentWeight) {
                return $item;
            }
        }

        return $items[0]; // Fallback to first item
    }
}
