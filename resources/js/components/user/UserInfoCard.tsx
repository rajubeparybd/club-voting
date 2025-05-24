import dashboard from '@/../images/dashboard.svg';
import { type User } from '@/types';
export default function UserInfoCard({ user }: { user: User }) {
    // Extract session data into variables
    const name = user?.name || 'Guest';
    const id = user?.student_id || 'N/A';
    const email = user?.email || 'N/A';
    const department = user?.department?.name || 'N/A';
    const date = new Date().toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    });

    return (
        <div className="mb-8 rounded-2xl bg-[#3A4053] p-4 lg:bg-gradient-to-br lg:from-[#3A4053] lg:to-[#F4E5FF] lg:p-8">
            {/* Mobile design - left aligned, date at bottom-right */}
            <div className="relative flex flex-col lg:hidden">
                <h1 className="mb-2 text-2xl font-semibold text-white">{name}</h1>
                <p className="mb-2 text-white">ID: {id}</p>
                <p className="mb-2 text-white">Dept: {department}</p>
                <p className="mb-2 text-white">Email: {email}</p>
                <p className="mt-2 self-end text-sm text-gray-300">{date}</p>
            </div>

            {/* Desktop design - side by side with image */}
            <div className="hidden lg:flex lg:flex-row lg:items-center lg:justify-between">
                <div>
                    <p className="mb-2 text-gray-300">{date}</p>
                    <h1 className="mb-2 text-3xl font-semibold text-white">{name}</h1>
                    <p className="mb-2 text-white">ID: {id}</p>
                    <p className="mb-2 text-white">Dept: {department}</p>
                    <p className="mb-2 text-white">Email: {email}</p>
                </div>
                <div>
                    <img src={dashboard} alt="Dashboard" width={450} height={450} className="ml-8" />
                </div>
            </div>
        </div>
    );
}
