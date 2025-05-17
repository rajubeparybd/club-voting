<?php
namespace Database\Seeders;

use App\Models\PaymentMethod;
use Illuminate\Database\Seeder;

class PaymentMethodSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        PaymentMethod::create([
            'name'        => 'Bkash',
            'description' => 'Cashout into this number: 01717171717',
            'type'        => 'manual',
            'provider'    => 'bkash',
            'is_active'   => true,
        ]);

        PaymentMethod::create([
            'name'        => 'Rocket',
            'description' => 'Cashout into this number: 01717171717',
            'type'        => 'manual',
            'provider'    => 'rocket',
            'is_active'   => true,
        ]);

        PaymentMethod::create([
            'name'        => 'Nagad',
            'description' => 'Cashout into this number: 01717171717',
            'type'        => 'manual',
            'provider'    => 'nagad',
            'is_active'   => true,
        ]);

        PaymentMethod::create([
            'name'        => 'Bank',
            'description' => 'Send money to this account: 1234567890',
            'type'        => 'manual',
            'provider'    => 'bank',
            'is_active'   => false,
        ]);

        PaymentMethod::create([
            'name'        => 'Cash',
            'description' => 'Go to the club and pay in cash',
            'type'        => 'manual',
            'provider'    => 'cash',
            'is_active'   => true,
        ]);

    }
}
