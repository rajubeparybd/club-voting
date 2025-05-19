import { Button } from '@/components/ui/button';
import { router } from '@inertiajs/react';
import { Award } from 'lucide-react';
import { route } from 'ziggy-js';

const ReadyToLeadCard = () => {
    const handleBecomeCandidate = () => {
        router.post(route('user.nominations.become-candidate'));
    };

    return (
        <section className="rounded-xl bg-[#26304a] p-6 text-white shadow-md">
            <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center">
                    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-blue-500">
                        <Award className="h-8 w-8" />
                    </div>
                    <div className="space-y-1">
                        <h2 className="text-2xl font-bold">Ready to Lead?</h2>
                        <p className="text-gray-300">Join a club as a candidate and make a difference!</p>
                    </div>
                </div>
                <Button onClick={handleBecomeCandidate} className="bg-blue-500 px-5 py-2 font-medium text-white hover:bg-blue-600">
                    Become a Candidate
                </Button>
            </div>
        </section>
    );
};

export default ReadyToLeadCard;
