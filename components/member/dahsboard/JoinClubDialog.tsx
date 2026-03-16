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
import { da } from "zod/v4/locales";
import { Spinner } from "@/components/ui/spinner";

export default function JoinClubDialog() {
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
      toast.error(error?.response?.data?.message || "Không tìm thấy club");
    }
  }, [isError, error]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>Tham gia Club</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Tìm kiếm Club</DialogTitle>
          <p className="text-sm text-muted-foreground">
            Hãy nhập mã Club bạn muốn tham gia để đăng ký gia nhập
          </p>
        </DialogHeader>
        <div className="space-y-2 w-full">
          <Label className="text-sm font-medium">Mã Club</Label>
          <div className="grid w-full grid-cols-[1fr_auto] items-center gap-2">
            <Input
              className="min-w-0 w-full"
              value={clubCode}
              onChange={(e) => setClubCode(e.target.value)}
              placeholder="Nhập mã Club"
            />
            <Button
              className="shrink-0"
              variant={"secondary"}
              onClick={handleFindClub}
              disabled={isLoading || !clubCode}
            >
              {isLoading ? "Đang tìm..." : "Tìm Club"}
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
              Hủy bỏ
            </Button>
          </DialogClose>
          <Button onClick={handleJoin} disabled={!club || isJoining}>
            {isJoining ? <Spinner /> : "Tham gia"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
