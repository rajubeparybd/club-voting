export interface Position {
    id: number;
    name: string;
    is_active: boolean;
}

export interface Club {
    id: number;
    name: string;
    description: string;
    logo?: string;
    status: string;
    members_count: number;
    positions: Position[];
}

export interface SimpleClub {
    id: number;
    name: string;
    logo?: string;
}

export interface Nomination {
    id: number;
    title: string;
    description: string;
    start_date: string;
    end_date: string;
    status: string;
    club: SimpleClub;
}

export interface VotingEvent {
    id: number;
    title: string;
    description: string;
    start_date: string;
    end_date: string;
    status: string;
    club: SimpleClub;
}

export interface AppInfo {
    name: string;
    version: string;
    description: string;
}

export interface DeveloperInfo {
    name: string;
    email: string;
    website: string;
}

export interface User {
    id: number;
    name: string;
    email: string;
}

export interface Auth {
    user: User | null;
}
