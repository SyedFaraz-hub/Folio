"use client";

import { Link2, Loader2, Lock } from "lucide-react";
import { toast } from "sonner";

import {
  Button,
  Dialog,
  DialogContent,
  DialogFooter,
  Select,
  SelectContent,
  SelectItem,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from "@/components/ui";

import { useChangeRole, useRevokeShare, useShares } from "../hooks";
import type { ShareRole } from "../types";
import { InviteForm } from "./InviteForm";
import { PersonRow } from "./PersonRow";

interface ShareDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  documentId: string;
  title: string;
  currentUserId: string;
}

export function ShareDialog({
  open,
  onOpenChange,
  documentId,
  title,
  currentUserId,
}: ShareDialogProps) {
  const shares = useShares(documentId, open);
  const changeRole = useChangeRole(documentId);
  const revoke = useRevokeShare(documentId);

  const onRoleChange = (userId: string, name: string, value: string) => {
    if (value === "remove") {
      revoke.mutate(userId, { onSuccess: () => toast.success(`Removed ${name}`) });
    } else {
      changeRole.mutate({ userId, role: value as ShareRole });
    }
  };

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(`${window.location.origin}/documents/${documentId}`);
      toast.success("Link copied — only people with access can open it");
    } catch {
      toast.error("Couldn’t copy the link");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        title={`Share “${title}”`}
        description="Invite people by email and choose what they can do."
      >
        <InviteForm documentId={documentId} />

        <div className="flex flex-col px-4 pt-[18px] pb-2">
          <span className="px-2 pb-1.5 text-xs font-medium text-muted-foreground">
            People with access
          </span>
          {shares.isPending ? (
            <div className="flex h-24 items-center justify-center text-muted-foreground">
              <Loader2 className="size-4 animate-spin" aria-label="Loading people" />
            </div>
          ) : shares.isError ? (
            <p className="m-0 px-2 py-4 text-[13px] text-destructive-text">
              {shares.error.message}
            </p>
          ) : (
            <>
              <PersonRow person={shares.data.owner} isYou={shares.data.owner.id === currentUserId}>
                <span className="pr-2.5 text-[13px] text-muted-foreground">Owner</span>
              </PersonRow>
              {shares.data.shares.map(({ user, role }) => (
                <PersonRow key={user.id} person={user}>
                  <Select value={role} onValueChange={(v) => onRoleChange(user.id, user.name, v)}>
                    <SelectTrigger aria-label={`${user.name} permission`}>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent align="end">
                      <SelectItem value="editor">Can edit</SelectItem>
                      <SelectItem value="viewer">Can view</SelectItem>
                      <SelectSeparator />
                      <SelectItem value="remove" tone="destructive">
                        Remove access
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </PersonRow>
              ))}
            </>
          )}
        </div>

        <div className="mx-6 flex items-center gap-3 border-t border-divider py-3.5">
          <span className="flex size-8 shrink-0 items-center justify-center rounded-control bg-muted text-subtle-foreground">
            <Lock className="size-[15px]" strokeWidth={2.2} />
          </span>
          <span className="flex flex-1 flex-col">
            <span className="text-sm font-medium">Restricted</span>
            <span className="text-xs text-muted-foreground">
              Only people added above can open this document
            </span>
          </span>
        </div>

        <DialogFooter className="mt-0 justify-between">
          <Button variant="outline" size="sm" icon={<Link2 />} onClick={copyLink}>
            Copy link
          </Button>
          <Button size="sm" className="px-4" onClick={() => onOpenChange(false)}>
            Done
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
