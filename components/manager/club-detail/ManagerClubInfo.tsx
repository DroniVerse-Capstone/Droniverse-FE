"use client";

import Image from "next/image";
import { AxiosError } from "axios";
import { useParams, useRouter } from "next/navigation";
import { IoPeople, IoWalletSharp } from "react-icons/io5";
import { FiArrowRight } from "react-icons/fi";

import EmptyState from "@/components/common/EmptyState";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { useGetClubDetailById } from "@/hooks/club/useClub";
import { useGetMyWallet } from "@/hooks/wallet/useWallet";
import { useLocale, useTranslations } from "@/providers/i18n-provider";
import StatCard from "@/components/common/StatCard";
import { BiSolidBookAlt } from "react-icons/bi";
import { IoIosSettings } from "react-icons/io";

type ManagerClubInfoProps = {
  clubId?: string;
};
export default function ManagerClubInfo({ clubId }: ManagerClubInfoProps) {
  const t = useTranslations("ClubDetail.ClubInfo");
  const locale = useLocale();
  const router = useRouter();
  const params = useParams<{ clubSlug?: string }>();
  const clubSlug = params?.clubSlug;
  const {
    data: club,
    isLoading,
    isError,
    error,
  } = useGetClubDetailById(clubId);
  const {
    data: wallet,
    isLoading: isWalletLoading,
    error: walletError,
  } = useGetMyWallet();
  const isWalletNotFound =
    walletError instanceof AxiosError && walletError.response?.status === 404;

  const goToWallet = () => {
    router.push("/my-wallet");
  };
 
   if (isLoading) {
     return (
       <div className="flex min-h-[40vh] items-center justify-center">
         <Spinner className="h-6 w-6" />
       </div>
     );
   }
 
   if (!clubId) {
     return (
       <EmptyState
         title={t("empty.title")}
         description={t("empty.description")}
       />
     );
   }
 
   if (isError || !club) {
     return (
       <EmptyState
         title={t("error")}
         description={error?.response?.data?.message || error?.message}
       />
     );
   }
 
   const clubName = locale === "en" ? club.nameEN || club.nameVN : club.nameVN;

 
   return (
     <div className="flex gap-4 items-center justify-between">
       <div className="flex min-w-0 flex-1 items-start gap-4">
         <div className="relative h-32 w-32 shrink-0 overflow-hidden rounded">
           <Image
             src={club.imageUrl || "/images/club-placeholder.jpg"}
             alt={clubName}
             fill
             className="object-cover"
             sizes="128px"
             priority
           />
         </div>
 
         <div className="min-w-0 space-y-6">
           <div className="space-y-1">
             <h1 className="truncate text-2xl font-semibold text-greyscale-0">
               {clubName}
             </h1>
             <p className="text-base font-semibold text-greyscale-50">
               {club.clubCode}
             </p>
           </div>
 
           <Button variant={"secondary"} icon={<IoIosSettings size={20} />}>{t("edit")}</Button>
         </div>
       </div>
 
      <div className="flex gap-3 items-center">
         <StatCard
           icon={<IoPeople size={24} />}
           title={t("members")}
           value={club.totalMembers}
           variant="secondary"
         />

        <StatCard
          icon={<IoWalletSharp size={24} />}
          title={locale === "en" ? "Balance" : "Số dư"}
          value={
            isWalletLoading
              ? locale === "en"
                ? "Loading..."
                : "Đang tải..."
              : wallet
                ? `${wallet.balance.toLocaleString("vi-VN")} đ`
                : isWalletNotFound
                  ? locale === "en"
                    ? "No wallet"
                    : "Chưa có ví"
                  : locale === "en"
                    ? "Unavailable"
                    : "Không khả dụng"
          }
          variant={isWalletLoading || isWalletNotFound ? "primary" : "tertiary"}
        />
      </div>

      {!isWalletLoading && !wallet && isWalletNotFound ? (
        <div className="flex justify-end xl:col-span-2">
          <Button
            type="button"
            variant="default"
            onClick={goToWallet}
            icon={<FiArrowRight size={18} />}
          >
            {locale === "en" ? "Set up wallet" : "Thiết lập ví ngay"}
          </Button>
        </div>
      ) : null}

     </div>
   );
 }
 
