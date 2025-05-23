import { LucideIcon } from 'lucide-react';
import type { Config } from 'ziggy-js';

export interface BreadcrumbItem {
    title: string;
    href: string;
}

export interface ClubPosition {
    id: number;
    club_id: number;
    name: string;
    description: string | null;
    is_active: boolean;
    created_at: string;
    updated_at: string;
}

export interface Club {
    id: number;
    name: string;
    description: string;
    status: 'active' | 'inactive' | 'pending';
    join_fee: number;
    image: string;
    open_date: string | null;
    created_at: string;
    updated_at: string;
    users_count: number;
    positions_count: number;
    positions?: ClubPosition[];
    members_count: number;
    users?: User[];
}

export interface PaginatedData<T> {
    data: T[];
    current_page: number;
    first_page_url: string;
    from: number;
    last_page: number;
    last_page_url: string;
    links: {
        url: string | null;
        label: string;
        active: boolean;
    }[];
    next_page_url: string | null;
    path: string;
    per_page: number;
    prev_page_url: string | null;
    to: number;
    total: number;
}

export interface Auth {
    user: User;
    roles?: string[];
    permissions?: string[];
}

export interface BreadcrumbItem {
    title: string;
    href: string;
}

export interface NavGroup {
    title: string;
    items: NavItem[];
}

export interface NavItem {
    title: string;
    href: string;
    icon?: LucideIcon | null;
    isActive?: boolean;
    submenu?: NavItem[];
    permissions?: string[];
    separatorBefore?: boolean;
    separatorAfter?: boolean;
}

export interface SharedData {
    name: string;
    quote: { message: string; author: string };
    auth: Auth;
    ziggy: Config & { location: string };
    sidebarOpen: boolean;
    [key: string]: unknown;
}

export interface User {
    id: number;
    student_id: string;
    name?: string | null;
    phone?: string | null;
    birth_date?: string | null;
    intake?: string | null;
    gender?: 'M' | 'F' | 'Other';
    email: string;
    password: string;
    is_candidate: boolean;
    email_verified_at?: string | null;
    remember_token?: string | null;
    status: 'active' | 'inactive' | 'banned';
    department_id?: number | null;
    department: Department;
    avatar?: string;
    roles?: Role[];
    created_at: string;
    updated_at: string;
    pivot?: {
        status: 'active' | 'inactive' | 'pending' | 'banned';
    };
    [key: string]: unknown;
}

export interface Role {
    id: number;
    name: string;
    guard_name: string;
    created_at: string;
    updated_at: string;
    permissions?: Permission[];
    users_count: number;
}

export interface Permission {
    id: number;
    name: string;
    guard_name: string;
    created_at: string;
    updated_at: string;
    description: string;
}

export interface ClubMember {
    id: number;
    club_id: number;
    user_id: number;
    position_id: number | null;
    status: 'active' | 'inactive' | 'pending';
    joined_at: string;
    created_at: string;
    updated_at: string;
    user?: User;
    position?: ClubPosition;
}

export interface Department {
    id: number;
    name: string;
    code: string | null;
    created_at: string;
    updated_at: string;
}

export interface Nomination {
    id: number;
    title: string;
    description?: string;
    club_id: number;
    start_date: string;
    end_date: string;
    status: 'active' | 'draft' | 'closed' | 'archived';
    eligibility_criteria?: Record<string, unknown>;
    club?: Club;
    positions?: ClubPosition[];
    created_at?: string;
    updated_at?: string;
}

export interface PaymentMethod {
    id: number;
    name: string;
    description?: string;
    type: 'manual' | 'automatic';
    provider: 'bkash' | 'rocket' | 'nagad' | 'bank' | 'cash';
    metadata: Record<string, unknown>;
    is_active: boolean;
    logo: string;
    created_at: string;
    updated_at: string;
}

export interface NominationApplication {
    id: number;
    user_id: number;
    nomination_id: number;
    club_id: number;
    club_position_id: number;
    status: 'pending' | 'approved' | 'rejected';
    statement: string;
    admin_notes: string;
    created_at: string;
    updated_at: string;
    cv_url?: string;
    positions?: ClubPosition[];
    nomination?: Nomination;
    club?: Club;
    user?: User;
    club_position?: ClubPosition;
    votes_count?: number;
    is_winner?: boolean;
}

export interface PaymentLog {
    id: number;
    user_id: number;
    club_id: number;
    payment_method_id: number;
    amount: string;
    transaction_id: string;
    status: 'pending' | 'approved' | 'rejected';
    notes?: string;
    screenshot_url?: string;
    created_at: string;
    updated_at: string;
    club?: Club;
    payment_method?: PaymentMethod;
}

export interface VotingEvent {
    id: number;
    title: string;
    description?: string;
    club_id: number;
    nomination_id?: number | null;
    start_date: string;
    end_date: string;
    status: 'active' | 'draft' | 'closed' | 'archived';
    club?: Club;
    nomination?: Nomination;
    created_at?: string;
    updated_at?: string;
    has_voted_all?: boolean;
    has_any_votes?: boolean;
}

export interface NominationWinner {
    id: number;
    nomination_id: number;
    voting_event_id: number;
    nomination_application_id: number;
    club_position_id: number;
    winner_id: number;
    votes_count: number;
    is_tie_resolved: boolean;
    created_at: string;
    updated_at: string;
    nominationApplication?: NominationApplication;
    clubPosition?: ClubPosition;
    winner?: User;
}
