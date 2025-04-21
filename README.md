# Club Voting System

A comprehensive online platform for managing club elections and voting processes in educational institutions and organizations.

## Features

- **Multi-Role System**

    - User roles with specific permissions (Users, Candidates, Admins, Club Admins)
    - Role-based access control
    - Secure authentication and authorization
    - Profile management

- **Club Management**

    - Club creation and management
    - Position definition and tracking
    - Membership management
    - Club status monitoring
    - Detailed club profiles

- **Nomination System**

    - Nomination period management
    - Candidate application processing
    - Application review workflow
    - Candidate profiles
    - Statement and qualification tracking

- **Voting System**

    - Secure election scheduling
    - One-vote-per-user enforcement
    - Real-time election results
    - Multiple simultaneous elections
    - Vote verification and audit trails

- **Support System**
    - Ticket-based support
    - Priority level management
    - Status tracking workflow
    - Message threading

## Tech Stack

- **Backend**

    - Laravel 12.x (PHP 8.2+)
    - MySQL
    - Inertia.js

- **Frontend**
    - React 19.x
    - TypeScript
    - Tailwind CSS
    - shadcn/ui components
    - Lucide icons
    - Vite

## Prerequisites

- PHP 8.2 or higher
- Node.js 18.x or higher
- MySQL 8.0 or higher
- Composer
- npm or yarn

## Installation

1. Clone the repository

```bash
git clone git@github.com:rajubeparybd/club-voting.git
cd club-voting
```

2. Install PHP dependencies

```bash
composer install
```

3. Install JavaScript dependencies

```bash
npm install
```

4. Configure environment

```bash
cp .env.example .env
php artisan key:generate
```

5. Configure your database in `.env`

```
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=club_voting
DB_USERNAME=your_username
DB_PASSWORD=your_password
```

6. Run migrations

```bash
php artisan migrate
```

7. Build assets

```bash
npm run build
```

## Development

1. Start the Laravel development server

```bash
php artisan serve
```

2. Start the Vite development server

```bash
npm run dev
```

## Testing

Run PHP tests:

```bash
php artisan test
```

## Credits

Made with ❤️ by [Raju Bepary](https://github.com/rajubeparybd)
