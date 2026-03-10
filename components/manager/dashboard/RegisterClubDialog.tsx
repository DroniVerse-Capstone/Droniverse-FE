"use client";

import React from "react";
import { MdOutlineCreateNewFolder } from "react-icons/md";

import CategoryDropdown from "@/components/common/CategoryDropdown";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export default function RegisterClubDialog() {
  const [clubName, setClubName] = React.useState("");
  const [clubDescription, setClubDescription] = React.useState("");
  const [categoryIds, setCategoryIds] = React.useState<string[]>([]);

  const handleSubmit = () => {
    console.log({
      clubName,
      clubDescription,
      categoryIds,
    });
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button icon={<MdOutlineCreateNewFolder size={20} />}>
          Đăng ký Club
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Đăng ký Club</DialogTitle>
          <DialogDescription>
            Điền thông tin để gửi yêu cầu đăng ký câu lạc bộ.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <label className="text-sm font-medium">Tên Club</label>
            <Input
              placeholder="Nhập tên club"
              value={clubName}
              onChange={(e) => setClubName(e.target.value)}
            />
          </div>

          <CategoryDropdown
            value={categoryIds}
            onChange={setCategoryIds}
            label="Danh mục"
            placeholder="Chọn category"
          />

          <div className="space-y-2">
            <label className="text-sm font-medium">Mô tả</label>
            <textarea
              className="min-h-28 w-full rounded border border-input bg-transparent px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              placeholder="Nhập mô tả club"
              value={clubDescription}
              onChange={(e) => setClubDescription(e.target.value)}
            />
          </div>
        </div>

        <DialogFooter>
          <Button type="button" onClick={handleSubmit}>
            Gửi đăng ký
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
