import {
    SidebarGroup,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarMenuSub,
    SidebarMenuSubButton,
    SidebarMenuSubItem,
} from '@/components/ui/sidebar';
import useAuthorization from '@/hooks/useAuthorization';
import { type NavItem } from '@/types';
import { Link, usePage } from '@inertiajs/react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@radix-ui/react-collapsible';
import { ChevronRight } from 'lucide-react';

// Component for rendering submenu items with permission check
function NavSubmenuItem({ item }: { item: NavItem }) {
    const { hasAnyPermission } = useAuthorization();

    // Skip rendering if user doesn't have required permissions
    if (item.permissions && !hasAnyPermission(item.permissions)) {
        return null;
    }

    return (
        <SidebarMenuSubItem>
            <SidebarMenuSubButton asChild>
                <Link href={item.href} prefetch>
                    {item.icon && <item.icon />}
                    <span>{item.title}</span>
                </Link>
            </SidebarMenuSubButton>
        </SidebarMenuSubItem>
    );
}

// Component for rendering collapsible menu items with submenu
function NavCollapsibleItem({ item }: { item: NavItem }) {
    const { hasAnyPermission } = useAuthorization();

    // Skip rendering if user doesn't have required permissions
    if (item.permissions && !hasAnyPermission(item.permissions)) {
        return null;
    }

    // Filter submenu items based on permissions
    const filteredSubmenu = item.submenu?.filter((subItem) => !subItem.permissions || hasAnyPermission(subItem.permissions));

    // Don't render if there are no accessible submenu items
    if (!filteredSubmenu?.length) {
        return null;
    }

    return (
        <Collapsible key={item.title} asChild defaultOpen={item.isActive} className="group/collapsible">
            <SidebarMenuItem>
                <CollapsibleTrigger asChild>
                    <SidebarMenuButton tooltip={item.title}>
                        {item.icon && <item.icon />}
                        <span>{item.title}</span>
                        <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                    </SidebarMenuButton>
                </CollapsibleTrigger>
                <CollapsibleContent>
                    <SidebarMenuSub>
                        {filteredSubmenu.map((subItem) => (
                            <NavSubmenuItem key={subItem.title} item={subItem} />
                        ))}
                    </SidebarMenuSub>
                </CollapsibleContent>
            </SidebarMenuItem>
        </Collapsible>
    );
}

// Component for rendering regular menu items
function NavMenuItem({ item }: { item: NavItem }) {
    const page = usePage();
    const { hasAnyPermission } = useAuthorization();

    // Skip rendering if user doesn't have required permissions
    if (item.permissions && !hasAnyPermission(item.permissions)) {
        return null;
    }

    return (
        <SidebarMenuItem>
            <SidebarMenuButton asChild isActive={item.href === page.url} tooltip={{ children: item.title }}>
                <Link href={item.href} prefetch>
                    {item.icon && <item.icon />}
                    <span>{item.title}</span>
                </Link>
            </SidebarMenuButton>
        </SidebarMenuItem>
    );
}

export function AdminNavMain({ items = [] }: { items: NavItem[] }) {
    return (
        <SidebarGroup className="px-2 py-0">
            {/* <SidebarGroupLabel>Platform</SidebarGroupLabel> */}
            <SidebarMenu>
                {items.map((item) =>
                    item.submenu ? <NavCollapsibleItem key={item.title} item={item} /> : <NavMenuItem key={item.title} item={item} />,
                )}
            </SidebarMenu>
        </SidebarGroup>
    );
}
