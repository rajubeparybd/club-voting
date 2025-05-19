import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import CheckUserPermission from '@/components/ui/check-user-permission';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import ProcessingButton from '@/components/ui/processing-button';
import { StatusBadge } from '@/components/ui/status-badge';
import { Textarea } from '@/components/ui/textarea';
import { useInitials } from '@/hooks/use-initials';
import { NominationApplication } from '@/types';
import { router } from '@inertiajs/react';
import { format } from 'date-fns';
import { Check, Eye, X } from 'lucide-react';
import { useEffect, useState } from 'react';

interface ViewNominationModalProps {
    isOpen: boolean;
    onOpenChange: (isOpen: boolean) => void;
    application: NominationApplication | null;
    onSuccess?: () => void;
}

export default function ViewNominationModal({ isOpen, onOpenChange, application, onSuccess }: ViewNominationModalProps) {
    const getInitials = useInitials();
    const [adminNotes, setAdminNotes] = useState('');
    const [isApproveProcessing, setIsApproveProcessing] = useState(false);
    const [isRejectProcessing, setIsRejectProcessing] = useState(false);

    useEffect(() => {
        if (application) {
            setAdminNotes(application.admin_notes || '');
        }
    }, [application]);

    useEffect(() => {
        if (!isOpen) {
            setAdminNotes('');
        }
    }, [isOpen]);

    const handleApprove = () => {
        if (!application) return;
        setIsApproveProcessing(true);

        router.put(
            route('admin.applications.update', application.id),
            {
                status: 'approved',
                admin_notes: adminNotes,
            },
            {
                onSuccess: () => {
                    setIsApproveProcessing(false);
                    if (onSuccess) onSuccess();
                    onOpenChange(false);
                },
                onError: () => {
                    setIsApproveProcessing(false);
                },
            },
        );
    };

    const handleReject = () => {
        if (!application) return;
        setIsRejectProcessing(true);

        router.put(
            route('admin.applications.update', application.id),
            {
                status: 'rejected',
                admin_notes: adminNotes,
            },
            {
                onSuccess: () => {
                    setIsRejectProcessing(false);
                    if (onSuccess) onSuccess();
                    onOpenChange(false);
                },
                onError: () => {
                    setIsRejectProcessing(false);
                },
            },
        );
    };

    if (!application) {
        return null;
    }

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="max-h-[95vh] w-full overflow-y-auto lg:min-w-5xl">
                <DialogHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <DialogTitle>Nomination Application Details</DialogTitle>
                            <DialogDescription>Review the application details and take action.</DialogDescription>
                        </div>
                        <div className="text-muted-foreground text-sm">
                            <div>Submitted: {format(new Date(application.created_at), 'PPP p')}</div>
                            <div>Last Updated: {format(new Date(application.updated_at), 'PPP p')}</div>
                        </div>
                    </div>
                </DialogHeader>

                <div className="grid gap-6 py-4">
                    <div className="flex gap-2">
                        <h3 className="text-lg font-semibold">Status</h3>
                        <StatusBadge status={application.status} />
                    </div>

                    <div className="grid gap-6 md:grid-cols-2">
                        <div>
                            <h3 className="text-lg font-semibold">Club Information</h3>
                            <div className="mt-2 flex items-center gap-2">
                                <Avatar className="size-10 rounded-md border">
                                    <AvatarImage src={application.club?.image ?? undefined} alt={application.club?.name ?? 'Club'} />
                                </Avatar>
                                <div>
                                    <div className="font-medium">{application.club?.name}</div>
                                    <div className="text-muted-foreground text-sm">Position: {application.club_position?.name}</div>
                                </div>
                            </div>
                        </div>

                        <div>
                            <h3 className="text-lg font-semibold">Applicant Information</h3>
                            <div className="mt-2 flex items-center gap-2">
                                <Avatar className="size-8 rounded-md border">
                                    <AvatarImage src={application.user?.avatar ?? undefined} alt={application.user?.name ?? 'User'} />
                                    <AvatarFallback>{application.user?.name ? getInitials(application.user.name) : '-'}</AvatarFallback>
                                </Avatar>
                                <div className="flex flex-col">
                                    <span className="text-sm font-medium">{application.user?.name ?? '-'}</span>
                                    <span className="text-xs">{application.user?.email ?? '-'}</span>
                                    <span className="text-muted-foreground text-xs">
                                        ID: {application.user?.student_id ?? '-'} | Dept:{application.user?.department?.name ?? '-'}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div>
                        <h3 className="text-lg font-semibold">Application Documents</h3>
                        <div className="mt-2">
                            {application.cv_url ? (
                                <div className="flex items-end">
                                    <Button variant="outline" asChild>
                                        <a href={application.cv_url} target="_blank" rel="noopener noreferrer">
                                            <Eye className="mr-2 size-4" /> View CV
                                        </a>
                                    </Button>
                                </div>
                            ) : (
                                <div className="text-muted-foreground">No CV uploaded</div>
                            )}
                        </div>
                    </div>
                    <div>
                        <h3 className="text-lg font-semibold">Application Statement</h3>
                        <div className="bg-muted mt-2 rounded-md p-4 whitespace-pre-wrap">{application.statement}</div>
                    </div>

                    {application.status === 'pending' ? (
                        <div>
                            <Label htmlFor="admin_notes">Admin Notes</Label>
                            <Textarea
                                id="admin_notes"
                                value={adminNotes}
                                onChange={(e) => setAdminNotes(e.target.value)}
                                placeholder="Add notes about this application"
                                className="mt-2"
                                rows={5}
                            />
                        </div>
                    ) : (
                        <div>
                            <h3 className="text-lg font-semibold">Admin Notes</h3>
                            <div className="bg-muted mt-2 rounded-md p-4 whitespace-pre-wrap">{application.admin_notes || 'N/A'}</div>
                        </div>
                    )}
                </div>

                <DialogFooter>
                    <div>
                        {application.status === 'pending' ? (
                            <CheckUserPermission permission="edit_nomination_applications">
                                <div className="flex flex-row gap-2">
                                    <ProcessingButton onClick={handleReject} processing={isRejectProcessing} variant="destructive">
                                        {isRejectProcessing ? (
                                            'Processing...'
                                        ) : (
                                            <>
                                                <X className="mr-2 size-4" /> Reject
                                            </>
                                        )}
                                    </ProcessingButton>
                                    <ProcessingButton
                                        onClick={handleApprove}
                                        processing={isApproveProcessing}
                                        className="bg-green-600 hover:bg-green-700"
                                    >
                                        {isApproveProcessing ? (
                                            'Processing...'
                                        ) : (
                                            <>
                                                <Check className="mr-2 size-4" /> Approve
                                            </>
                                        )}
                                    </ProcessingButton>
                                </div>
                            </CheckUserPermission>
                        ) : (
                            <div className="flex flex-row gap-2">
                                <Button variant="outline" onClick={() => onOpenChange(false)}>
                                    Close
                                </Button>
                            </div>
                        )}
                    </div>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
