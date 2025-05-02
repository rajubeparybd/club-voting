import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AlertCircle } from 'lucide-react';

interface DeleteConfirmationDialogProps {
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
    onConfirm: () => void;
    onCancel: () => void;
    isLoading: boolean;
}

export function DeleteConfirmationDialog({ isOpen, onOpenChange, onConfirm, onCancel, isLoading }: DeleteConfirmationDialogProps) {
    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <AlertCircle className="size-5 text-red-500" />
                        Confirm Deletion
                    </DialogTitle>
                    <DialogDescription>Are you sure you want to delete this item? This action cannot be undone.</DialogDescription>
                </DialogHeader>
                <DialogFooter className="mt-4 flex sm:justify-end">
                    <Button variant="outline" onClick={onCancel} className="mr-2">
                        Cancel
                    </Button>
                    <Button variant="destructive" onClick={onConfirm} disabled={isLoading}>
                        {isLoading ? 'Deleting...' : 'Yes, Delete'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
