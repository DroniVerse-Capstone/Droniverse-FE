"use client";

import React from "react";
import { MdOutlineCreateNewFolder } from "react-icons/md";

import CategoryDropdown from "@/components/common/CategoryDropdown";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { ClubImageUpload } from "@/components/manager/dashboard/ClubImageUpload";

export default function RegisterClubDialog() {
  const [clubName, setClubName] = React.useState("");
  const [clubNameEn, setClubNameEn] = React.useState("");
  const [clubDescription, setClubDescription] = React.useState("");
  const [categoryIds, setCategoryIds] = React.useState<string[]>([]);
  const [isPublic, setIsPublic] = React.useState(true);
  const [memberLimit, setMemberLimit] = React.useState(10);
  const [managerLimit, setManagerLimit] = React.useState(1);
  const [clubImageUrl, setClubImageUrl] = React.useState("");

  const handleSubmit = () => {
    console.log({
      clubName,
      clubNameEn,
      clubDescription,
      categoryIds,
      isPublic,
      memberLimit,
      managerLimit,
      clubImageUrl,
    });
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button icon={<MdOutlineCreateNewFolder size={20} />}>
          Đăng ký Club
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-md max-h-[85vh] overflow-hidden p-0">
        <div className="flex max-h-[85vh] flex-col">
          <DialogHeader className="px-6 pt-6">
            <DialogTitle>Đăng ký Club</DialogTitle>
            <DialogDescription>
              Điền form sau để yêu cầu tạo Club cho riêng bạn
            </DialogDescription>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto px-6 py-4">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="club-name">Tên Club (Tiếng Việt)</Label>
                <Input
                  id="club-name"
                  placeholder="Nhập tên club"
                  value={clubName}
                  onChange={(e) => setClubName(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="club-name">Tên Club (Tiếng Anh)</Label>
                <Input
                  id="club-name"
                  placeholder="Nhập tên club"
                  value={clubNameEn}
                  onChange={(e) => setClubNameEn(e.target.value)}
                />
              </div>

              <ClubImageUpload value={clubImageUrl} onChange={setClubImageUrl} />

              <CategoryDropdown
                value={categoryIds}
                onChange={setCategoryIds}
                label="Danh mục"
                placeholder="Chọn category"
              />

              <div className="space-y-2">
                <Label htmlFor="club-description">Mô tả</Label>
                <Textarea
                  id="club-description"
                  placeholder="Nhập mô tả club"
                  value={clubDescription}
                  onChange={(e) => setClubDescription(e.target.value)}
                />
              </div>

              <div className="flex items-center gap-3">
                <Switch
                  id="club-public"
                  checked={isPublic}
                  onCheckedChange={setIsPublic}
                />
                <Label htmlFor="club-public" className="text-base">
                  Công khai Club
                </Label>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="member-limit">Giới hạn thành viên</Label>
                  <Input
                    id="member-limit"
                    type="number"
                    min="10"
                    value={memberLimit}
                    onChange={(e) => setMemberLimit(Number(e.target.value))}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="manager-limit">Giới hạn quản lý</Label>
                  <Input
                    id="manager-limit"
                    type="number"
                    min="1"
                    value={managerLimit}
                    onChange={(e) => setManagerLimit(Number(e.target.value))}
                  />
                </div>
              </div>
            </div>
          </div>

          <DialogFooter className="flex-row justify-end gap-3 border-t border-greyscale-700 px-6 py-4 sm:space-x-0">
            <DialogClose asChild>
              <Button type="button" variant="outline">
                Hủy bỏ
              </Button>
            </DialogClose>
            <Button type="button" onClick={handleSubmit}>
              Đăng ký
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
}
