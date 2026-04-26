"use client";

import React from "react";
import { useParams } from "next/navigation";
import { useGetMyClubs } from "@/hooks/club/useClub";
import { useGetCompetitionsByClub } from "@/hooks/competitions/useCompetitions";
import { FadeIn } from "@/components/animation/FadeIn";
import { Loader2 } from "lucide-react";
import { useTranslations } from "@/providers/i18n-provider";
import MemberCompetitionCard from "./MemberCompetitionCard";
import { MdEmojiEvents, MdSearch } from "react-icons/md";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const UUID_SUFFIX_REGEX =
  /[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export default function MemberCompetitions() {
  const params = useParams<{ clubSlug?: string }>();
  const clubSlug = params?.clubSlug;
  const { data: myClubs = [] } = useGetMyClubs();
  const t = useTranslations("MemberCompetitions");

  const clubId = React.useMemo(() => {
    if (!clubSlug) return undefined;

    const matchedClub = myClubs.find((club) =>
      clubSlug.endsWith(`-${club.clubID}`),
    );
    if (matchedClub) return matchedClub.clubID;

    const uuidMatch = clubSlug.match(UUID_SUFFIX_REGEX);
    if (uuidMatch) return uuidMatch[0];

    return undefined;
  }, [clubSlug, myClubs]);

  const { data: competitions, isLoading } = useGetCompetitionsByClub(clubId);
  const [searchTerm, setSearchTerm] = React.useState("");
  const [searchKeyword, setSearchKeyword] = React.useState("");

  const handleSearch = () => {
    setSearchKeyword(searchTerm.trim());
  };

  const filteredCompetitions = React.useMemo(() => {
    if (!competitions) return [];
    return competitions.filter((comp) => {
      // UPCOMING = chưa tới thời gian hiển thị -> Ẩn đối với member
      if (comp.competitionPhase === "UPCOMING") return false;

      const searchLower = searchKeyword.toLowerCase();
      return (
        comp.nameVN.toLowerCase().includes(searchLower) ||
        comp.nameEN.toLowerCase().includes(searchLower)
      );
    });
  }, [competitions, searchKeyword]);

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6 px-6 pb-6 animate-in fade-in duration-500">
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 border-b border-greyscale-800 pb-8">
        <div className="space-y-2">
          <h2 className="text-3xl font-black text-white flex items-center gap-3 uppercase tracking-tight">
            <MdEmojiEvents className="text-primary" />
            CUỘC THI CÂU LẠC BỘ
          </h2>
          <p className="text-greyscale-400 font-medium max-w-xl">
            Thử thách bản thân qua các giải đấu kịch tính và ghi danh vào bảng vàng để nhận những phần thưởng xứng đáng.
          </p>
        </div>

        <div className="flex w-full lg:max-w-md gap-2">
          <div className="relative flex-1 group">
            <MdSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-greyscale-500 group-focus-within:text-primary transition-colors h-5 w-5" />
            <Input
              placeholder="Tìm kiếm cuộc thi..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              className="pl-10"
            />
          </div>
          <Button 
            type="button" 
            className="h-10 px-6 shrink-0" 
            onClick={handleSearch}
          >
            Tìm kiếm
          </Button>
        </div>
      </div>

      {!filteredCompetitions || filteredCompetitions.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center bg-greyscale-900/30 rounded-3xl border border-dashed border-greyscale-800">
          <div className="mb-6 rounded-full bg-greyscale-800/50 p-8 text-greyscale-600">
            <MdEmojiEvents size={64} />
          </div>
          <h3 className="mb-2 text-2xl font-black text-white uppercase tracking-tight">
            Không tìm thấy cuộc thi
          </h3>
          <p className="text-greyscale-400 max-w-xs mx-auto">
            {searchKeyword 
              ? `Không có cuộc thi nào khớp với từ khóa "${searchKeyword}". Hãy thử tìm kiếm khác.`
              : "Hiện tại chưa có cuộc thi nào đang diễn ra."}
          </p>
          {searchKeyword && (
            <Button 
                variant="ghost" 
                className="mt-6 text-primary hover:bg-primary/10"
                onClick={() => { setSearchTerm(""); setSearchKeyword(""); }}
            >
                Xóa tìm kiếm
            </Button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
          {filteredCompetitions.map((comp, index) => (
            <FadeIn key={comp.competitionID} from="bottom" delay={0.05 * index}>
              <MemberCompetitionCard competition={comp} clubSlug={clubSlug!} />
            </FadeIn>
          ))}
        </div>
      )}
    </div>
  );
}
