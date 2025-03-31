import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import ProcessingButton from '@/components/ui/processing-button';
import { router } from '@inertiajs/react';
import { Check, Loader2, Search, UserPlus } from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';

interface User {
    id: number;
    name: string;
    email: string;
    student_id: string | null;
    avatar: string | null;
}

interface AddMembersDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    clubId: number;
}

export function AddMembersDialog({ open, onOpenChange, clubId }: AddMembersDialogProps) {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedUsers, setSelectedUsers] = useState<User[]>([]);
    const [allNonMembers, setAllNonMembers] = useState<User[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const loadAllNonMembers = useCallback(async () => {
        setIsLoading(true);
        try {
            const response = await fetch(`/admin/clubs/${clubId}/non-members`);
            if (!response.ok) {
                throw new Error('Failed to load users');
            }
            const data = await response.json();
            setAllNonMembers(data);
        } catch (error) {
            console.error('Error loading users:', error);
            toast.error('Failed to load users');
        } finally {
            setIsLoading(false);
        }
    }, [clubId]);

    useEffect(() => {
        if (open) {
            setSearchTerm('');
            setSelectedUsers([]);
            loadAllNonMembers();
        }
    }, [open, loadAllNonMembers]);

    // Filter users based on search term (client-side filtering)
    const filteredUsers = useMemo(() => {
        if (!searchTerm.trim()) return allNonMembers;

        const searchTermLower = searchTerm.toLowerCase();
        return allNonMembers.filter(
            (user) =>
                user.name.toLowerCase().includes(searchTermLower) ||
                user.email.toLowerCase().includes(searchTermLower) ||
                (user.student_id && user.student_id.toLowerCase().includes(searchTermLower)),
        );
    }, [allNonMembers, searchTerm]);

    // Toggle user selection
    const toggleUserSelection = (user: User) => {
        setSelectedUsers((prevSelected) => {
            const isAlreadySelected = prevSelected.some((selected) => selected.id === user.id);
            if (isAlreadySelected) {
                return prevSelected.filter((selected) => selected.id !== user.id);
            } else {
                return [...prevSelected, user];
            }
        });
    };

    // Submit selected users to add to the club
    const handleSubmit = () => {
        if (selectedUsers.length === 0) {
            toast.error('Please select at least one user');
            return;
        }

        setIsSubmitting(true);
        const userIds = selectedUsers.map((user) => user.id);

        router.post(
            route('admin.clubs.members.add', { club: clubId }),
            { user_ids: userIds },
            {
                preserveScroll: true,
                onSuccess: () => {
                    setIsSubmitting(false);
                    onOpenChange(false);
                    setSelectedUsers([]);
                    setSearchTerm('');
                },
                onError: (errors) => {
                    console.error(errors);
                    setIsSubmitting(false);
                    toast.error('Failed to add members to the club');
                },
            },
        );
    };

    return (
        <Dialog
            open={open}
            onOpenChange={(newOpen) => {
                if (!isSubmitting) {
                    onOpenChange(newOpen);
                }
            }}
        >
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Add Members to Club</DialogTitle>
                    <DialogDescription>Search for users and select them to add as members to this club.</DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-4">
                    <div className="relative">
                        <Search className="absolute top-2.5 left-2.5 h-4 w-4 text-gray-500" />
                        <Input
                            placeholder="Search by name, email, or student ID..."
                            className="pl-8"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            disabled={isSubmitting || isLoading}
                        />
                    </div>

                    {/* Selected users */}
                    {selectedUsers.length > 0 && (
                        <div className="mt-2">
                            <p className="mb-2 text-sm font-medium text-gray-500">Selected ({selectedUsers.length}):</p>
                            <div className="flex flex-wrap gap-2">
                                {selectedUsers.map((user) => (
                                    <div
                                        key={user.id}
                                        className="bg-primary-50 text-primary-700 flex items-center gap-1 rounded-full px-3 py-1 text-sm"
                                    >
                                        <span>{user.name}</span>
                                        <button
                                            type="button"
                                            className="text-primary-700 hover:text-primary-900 ml-1 rounded-full"
                                            onClick={() => toggleUserSelection(user)}
                                            disabled={isSubmitting}
                                        >
                                            ×
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* User list */}
                    <div className="max-h-60 overflow-y-auto rounded-md border">
                        {isLoading ? (
                            <div className="flex h-20 items-center justify-center">
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                <p className="text-sm text-gray-500">Loading users...</p>
                            </div>
                        ) : filteredUsers.length > 0 ? (
                            <ul className="divide-y">
                                {filteredUsers.map((user) => {
                                    const isSelected = selectedUsers.some((selected) => selected.id === user.id);
                                    return (
                                        <li key={user.id}>
                                            <div
                                                className={`flex cursor-pointer items-center justify-between p-3 hover:bg-gray-800 ${
                                                    isSelected ? 'bg-primary-50' : ''
                                                }`}
                                                onClick={() => toggleUserSelection(user)}
                                            >
                                                <div className="flex items-center gap-3">
                                                    <Checkbox
                                                        checked={isSelected}
                                                        onCheckedChange={() => toggleUserSelection(user)}
                                                        disabled={isSubmitting}
                                                        id={`user-${user.id}`}
                                                    />
                                                    <Avatar className="h-8 w-8 rounded-md border border-gray-300">
                                                        <AvatarImage src={user.avatar || ''} alt={user.name} />
                                                        <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                                                    </Avatar>
                                                    <div className="flex flex-col">
                                                        <span className="font-medium">{user.name}</span>
                                                        <span className="text-xs text-gray-500">
                                                            {user.student_id && `${user.student_id} · `}
                                                            {user.email}
                                                        </span>
                                                    </div>
                                                </div>
                                                {isSelected && <Check className="text-primary-600 h-4 w-4" />}
                                            </div>
                                        </li>
                                    );
                                })}
                            </ul>
                        ) : allNonMembers.length > 0 ? (
                            <div className="flex h-20 items-center justify-center">
                                <p className="text-sm text-gray-500">No users match your search</p>
                            </div>
                        ) : (
                            <div className="flex h-20 items-center justify-center">
                                <p className="text-sm text-gray-500">No users available to add</p>
                            </div>
                        )}
                    </div>
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
                        Cancel
                    </Button>
                    <ProcessingButton processing={isSubmitting} onClick={handleSubmit} disabled={selectedUsers.length === 0 || isLoading}>
                        {!isSubmitting && <UserPlus className="mr-2 h-4 w-4" />}
                        {isSubmitting ? 'Adding Members...' : `Add ${selectedUsers.length} ${selectedUsers.length === 1 ? 'Member' : 'Members'}`}
                    </ProcessingButton>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
