import React, { useMemo, useState, useEffect } from "react";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { LabRule, MapObject } from "@/types/lab";
import { FaChevronRight } from "react-icons/fa";
import { useTranslations } from '@/providers/i18n-provider';

interface RuleConfigurationModalProps {
  show: boolean;
  onClose: () => void;
  rule: LabRule;
  onChange: (rule: LabRule) => void;
  objects: MapObject[];
  onSave: (rule: LabRule) => Promise<void>;
  isSaving?: boolean;
}

export const RuleConfigurationModal: React.FC<RuleConfigurationModalProps> = ({
  show,
  onClose,
  rule,
  onChange,
  objects,
  onSave,
  isSaving,
}) => {
  const t = useTranslations("MapEditor.rules");
  const [draftRule, setDraftRule] = useState<LabRule>(rule);

  useEffect(() => {
    if (show) {
      setDraftRule(rule);
    }
  }, [show, rule]);

  const maxScore = useMemo(() =>
    objects.filter(o => o.objectType === "bonus").reduce((acc, o) => acc + (o.scoreValue || 0), 0)
    , [objects]);

  const cpCount = useMemo(() =>
    objects.filter(o => o.objectType === "checkpoint").length
    , [objects]);

  const isScoreInvalid = draftRule.requiredScore > maxScore;
  const isSeqInvalid = draftRule.sequentialCheckpoints && cpCount < 2;

  const handleNumericChange = (field: keyof LabRule, value: string) => {
    const numValue = value === "" ? 0 : Math.max(0, parseInt(value) || 0);
    setDraftRule(prev => ({ ...prev, [field]: numValue }));
  };

  const handleApplyChanges = async () => {
    // Only update parent state on explicit Save click
    onChange(draftRule);
    // Allow state to propagate then run parent save logic
    setTimeout(() => {
      onSave(draftRule);
    }, 0);
  };

  return (
    <Dialog open={show} onOpenChange={(open) => !open && onClose()}>
      <DialogContent
        onOpenAutoFocus={(e) => e.preventDefault()}
        className="sm:max-w-[460px] bg-[#111114] border border-white/5 p-0 overflow-hidden rounded-lg shadow-2xl"
      >

        {/* ===== HEADER ===== */}
        <div className="px-8 pt-8 pb-6 block">
          <div className="flex items-center gap-2.5 mb-1.5">
            <div className="w-2 h-2 rounded-full bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.5)]" />
            <DialogTitle className="text-[18px] font-black uppercase tracking-[0.2em] text-white">
              {t("title")}
            </DialogTitle>
          </div>
          <DialogDescription className="text-[11px] text-white/30 font-medium uppercase tracking-widest pl-4.5">
            {t("description")}
          </DialogDescription>
        </div>

        <div className="px-8 pb-8 flex flex-col gap-6">

          {/* ===== GOAL SECTION ===== */}
          <div className="flex flex-col gap-2.5">
            <div className="flex justify-between items-end">
              <Label className="text-[10px] font-black text-white/40 uppercase tracking-widest">
                {t("requiredScore")}
              </Label>
              <div className={`flex items-center gap-1.5 px-2 py-0.5 rounded bg-white/5 border transition-colors ${isScoreInvalid ? "border-red-500/50 bg-red-500/10" : "border-white/5"}`}>
                <span className={`text-[9px] font-black uppercase tracking-widest ${isScoreInvalid ? "text-red-400" : "text-white/40"}`}>
                  {t("totalAvailable")}: {maxScore}
                </span>
              </div>
            </div>

            <Input
              type="number"
              placeholder="0"
              value={draftRule.requiredScore || ""}
              onChange={(e) => handleNumericChange("requiredScore", e.target.value)}
              className={`h-11 text-xs font-bold bg-black/40 border-white/5 focus:outline-none focus:border-primary-300/50 focus-visible:ring-0 focus-visible:ring-offset-0 transition-all rounded ${isScoreInvalid ? "border-red-500/50 text-red-400 focus:border-red-500/50" : "text-white"
                }`}
            />

            {isScoreInvalid && (
              <p className="text-[10px] text-red-500 font-bold uppercase tracking-tight italic flex items-center gap-1.5 animate-pulse">
                ⚠ {t("scoreError", { maxScore })}
              </p>
            )}
          </div>

          {/* ===== CONSTRAINTS SECTION ===== */}
          <div className="grid grid-cols-2 gap-5">
            <div className="flex flex-col gap-2.5">
              <Label className="text-[10px] font-black text-white/40 uppercase tracking-widest">
                {t("timeLimit")}
              </Label>
              <Input
                type="number"
                placeholder="0"
                value={draftRule.timeLimit || ""}
                onChange={(e) => handleNumericChange("timeLimit", e.target.value)}
                className="h-11 text-xs font-bold bg-black/40 border-white/5 focus:outline-none focus:border-primary-300/50 focus-visible:ring-0 focus-visible:ring-offset-0 transition-all rounded text-white"
              />
            </div>

            <div className="flex flex-col gap-2.5">
              <Label className="text-[10px] font-black text-white/40 uppercase tracking-widest">
                {t("maxBlocks")}
              </Label>
              <Input
                type="number"
                placeholder="0"
                value={draftRule.maxBlocks || ""}
                onChange={(e) => handleNumericChange("maxBlocks", e.target.value)}
                className="h-11 text-xs font-bold bg-black/40 border-white/5 focus:outline-none focus:border-primary-300/50 focus-visible:ring-0 focus-visible:ring-offset-0 transition-all rounded text-white"
              />
            </div>
          </div>

          {/* ===== LOGIC SECTION ===== */}
          <div className="flex flex-col gap-3">
            <Label className="text-[10px] font-black text-white/40 uppercase tracking-widest">
              {t("advancedRules")}
            </Label>
            <div className="p-4 rounded border border-white/5 bg-black/20 flex items-center justify-between group hover:bg-black/30 transition-all">
              <div className="space-y-1">
                <h3 className="text-[11px] font-black text-white/90 uppercase tracking-widest">
                  {t("sequentialCheckpoints")}
                </h3>
                <p className="text-[10px] text-white/30 font-medium italic">
                  {t("sequentialDesc")}
                </p>
              </div>

              <Switch
                checked={draftRule.sequentialCheckpoints}
                onCheckedChange={(checked) =>
                  setDraftRule(prev => ({ ...prev, sequentialCheckpoints: checked }))
                }
                className="data-[state=checked]:bg-red-500"
              />
            </div>

            {isSeqInvalid && (
              <p className="text-[10px] text-red-500 font-bold uppercase tracking-tight italic animate-pulse">
                ⚠ {t("sequentialError")}
              </p>
            )}
          </div>

          {/* ===== ACTIONS ===== */}
          <div className="flex items-center justify-end gap-4 mt-2 pt-6 border-t border-white/5">
            <Button
              variant="ghost"
              onClick={onClose}
              className="text-[11px] font-black text-white/40 hover:text-white uppercase tracking-[0.15em] transition-all"
            >
              {t("cancel")}
            </Button>

            <Button
              disabled={isScoreInvalid || isSeqInvalid || isSaving}
              onClick={handleApplyChanges}
              className="h-12 px-8 bg-[#cc4444] hover:bg-[#dd5555] text-white text-[11px] font-black uppercase tracking-[0.2em] rounded shadow-lg shadow-red-950/20 disabled:opacity-50 transition-all flex items-center gap-3"
            >
              {isSaving ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : null}
              {isSaving ? t("saving") : t("save")}
              {!isSaving && <FaChevronRight className="text-[10px]" />}
            </Button>
          </div>

        </div>
      </DialogContent>
    </Dialog>
  );
};
