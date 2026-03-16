import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import ClubCard from "@/components/club/ClubCard";
import { useGetClubDetailByCode } from "@/hooks/club/useClub";
import { Label } from "@/components/ui/label";
import toast from "react-hot-toast";
import { useClubAttempt } from "@/hooks/club-attempt/useClubAttempt";
import { VscGitPullRequestGoToChanges } from "react-icons/vsc";
import { Spinner } from "@/components/ui/spinner";
import { useTranslations } from "@/providers/i18n-provider";

export default function JoinClubDialog() {
  const t = useTranslations("JoinClubDialog");
  const [clubCode, setClubCode] = useState("");
  const [searchCode, setSearchCode] = useState<string | null>(null);
  const [open, setOpen] = useState(false);

  const {
    data: club,
    isLoading,
    isError,
    error,
  } = useGetClubDetailByCode(searchCode || undefined);

  const { mutate: attemptJoinClub, isPending: isJoining } = useClubAttempt();

  const resetForm = () => {
    setClubCode("");
    setSearchCode(null);
  }

  const handleFindClub = () => {
    setSearchCode(clubCode.trim());
  };

  const handleJoin = () => {
    if (club) {
      attemptJoinClub(
        { clubCode: club.clubCode },
        {
          onSuccess: (data) => {
            setOpen(false);
            resetForm();
            toast.success(data.message);
          },
          onError: (error) => {
            toast.error(
              error.response?.data?.message || error.message,
            );
          },
        },
      );
    }
  };

  useEffect(() => {
    if (isError) {
      toast.error(error?.response?.data?.message || t("error"));
    }
  }, [isError, error]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button icon={<VscGitPullRequestGoToChanges size={20} />}>{t("title")}</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("title")}</DialogTitle>
          <p className="text-sm text-muted-foreground">
            {t("subtitle")}
          </p>
        </DialogHeader>
        <div className="space-y-2 w-full">
          <Label className="text-sm font-medium">{t("field.code")}</Label>
          <div className="grid w-full grid-cols-[1fr_auto] items-center gap-2">
            <Input
              className="min-w-0 w-full"
              value={clubCode}
              onChange={(e) => setClubCode(e.target.value)}
              placeholder={t("field.codePlaceholder")}
            />
            <Button
              className="shrink-0"
              variant={"secondary"}
              onClick={handleFindClub}
              disabled={isLoading || !clubCode}
            >
              {isLoading ? <Spinner /> : t("buttons.find")}
            </Button>
          </div>
        </div>
        {club && (
          <div className="mt-4">
            <ClubCard club={club} />
          </div>
        )}
        <DialogFooter>
          <DialogClose asChild>
            <Button onClick={resetForm} variant="outline">
              {t("buttons.cancel")}
            </Button>
          </DialogClose>
          <Button onClick={handleJoin} disabled={!club || isJoining}>
            {isJoining ? <Spinner /> : t("buttons.confirm")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
