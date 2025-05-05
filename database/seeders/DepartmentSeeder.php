<?php

namespace Database\Seeders;

use App\Models\Department;
use Illuminate\Database\Seeder;

class DepartmentSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $departments = [
            ['bubt_program_id' => 1, 'code' => 'CS', 'name' => 'Computer Science'],
            ['bubt_program_id' => 2, 'code' => 'BBA', 'name' => 'Business Administration'],
            ['bubt_program_id' => 3, 'code' => 'EEE', 'name' => 'Electrical and Electronic Engineering'],
            ['bubt_program_id' => 4, 'code' => 'CE', 'name' => 'Civil Engineering'],
            ['bubt_program_id' => 5, 'code' => 'ME', 'name' => 'Mechanical Engineering'],
            ['bubt_program_id' => 6, 'code' => 'ENG', 'name' => 'English'],
            ['bubt_program_id' => 7, 'code' => 'ECO', 'name' => 'Economics'],
            ['bubt_program_id' => 8, 'code' => 'LAW', 'name' => 'Law'],
            ['bubt_program_id' => 9, 'code' => 'PHA', 'name' => 'Pharmacy'],
            ['bubt_program_id' => 10, 'code' => 'MKT', 'name' => 'Marketing'],
        ];

        foreach ($departments as $department) {
            Department::create($department);
        }
    }
}
