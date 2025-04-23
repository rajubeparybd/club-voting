<?php

use App\Models\User;
use Illuminate\Support\Facades\Hash;

test('password can be updated', function () {
    $user = User::factory()->create()->assignRole('user');

    $response = $this
        ->actingAs($user)
        ->from('/user/settings/password')
        ->put('/user/settings/password', [
            'current_password' => 'password',
            'password' => 'new-password',
            'password_confirmation' => 'new-password',
        ]);

    $response
        ->assertSessionHasNoErrors()
        ->assertRedirect('/user/settings/password');

    expect(Hash::check('new-password', $user->refresh()->password))->toBeTrue();
});

test('correct password must be provided to update password', function () {
    $user = User::factory()->create()->assignRole('user');

    $response = $this
        ->actingAs($user)
        ->from('/user/settings/password')
        ->put('/user/settings/password', [
            'current_password' => 'wrong-password',
            'password' => 'new-password',
            'password_confirmation' => 'new-password',
        ]);

    $response
        ->assertSessionHasErrors('current_password')
        ->assertRedirect('/user/settings/password');
});
