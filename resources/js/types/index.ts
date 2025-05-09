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
    image: string;
    open_date: string | null;
    created_at: string;
    updated_at: string;
    users_count: number;
    positions_count: number;
    positions?: ClubPosition[];
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
    email_verified_at?: string | null;
    remember_token?: string | null;
    status: 'active' | 'inactive' | 'banned';
    department_id?: number | null;
    department: Department;
    avatar?: string;
    roles?: Role[];
    created_at: string;
    updated_at: string;
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
