import AppLogoIcon from '@/components/app/app-logo-icon';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import CheckUserRole from '@/components/ui/check-user-role';
import { Head, Link } from '@inertiajs/react';
import { ArrowLeft, Ban } from 'lucide-react';

export default function AccessDenied() {
    return (
        <div className="bg-muted flex min-h-svh flex-col items-center justify-center gap-8 p-6 md:p-10">
            <Head title="Access Denied" />
            <div className="flex w-full max-w-md flex-col gap-6">
                <Link href={route('home')} className="flex items-center gap-2 self-center font-medium">
                    <div className="flex h-10 w-10 items-center justify-center">
                        <AppLogoIcon className="size-10 fill-current text-black dark:text-white" />
                    </div>
                </Link>

                <Card className="border-destructive/20 rounded-xl shadow-lg">
                    <CardHeader className="px-10 pt-8 pb-0 text-center">
                        <div className="bg-destructive/10 mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full">
                            <Ban className="text-destructive h-10 w-10" />
                        </div>
                        <CardTitle className="text-2xl font-bold">Access Denied</CardTitle>
                        <CardDescription className="mt-2 text-base">You don't have permission to access this page</CardDescription>
                    </CardHeader>
                    <CardContent className="flex flex-col items-center px-10 py-8">
                        <CheckUserRole
                            role="user"
                            fallback={
                                <Button asChild variant="default" className="gap-2">
                                    <Link href={route('admin.dashboard')}>
                                        <ArrowLeft className="size-4" />
                                        <span>Return to Dashboard</span>
                                    </Link>
                                </Button>
                            }
                        >
                            <Button asChild variant="default" className="gap-2">
                                <Link href={route('user.dashboard')}>
                                    <ArrowLeft className="size-4" />
                                    <span>Return to Dashboard</span>
                                </Link>
                            </Button>
                        </CheckUserRole>
                    </CardContent>
                </Card>

                <div className="text-muted-foreground text-center text-sm">If you believe this is an error, please contact the administrator.</div>
            </div>
        </div>
    );
}
