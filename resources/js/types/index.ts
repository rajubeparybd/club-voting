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
