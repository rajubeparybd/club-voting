import JoinClubButton from '@/components/user/JoinClubButton';
import { Club, PaymentMethod, User } from '@/types';

interface StandaloneJoinClubButtonProps {
    club: Club;
    user: User;
    paymentMethods: PaymentMethod[];
    variant?: 'default' | 'outline' | 'secondary' | 'destructive' | 'ghost' | 'link';
    className?: string;
}

export default function StandaloneJoinClubButton({ club, user, paymentMethods, variant, className }: StandaloneJoinClubButtonProps) {
    const isMember = club.users?.some((u) => u.id === user.id) || false;
    const memberUser = club.users?.find((u) => u.id === user.id);
    const memberStatus = memberUser?.pivot?.status || 'pending';

    return (
        <JoinClubButton
            club={club}
            userId={user.id.toString()}
            paymentMethods={paymentMethods}
            isMember={isMember}
            memberStatus={memberStatus}
            variant={variant}
            className={className}
        />
    );
}
