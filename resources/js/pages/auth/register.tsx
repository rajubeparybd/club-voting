import { Head, useForm } from '@inertiajs/react';
import { CheckCircle, LoaderCircle } from 'lucide-react';
import { FormEventHandler, useCallback, useMemo, useState } from 'react';
import { z } from 'zod';

import { Button } from '@/components/ui/button';
import { ImageUpload } from '@/components/ui/image-upload';
import { Input } from '@/components/ui/input';
import InputError from '@/components/ui/input-error';
import { Label } from '@/components/ui/label';
import ProcessingButton from '@/components/ui/processing-button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import TextLink from '@/components/ui/text-link';
import AuthLayout from '@/layouts/auth/auth-layout';
import { cn } from '@/lib/utils';
import { Department } from '@/types';
import axios from 'axios';
import { toast } from 'sonner';

// Define validation schemas for each step
const academicInfoSchema = z.object({
    student_id: z.string().min(1, 'Student ID is required.'),
    intake: z.string().min(1, 'Intake is required.'),
});

const personalInfoSchema = z.object({
    name: z.string().min(1, 'Name is required.'),
    email: z.string().email('Invalid email address.'),
    department_id: z.string().min(1, 'Department is required.'),
    gender: z.string().min(1, 'Gender is required.'),
    avatar: z.union([z.string().min(1, 'Please upload a profile picture.'), z.null()]).refine((val) => val !== null && val !== '', {
        message: 'Profile picture is required. Please upload an image.',
    }),
});

const passwordSchema = z
    .object({
        password: z.string().min(8, 'Password must be at least 8 characters.'),
        password_confirmation: z.string().min(1, 'Password confirmation is required.'),
    })
    .refine((data) => data.password === data.password_confirmation, {
        message: "Passwords don't match",
        path: ['password_confirmation'],
    });

type RegisterForm = {
    student_id: string;
    intake: string;
    name: string;
    email: string;
    gender: string;
    department_id: string;
    avatar: string;
    password: string;
    password_confirmation: string;
};

// TODO: System don't show the error message while registering.

export default function Register() {
    const { data, setData, post, processing, errors, reset, setError } = useForm<Required<RegisterForm>>({
        student_id: '',
        intake: '',
        name: '',
        email: '',
        gender: '',
        department_id: '',
        avatar: '',
        password: '',
        password_confirmation: '',
    });
    const [step, setStep] = useState(0);
    const [isFetching, setIsFetching] = useState(false);
    const [allDepartments, setAllDepartments] = useState<Department[]>([]);

    const totalSteps = 3;
    const labels = useMemo(() => ['Academic Information', 'Personal Information', 'Additional Information'], []);

    // Validate current step data
    const validateStep = useCallback(
        (currentStep: number) => {
            try {
                if (currentStep === 0) {
                    academicInfoSchema.parse({
                        student_id: data.student_id,
                        intake: data.intake,
                    });
                } else if (currentStep === 1) {
                    personalInfoSchema.parse({
                        name: data.name,
                        email: data.email,
                        department_id: data.department_id,
                        gender: data.gender,
                        avatar: data.avatar,
                    });
                } else if (currentStep === 2) {
                    passwordSchema.parse({
                        password: data.password,
                        password_confirmation: data.password_confirmation,
                    });
                }
                return true;
            } catch (error) {
                if (error instanceof z.ZodError) {
                    error.errors.forEach((err) => {
                        if (err.path) {
                            setError(err.path[0] as keyof RegisterForm, err.message);
                        }
                    });
                }
                return false;
            }
        },
        [data, setError],
    );

    const handleNext = useCallback(() => {
        if (validateStep(step)) {
            if (step < totalSteps - 1) {
                setStep(step + 1);
            }
        }
    }, [step, totalSteps, validateStep]);

    const fetchStudentInfo = useCallback(async () => {
        if (!validateStep(0)) return;

        setIsFetching(true);
        try {
            const response = await axios.post(route('verify-student'), { student_id: data.student_id });
            setAllDepartments(response.data.all_departments);
            const student = response.data.student;

            if (student.intake !== data.intake) {
                setError('intake', 'Invalid intake');
                return;
            }

            setData({
                ...data,
                name: student.name,
                email: student.email,
                department_id: student.department_id.toString(),
                gender: student.gender,
                intake: student.intake,
                avatar: student.avatar,
            });

            handleNext();
        } catch (error) {
            toast.error('Something went wrong. Please try again.');
            console.error(error);
        } finally {
            setIsFetching(false);
        }
    }, [data, setData, setError, handleNext, validateStep]);

    const submit: FormEventHandler = useCallback(
        (e) => {
            e.preventDefault();

            if (!validateStep(2)) return;

            post(route('register'), {
                onFinish: () => reset('password', 'password_confirmation'),
            });
        },
        [validateStep, post, reset],
    );

    // Memoize form steps to prevent unnecessary re-renders
    const renderAcademicInfoStep = useMemo(
        () => (
            <>
                <div className="grid gap-2">
                    <Label htmlFor="student_id">Student ID</Label>
                    <Input
                        id="student_id"
                        type="text"
                        required
                        autoFocus
                        tabIndex={1}
                        autoComplete="student_id"
                        value={data.student_id}
                        onChange={(e) => setData('student_id', e.target.value)}
                        disabled={processing}
                        placeholder="Enter Student ID"
                    />
                    <InputError message={errors.student_id} className="mt-2" />
                </div>

                <div className="grid gap-2">
                    <Label htmlFor="intake">Intake</Label>
                    <Input
                        id="intake"
                        type="text"
                        required
                        tabIndex={2}
                        autoComplete="intake"
                        value={data.intake}
                        onChange={(e) => setData('intake', e.target.value)}
                        disabled={processing}
                        placeholder="Enter Intake"
                    />
                    <InputError message={errors.intake} />
                </div>
                <ProcessingButton processing={isFetching} onClick={fetchStudentInfo}>
                    {isFetching ? 'Processing...' : 'Next'}
                </ProcessingButton>
            </>
        ),
        [data.student_id, data.intake, errors.student_id, errors.intake, processing, isFetching, fetchStudentInfo, setData],
    );

    const renderPersonalInfoStep = useMemo(
        () => (
            <>
                <div className="grid gap-2">
                    <Label htmlFor="name">Name</Label>
                    <Input
                        id="name"
                        type="text"
                        required
                        autoFocus
                        tabIndex={1}
                        autoComplete="name"
                        value={data.name}
                        onChange={(e) => setData('name', e.target.value)}
                        disabled={processing}
                        placeholder="Full name"
                    />
                    <InputError message={errors.name} className="mt-2" />
                </div>

                <div className="grid gap-2">
                    <Label htmlFor="email">Email address</Label>
                    <Input
                        id="email"
                        type="email"
                        required
                        tabIndex={2}
                        autoComplete="email"
                        value={data.email}
                        onChange={(e) => setData('email', e.target.value)}
                        disabled={processing}
                        placeholder="email@example.com"
                    />
                    <InputError message={errors.email} />
                </div>

                <div className="grid gap-2">
                    <Label htmlFor="department_id">Department</Label>
                    <Select value={data.department_id} onValueChange={(value) => setData('department_id', value)}>
                        <SelectTrigger>
                            <SelectValue placeholder="Select Department" />
                        </SelectTrigger>
                        <SelectContent>
                            {allDepartments.map((department) => (
                                <SelectItem key={department.id} value={department.id.toString()}>
                                    {department.name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <InputError message={errors.department_id} />
                </div>

                <div className="grid gap-2">
                    <Label htmlFor="gender">Gender</Label>
                    <Select value={data.gender} onValueChange={(value) => setData('gender', value)}>
                        <SelectTrigger>
                            <SelectValue placeholder="Select Gender" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="M">Male</SelectItem>
                            <SelectItem value="F">Female</SelectItem>
                            <SelectItem value="O">Other</SelectItem>
                        </SelectContent>
                    </Select>
                    <InputError message={errors.gender} />
                </div>

                <div className="grid gap-2">
                    <Label htmlFor="avatar">Avatar</Label>
                    <ImageUpload value={data.avatar} onChange={(value) => setData('avatar', value)} previewImage={data.avatar} />
                    <InputError message={errors.avatar} />
                </div>

                <Button className="mt-2 w-full" onClick={handleNext}>
                    Next
                </Button>
            </>
        ),
        [
            data.name,
            data.email,
            data.department_id,
            data.gender,
            data.avatar,
            errors.name,
            errors.email,
            errors.department_id,
            errors.gender,
            errors.avatar,
            processing,
            allDepartments,
            handleNext,
            setData,
        ],
    );

    const renderPasswordStep = useMemo(
        () => (
            <>
                <div className="grid gap-2">
                    <Label htmlFor="password">Password</Label>
                    <Input
                        id="password"
                        type="password"
                        required
                        tabIndex={3}
                        autoComplete="new-password"
                        value={data.password}
                        onChange={(e) => setData('password', e.target.value)}
                        disabled={processing}
                        placeholder="Password"
                    />
                    <InputError message={errors.password} />
                </div>

                <div className="grid gap-2">
                    <Label htmlFor="password_confirmation">Confirm password</Label>
                    <Input
                        id="password_confirmation"
                        type="password"
                        required
                        tabIndex={4}
                        autoComplete="new-password"
                        value={data.password_confirmation}
                        onChange={(e) => setData('password_confirmation', e.target.value)}
                        disabled={processing}
                        placeholder="Confirm password"
                    />
                    <InputError message={errors.password_confirmation} />
                </div>

                <Button type="submit" className="mt-2 w-full" tabIndex={5} disabled={processing}>
                    {processing && <LoaderCircle className="h-4 w-4 animate-spin" />}
                    Submit
                </Button>
            </>
        ),
        [data.password, data.password_confirmation, errors.password, errors.password_confirmation, processing, setData],
    );

    return (
        <AuthLayout title="Create an account" description="Enter your details below to create your account">
            <Head title="Register" />
            <div className="-mt-10 mb-20 flex items-center justify-center">
                {Array.from({ length: totalSteps }).map((_, index) => (
                    <div key={index} className="flex items-center">
                        <div className="relative flex flex-col items-center">
                            <div
                                className={cn(
                                    'flex h-6 w-6 items-center justify-center rounded-full transition-all duration-300 ease-in-out',
                                    index <= step ? 'bg-primary' : 'bg-primary/30',
                                    index < step && 'bg-primary',
                                )}
                            >
                                {index < step ? (
                                    <span className="text-sm font-medium">
                                        <CheckCircle className="h-4 w-4 text-white" />
                                    </span>
                                ) : (
                                    index + 1
                                )}
                            </div>
                            <span className="text-muted-foreground absolute top-10 text-center text-sm">{labels[index]}</span>
                        </div>
                        {index < totalSteps - 1 && <div className={cn('h-0.5 w-28', index < step ? 'bg-primary' : 'bg-primary/30')} />}
                    </div>
                ))}
            </div>

            <form className="flex flex-col gap-6" onSubmit={submit}>
                <div className="grid gap-6">
                    {step === 0 && renderAcademicInfoStep}
                    {step === 1 && renderPersonalInfoStep}
                    {step === 2 && renderPasswordStep}
                </div>

                <div className="text-muted-foreground text-center text-sm">
                    Already have an account?{' '}
                    <TextLink href={route('login')} tabIndex={6}>
                        Log in
                    </TextLink>
                </div>
            </form>
        </AuthLayout>
    );
}
