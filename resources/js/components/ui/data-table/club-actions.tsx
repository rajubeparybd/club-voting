import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Eye, MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import { Link } from "@inertiajs/react";
import { route } from "ziggy-js";
import CheckUserPermission from "../check-user-permission";

interface ClubActionsProps {
  clubId: number;
  onDelete: (id: number) => void;
  disabled?: boolean;
}

export function     ClubActions({ clubId, onDelete, disabled = false }: ClubActionsProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon">
          <MoreHorizontal className="size-4" />
          <span className="sr-only">Open menu</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <CheckUserPermission permission="view_clubs">
          <DropdownMenuItem asChild>
            <Link href={route('admin.clubs.show', clubId)} className="flex w-full items-center">
              <Eye className="mr-2 size-4" />
              View Details
            </Link>
          </DropdownMenuItem>
        </CheckUserPermission>
        <CheckUserPermission permission="edit_clubs">
          <DropdownMenuItem asChild>
            <Link href={route('admin.clubs.edit', clubId)} className="flex w-full items-center">
              <Pencil className="mr-2 size-4" />
            Edit Club
            </Link>
          </DropdownMenuItem>
        </CheckUserPermission>
        <CheckUserPermission permission="delete_clubs">
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => onDelete(clubId)}
              className="text-red-600 focus:text-red-600"
          disabled={disabled}
        >
          <Trash2 className="mr-2 size-4" />
              Delete Club
            </DropdownMenuItem>
          </>
        </CheckUserPermission>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
