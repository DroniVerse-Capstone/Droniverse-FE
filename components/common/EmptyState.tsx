import {
  Empty,
  EmptyHeader,
  EmptyTitle,
  EmptyDescription,
  EmptyContent,
  EmptyMedia,
} from "@/components/ui/empty";
import { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { CiFolderOff } from "react-icons/ci";

type EmptyStateProps = {
  icon?: ReactNode;
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
};

export default function EmptyState({
  icon = <CiFolderOff size={50}/>,
  title,
  description,
  actionLabel,
  onAction,
}: EmptyStateProps) {
  return (
    <div className="flex items-center justify-center py-16">
      <Empty className="max-w-sm">
        <EmptyHeader>
          {icon && <EmptyMedia className="text-greyscale-100">{icon}</EmptyMedia>}

          <EmptyTitle className="text-greyscale-0">{title}</EmptyTitle>

          {description && (
            <EmptyDescription className="text-greyscale-100">{description}</EmptyDescription>
          )}
        </EmptyHeader>

        <EmptyContent />

        {actionLabel && (
          <EmptyContent>
            <Button onClick={onAction}>{actionLabel}</Button>
          </EmptyContent>
        )}
      </Empty>
    </div>
  );
}