import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { StatusBadge } from '@/components/ui/status-badge';
import { router } from '@inertiajs/react';
import axios, { AxiosError } from 'axios';
import { AlertCircle, Loader2 } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

// Student data interface
interface StudentApiData {
    id?: string;
    name?: string;
    email?: string;
    department_id?: number;
    gender?: string;
    intake?: string;
    avatar?: string | null;
    [key: string]: string | number | null | undefined;
}

interface ApiErrorResponse {
    message?: string;
    [key: string]: string | string[] | undefined;
}

interface CreateUserDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function CreateUserDialog({ open, onOpenChange }: CreateUserDialogProps) {
    const [studentId, setStudentId] = useState<string>('');
    const [intake, setIntake] = useState<string>('');
    const [email, setEmail] = useState<string>('');

    const [isChecking, setIsChecking] = useState(false);
    const [isCreating, setIsCreating] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [studentData, setStudentData] = useState<StudentApiData | null>(null);

    const handleVerifyStudent = async () => {
        if (!studentId) {
            setError('Student ID is required');
            return;
        }

        setIsChecking(true);
        setError(null);

        try {
            const response = await axios.post(route('verify-student'), {
                student_id: studentId,
            });

            if (response.data.student) {
                setStudentData(response.data.student);
                console.log(response.data.student);
                if (response.data.student.email) {
                    setEmail(response.data.student.email);
                }

                if (response.data.student.intake) {
                    setIntake(response.data.student.intake);
                }

                toast.success('Student verified successfully');
            } else {
                setError('Failed to verify student. Please check the Student ID.');
            }
        } catch (err: unknown) {
            const axiosError = err as AxiosError<ApiErrorResponse>;
            setError(axiosError.response?.data?.message || 'Failed to verify student');
        } finally {
            setIsChecking(false);
        }
    };

    const handleCreateUser = () => {
        if (!studentId || !intake || !email) {
            setError('All fields are required');
            return;
        }

        if (!studentData) {
            setError('Please verify the student first');
            return;
        }

        setIsCreating(true);
        setError(null);

        router.post(
            route('admin.users.store-from-api'),
            {
                student_id: studentId,
                intake: intake,
                email: email,
                student_data: studentData,
            },
            {
                onSuccess: () => {
                    setIsCreating(false);
                    onOpenChange(false);
                    resetForm();
                    toast.success('User created successfully with auto-generated password');
                },
                onError: (errors) => {
                    setIsCreating(false);

                    if (errors.email) {
                        setError(`Email error: ${errors.email}`);
                    } else if (errors.student_id) {
                        setError(`Student ID error: ${errors.student_id}`);
                    } else {
                        setError('Failed to create user. Please try again.');
                    }
                },
            },
        );
    };

    const resetForm = () => {
        setStudentId('');
        setIntake('');
        setEmail('');
        setStudentData(null);
        setError(null);
    };

    return (
        <Dialog
            open={open}
            onOpenChange={(newOpen) => {
                if (!isChecking && !isCreating) {
                    if (!newOpen) {
                        resetForm();
                    }
                    onOpenChange(newOpen);
                }
            }}
        >
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Create New User</DialogTitle>
                    <DialogDescription>
                        Enter student details to create a new user account. A password will be auto-generated and sent to the user's email.
                    </DialogDescription>
                </DialogHeader>

                {error && (
                    <Alert variant="destructive" className="my-2">
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>{error}</AlertDescription>
                    </Alert>
                )}

                <div className="flex flex-col gap-4 py-4">
                    <div>
                        <Label htmlFor="student_id" className="text-right">
                            Student ID
                        </Label>
                        <div className="flex gap-2">
                            <Input
                                id="student_id"
                                value={studentId}
                                onChange={(e) => setStudentId(e.target.value)}
                                disabled={isChecking || isCreating || !!studentData}
                                placeholder="Enter student ID"
                                className="flex-1"
                            />
                            {!studentData ? (
                                <Button onClick={handleVerifyStudent} disabled={isChecking || !studentId} type="button">
                                    {isChecking ? (
                                        <>
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            Verifying
                                        </>
                                    ) : (
                                        'Verify'
                                    )}
                                </Button>
                            ) : (
                                <Button
                                    onClick={() => {
                                        setStudentData(null);
                                        setError(null);
                                    }}
                                    variant="outline"
                                    disabled={isCreating}
                                    type="button"
                                >
                                    Change
                                </Button>
                            )}
                        </div>
                    </div>

                    {studentData && (
                        <div className="relative rounded-md bg-gray-800 p-3">
                            <div className="absolute top-2 right-2">
                                <StatusBadge status="success" label="Verified Student" />
                            </div>
                            <span className="font-medium">Name:</span> {studentData.name}
                            {studentData.gender && (
                                <p>
                                    <span className="font-medium">Gender:</span>{' '}
                                    {studentData.gender === 'M' ? 'Male' : studentData.gender === 'F' ? 'Female' : 'Other'}
                                </p>
                            )}
                        </div>
                    )}

                    <div>
                        <Label htmlFor="intake" className="text-right">
                            Intake
                        </Label>
                        <Input
                            id="intake"
                            value={intake}
                            onChange={(e) => setIntake(e.target.value)}
                            disabled={isChecking || isCreating || !studentData}
                            placeholder="Enter intake"
                        />
                    </div>

                    <div>
                        <Label htmlFor="email" className="text-right">
                            Email
                        </Label>
                        <Input
                            id="email"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            disabled={isChecking || isCreating || !studentData}
                            placeholder="Enter email address"
                        />
                    </div>
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isChecking || isCreating} type="button">
                        Cancel
                    </Button>
                    <Button onClick={handleCreateUser} disabled={isChecking || isCreating || !studentData || !intake || !email} type="button">
                        {isCreating ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Creating...
                            </>
                        ) : (
                            'Create User'
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
