import { DropdownMenuGroup, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';
import { UserInfo } from '@/components/user/user-info';
import { userContextMenuItems } from '@/config/user-menu';
import { useMobileNavigation } from '@/hooks/use-mobile-navigation';
import { type User } from '@/types';
import { Link } from '@inertiajs/react';
import { LogOut } from 'lucide-react';

interface UserMenuContentProps {
    user: User;
}

export function UserMenuContent({ user }: UserMenuContentProps) {
    const cleanup = useMobileNavigation();

    return (
        <>
            <DropdownMenuLabel className="p-0 font-normal">
                <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                    <UserInfo user={user} showEmail={true} />
                </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
                {userContextMenuItems.map((item) => (
                    <>
                        {item.separatorBefore && <DropdownMenuSeparator />}
                        <DropdownMenuItem asChild key={item.title}>
                            <Link className="block w-full" href={item.href} as="button" prefetch onClick={cleanup}>
                                {item.icon && <item.icon className="mr-2" />}
                                {item.title}
                            </Link>
                        </DropdownMenuItem>
                        {item.separatorAfter && <DropdownMenuSeparator />}
                    </>
                ))}
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
                <Link className="block w-full" method="post" href={route('logout')} as="button" onClick={cleanup}>
                    <LogOut className="mr-2" />
                    Log out
                </Link>
            </DropdownMenuItem>
        </>
    );
}
