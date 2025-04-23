<?php

use App\Models\User;

test('profile page is displayed', function () {
    $user = User::factory()->create()->assignRole('user');

    $response = $this
        ->actingAs($user)
        ->get('/user/settings/profile');

    $response->assertOk();
});

test('profile information can be updated', function () {
    $user = User::factory()->create()->assignRole('user');

    $response = $this
        ->actingAs($user)
        ->patch('/user/settings/profile', [
            'name' => 'Test User',
            'email' => 'test@example.com',
        ]);

    $response
        ->assertSessionHasNoErrors()
        ->assertRedirect('/user/settings/profile');

    $user->refresh();

    expect($user->name)->toBe('Test User');
    expect($user->email)->toBe('test@example.com');
    expect($user->email_verified_at)->toBeNull();
});

test('email verification status is unchanged when the email address is unchanged', function () {
    $user = User::factory()->create()->assignRole('user');

    $response = $this
        ->actingAs($user)
        ->patch('/user/settings/profile', [
            'name' => 'Test User',
            'email' => $user->email,
        ]);

    $response
        ->assertSessionHasNoErrors()
        ->assertRedirect('/user/settings/profile');

    expect($user->refresh()->email_verified_at)->not->toBeNull();
});

test('user can delete their account', function () {
    $user = User::factory()->create()->assignRole('user');

    $response = $this
        ->actingAs($user)
        ->delete('/user/settings/profile', [
            'password' => 'password',
        ]);

    $response
        ->assertSessionHasNoErrors()
        ->assertRedirect('/');

    $this->assertGuest();
    expect($user->fresh())->toBeNull();
});

test('correct password must be provided to delete account', function () {
    $user = User::factory()->create()->assignRole('user');

    $response = $this
        ->actingAs($user)
        ->from('/user/settings/profile')
        ->delete('/user/settings/profile', [
            'password' => 'wrong-password',
        ]);

    $response
        ->assertSessionHasErrors('password')
        ->assertRedirect('/user/settings/profile');

    expect($user->fresh())->not->toBeNull();
});
