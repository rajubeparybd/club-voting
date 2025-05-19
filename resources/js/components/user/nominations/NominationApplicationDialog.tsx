import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { FileUpload } from '@/components/ui/file-upload';
import { Label } from '@/components/ui/label';
import ProcessingButton from '@/components/ui/processing-button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { ClubPosition, Nomination, NominationApplication } from '@/types';
import { useForm } from '@inertiajs/react';
import { FormEventHandler, useEffect, useState } from 'react';

interface NominationApplicationDialogProps {
    isOpen: boolean;
    onOpenChange: (isOpen: boolean) => void;
    nomination: Nomination;
    applications: NominationApplication[];
}

type ApplicationFormData = {
    nomination_id: string;
    club_id: string;
    position_id: string;
    statement: string;
    cv: File | null;
};

export function NominationApplicationDialog({ isOpen, onOpenChange, nomination, applications }: NominationApplicationDialogProps) {
    const { data, setData, post, processing, errors, reset, wasSuccessful } = useForm<ApplicationFormData>({
        nomination_id: nomination?.id?.toString() || '',
        club_id: nomination?.club?.id?.toString() || '',
        position_id: '',
        statement: '',
        cv: null,
    });

    // Filter out the positions that the user has already applied for
    const positions = nomination?.club?.positions?.filter(
        (position) => !applications.some((application) => application.club_position_id === position.id),
    );

    const [validationErrors, setValidationErrors] = useState<Partial<Record<keyof ApplicationFormData, string>>>({});
    const [wordCount, setWordCount] = useState<number>(0);

    // Reset form when dialog opens/closes
    useEffect(() => {
        if (!isOpen) {
            reset();
            setValidationErrors({});
            setWordCount(0);
        }
    }, [isOpen, reset]);

    // Handle successful submission
    useEffect(() => {
        if (wasSuccessful) {
            onOpenChange(false);
        }
    }, [wasSuccessful, onOpenChange]);

    // Calculate word count when statement changes
    useEffect(() => {
        const words = data.statement.trim() ? data.statement.trim().split(/\s+/).length : 0;
        setWordCount(words);
    }, [data.statement]);

    const handleSubmit: FormEventHandler = (e) => {
        e.preventDefault();

        // Client-side validation
        const newErrors: Partial<Record<keyof ApplicationFormData, string>> = {};

        if (!data.position_id) {
            newErrors.position_id = 'Please select a position';
        }

        if (!data.statement) {
            newErrors.statement = 'Please enter your 1-year work target';
        } else if (data.statement.length < 150) {
            newErrors.statement = 'Work target should be more than 150 words';
        }

        if (!data.cv) {
            newErrors.cv = 'CV is required';
        }

        setValidationErrors(newErrors);

        // If there are validation errors, don't submit
        if (Object.keys(newErrors).length > 0) {
            return;
        }

        // Submit the form to the server
        post(route('user.nominations.apply'), {
            onSuccess: () => {
                onOpenChange(false);
            },
            preserveScroll: true,
            forceFormData: true,
        });
    };

    // Combined errors (from server-side validation and client-side validation)
    const getError = (field: keyof ApplicationFormData) => {
        return errors[field] || validationErrors[field];
    };

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="max-h-[95vh] max-w-lg overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Apply for Position in {nomination?.club?.name}</DialogTitle>
                    <DialogDescription>Please fill out the following information to apply for a position in this nomination.</DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <input type="hidden" name="nomination_id" value={data.nomination_id} />

                    <div className="space-y-2">
                        <Label htmlFor="position_id">Select Position</Label>
                        <Select value={data.position_id} onValueChange={(value) => setData('position_id', value)}>
                            <SelectTrigger id="position_id" className={getError('position_id') ? 'border-red-500' : ''}>
                                <SelectValue placeholder="Select a position" />
                            </SelectTrigger>
                            <SelectContent>
                                {positions?.map((position: ClubPosition) => (
                                    <SelectItem key={position.id} value={position.id.toString()}>
                                        {position.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        {getError('position_id') && <p className="mt-1 text-xs text-red-500">{getError('position_id')}</p>}
                    </div>

                    <div className="space-y-2">
                        <div className="flex items-center justify-between">
                            <Label htmlFor="statement">1-Year Work Target</Label>
                            <span className="text-xs text-gray-500">{wordCount} words</span>
                        </div>
                        <Textarea
                            id="statement"
                            value={data.statement}
                            onChange={(e) => setData('statement', e.target.value)}
                            className={getError('statement') ? 'border-red-500' : ''}
                            placeholder="Describe what you aim to achieve in this position over the next year"
                            rows={3}
                        />
                        {getError('statement') && <p className="mt-1 text-xs text-red-500">{getError('statement')}</p>}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="cv">CV/Resume (Required)</Label>
                        <FileUpload
                            value=""
                            onChange={() => {}}
                            onFileChange={(file) => setData('cv', file)}
                            hasError={!!getError('cv')}
                            acceptedFileTypes=".pdf,.doc,.docx"
                        />
                        {getError('cv') && <p className="mt-1 text-xs text-red-500">{getError('cv')}</p>}
                        <p className="text-xs text-gray-500">Upload your CV/Resume in PDF, DOC, or DOCX format (max 5MB).</p>
                    </div>

                    <DialogFooter className="mt-6">
                        <ProcessingButton type="submit" processing={processing}>
                            {processing ? 'Submitting...' : 'Submit Application'}
                        </ProcessingButton>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
