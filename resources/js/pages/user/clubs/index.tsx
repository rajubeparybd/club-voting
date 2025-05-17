import { Input } from '@/components/ui/input';
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '@/components/ui/pagination';
import ClubCard from '@/components/user/ClubCard';
import AppLayout from '@/layouts/user/user-layout';
import { Club, PaginatedData, PaymentMethod, SharedData, type BreadcrumbItem } from '@/types';
import { Head, router, usePage } from '@inertiajs/react';
import { useMemo, useState } from 'react';
import { route } from 'ziggy-js';

// Define breadcrumbs for the page
const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: route('user.dashboard'),
    },
    {
        title: 'Clubs',
        href: route('user.clubs.index'),
    },
];

type ClubsIndexProps = {
    clubs: PaginatedData<Club>;
    paymentMethods: PaymentMethod[];
};

export default function ClubsIndex({ clubs, paymentMethods }: ClubsIndexProps) {
    const { auth } = usePage<SharedData>().props;
    const user = auth.user;

    const [searchQuery, setSearchQuery] = useState('');

    const filteredClubs = useMemo(() => {
        if (!searchQuery.trim()) return clubs.data;

        return clubs.data.filter(
            (club) =>
                club.name.toLowerCase().includes(searchQuery.toLowerCase()) || club.description.toLowerCase().includes(searchQuery.toLowerCase()),
        );
    }, [clubs.data, searchQuery]);

    const handlePageChange = (page: number) => {
        router.get(route('user.clubs.index', { page }), {}, { preserveState: true });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Clubs" />

            <div className="flex h-full flex-1 flex-col gap-4 p-4">
                <div className="flex flex-col justify-between gap-4 sm:flex-row">
                    <h1 className="text-2xl font-bold">Available Clubs</h1>

                    <div className="flex w-full max-w-sm items-center space-x-2">
                        <Input
                            type="search"
                            placeholder="Search clubs..."
                            className="max-w-sm"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                </div>

                {clubs.data.length === 0 ? (
                    <div className="bg-card flex h-[400px] items-center justify-center rounded-xl p-8 text-center shadow">
                        <div>
                            <h3 className="text-xl font-bold">No Clubs Available</h3>
                            <p className="text-muted-foreground mt-2">There are currently no active clubs available.</p>
                        </div>
                    </div>
                ) : (
                    <>
                        {/* Club Grid */}
                        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                            {filteredClubs.map((club) => (
                                <ClubCard key={club.id} club={club} userId={user.id.toString()} paymentMethods={paymentMethods} />
                            ))}

                            {filteredClubs.length === 0 && (
                                <div className="col-span-full p-8 text-center">
                                    <p className="text-muted-foreground">No clubs found matching your search.</p>
                                </div>
                            )}
                        </div>

                        {/* Pagination */}
                        {!searchQuery && clubs.last_page > 1 && (
                            <div className="mt-4">
                                <Pagination>
                                    <PaginationContent>
                                        {clubs.current_page > 1 && (
                                            <PaginationItem>
                                                <PaginationPrevious
                                                    href="#"
                                                    onClick={(e) => {
                                                        e.preventDefault();
                                                        handlePageChange(clubs.current_page - 1);
                                                    }}
                                                />
                                            </PaginationItem>
                                        )}

                                        {Array.from({ length: clubs.last_page }).map((_, i) => {
                                            const page = i + 1;
                                            const isCurrentPage = page === clubs.current_page;

                                            return (
                                                <PaginationItem key={page}>
                                                    <PaginationLink
                                                        href="#"
                                                        isActive={isCurrentPage}
                                                        onClick={(e) => {
                                                            e.preventDefault();
                                                            if (!isCurrentPage) handlePageChange(page);
                                                        }}
                                                    >
                                                        {page}
                                                    </PaginationLink>
                                                </PaginationItem>
                                            );
                                        })}

                                        {clubs.current_page < clubs.last_page && (
                                            <PaginationItem>
                                                <PaginationNext
                                                    href="#"
                                                    onClick={(e) => {
                                                        e.preventDefault();
                                                        handlePageChange(clubs.current_page + 1);
                                                    }}
                                                />
                                            </PaginationItem>
                                        )}
                                    </PaginationContent>
                                </Pagination>

                                <div className="text-muted-foreground mt-2 text-center text-sm">
                                    Showing {clubs.from} to {clubs.to} of {clubs.total} clubs
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>
        </AppLayout>
    );
}
