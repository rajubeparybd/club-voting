<?php

namespace Tests;

use Illuminate\Foundation\Testing\TestCase as BaseTestCase;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Spatie\Permission\Models\Role;

abstract class TestCase extends BaseTestCase
{
    use CreatesApplication, RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        // Create roles
        Role::create(['name' => 'admin', 'guard_name' => 'web']);
        Role::create(['name' => 'user', 'guard_name' => 'web']);
    }
}
