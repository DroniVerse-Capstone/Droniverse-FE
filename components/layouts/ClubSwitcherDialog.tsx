 "use client";

import React from "react";
import { usePathname } from "next/navigation";

import { useGetMyClubs } from "@/hooks/club/useClub";
import { useLocale, useTranslations } from "@/providers/i18n-provider";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Spinner } from "@/components/ui/spinner";

type ClubSwitcherDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelectClub: (clubName: string, clubId: string) => void;
  trigger: React.ReactNode;
};

export default function ClubSwitcherDialog({
  open,
  onOpenChange,
  onSelectClub,
  trigger,
}: ClubSwitcherDialogProps) {
  const t = useTranslations("ClubDetail.ClubSwitcher");
  const pathname = usePathname();
  const locale = useLocale();

  const {
    data: clubs = [],
    isLoading,
    isError,
    error,
  } = useGetMyClubs({});

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>

      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{t("title")}</DialogTitle>
          <DialogDescription>
            {t("subtitle")}
          </DialogDescription>
        </DialogHeader>

        <div className="max-h-80 space-y-2 overflow-y-auto pr-1">
          {isLoading && (
            <div className="flex min-h-28 items-center justify-center">
              <Spinner className="h-5 w-5" />
            </div>
          )}

          {isError && (
            <p className="text-sm text-destructive">
              {error.response?.data?.message || error.message}
            </p>
          )}

          {!isLoading && !isError && clubs.length === 0 && (
            <p className="text-sm text-muted-foreground">
              {t("empty")}
            </p>
          )}

          {!isLoading &&
            !isError &&
            clubs.map((club) => {
              const clubName =
                locale === "en" ? club.nameEN || club.nameVN : club.nameVN;
              const isCurrent = pathname?.endsWith(`-${club.clubID}`);

              return (
                <button
                  key={club.clubID}
                  type="button"
                  onClick={() => onSelectClub(club.nameVN, club.clubID)}
                  className={`w-full rounded bg-url(club.imageUrl || "/images/club-placeholder.jpg") border p-3 text-left transition-colors ${
                    isCurrent
                      ? "border-primary bg-primary/15"
                      : "border-greyscale-700 bg-greyscale-900 hover:bg-greyscale-800"
                  }`}
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate font-medium text-greyscale-0">
                        {clubName}
                      </p>
                      <p className="text-xs text-greyscale-100">
                        {club.clubCode}
                      </p>
                    </div>

                    {isCurrent && (
                      <span className="text-xs text-primary">{t("now")}</span>
                    )}
                  </div>
                </button>
              );
            })}
        </div>
      </DialogContent>
    </Dialog>
  );
}