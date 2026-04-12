import React, { useMemo, useState, useEffect } from "react";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { Switch } from "@/components/ui/switch";
import { LabRule, MapObject } from "@/types/lab";
import { FaChevronRight, FaClock, FaCube, FaTrophy, FaInfoCircle, FaBatteryFull, FaTimesCircle, FaCheckCircle, FaCheck } from "react-icons/fa";
import { useTranslations } from '@/providers/i18n-provider';
import { z } from "zod";

const numericRuleSchema = z.object({
  timeLimit: z.number().min(10, "Tối thiểu 10s").max(600, "Tối đa 600s"),
  maxBlocks: z.number().min(3, "Tối thiểu 3 khối").max(200, "Tối đa 200 khối"),
  fuelLimit: z.number().min(10, "Tối thiểu 10").max(5000, "Tối đa 5000"),
});

interface RuleConfigurationModalProps {
  show: boolean;
  onClose: () => void;
  rule: LabRule;
  onChange: (rule: LabRule) => void;
  objects: MapObject[];
  onSave: (rule: LabRule) => Promise<void>;
  isSaving?: boolean;
  hasSolution?: boolean;
}

export const RuleConfigurationModal: React.FC<RuleConfigurationModalProps> = ({
  show,
  onClose,
  rule,
  onChange,
  objects,
  onSave,
  isSaving,
  hasSolution = false,
}) => {
  const t = useTranslations("MapEditor.rules");
  const [draftRule, setDraftRule] = useState<LabRule>(rule);
  const [isTimeEnabled, setIsTimeEnabled] = useState((rule.timeLimit ?? 0) > 0);
  const [isBlocksEnabled, setIsBlocksEnabled] = useState((rule.maxBlocks ?? 0) > 0);
  const [isFuelEnabled, setIsFuelEnabled] = useState((rule.fuelLimit ?? 0) > 0);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (show) {
      setDraftRule(rule);
      // Ensure we explicitly check against 0 or undefined to set enabled states
      setIsTimeEnabled((rule.timeLimit ?? 0) > 0);
      setIsBlocksEnabled((rule.maxBlocks ?? 0) > 0);
      setIsFuelEnabled((rule.fuelLimit ?? 0) > 0);
    }
  }, [show, rule]);

  // Zod Validation Effect
  useEffect(() => {
    const newErrors: Record<string, string> = {};
    if (isTimeEnabled) {
      const res = numericRuleSchema.shape.timeLimit.safeParse(draftRule.timeLimit);
      if (!res.success && res.error.issues.length > 0) newErrors.timeLimit = res.error.issues[0].message;
    }
    if (isBlocksEnabled) {
      const res = numericRuleSchema.shape.maxBlocks.safeParse(draftRule.maxBlocks);
      if (!res.success && res.error.issues.length > 0) newErrors.maxBlocks = res.error.issues[0].message;
    }
    if (isFuelEnabled) {
      const res = numericRuleSchema.shape.fuelLimit.safeParse(draftRule.fuelLimit);
      if (!res.success && res.error.issues.length > 0) newErrors.fuelLimit = res.error.issues[0].message;
    }
    setErrors(newErrors);
  }, [draftRule, isTimeEnabled, isBlocksEnabled, isFuelEnabled]);

  const maxScore = useMemo(() =>
    objects.reduce((acc, o) => acc + (o.scoreValue || 0), 0)
    , [objects]);

  const cpCount = useMemo(() =>
    objects.filter(o => o.objectType === "checkpoint").length
    , [objects]);



  const handleNumericChange = (field: keyof LabRule, value: string) => {
    // Handle empty string as 0 to avoid NaN, but allow typing
    if (value === "") {
      setDraftRule(prev => ({ ...prev, [field]: 0 }));
      return;
    }
    const num = parseInt(value);
    if (!isNaN(num)) {
      setDraftRule(prev => ({ ...prev, [field]: num }));
    }
  };

  const finalRule = useMemo(() => ({
    ...draftRule,
    timeLimit: isTimeEnabled ? (draftRule.timeLimit || 0) : 0,
    maxBlocks: isBlocksEnabled ? (draftRule.maxBlocks || 0) : 0,
    fuelLimit: isFuelEnabled ? (draftRule.fuelLimit || 0) : 0,
    requiredScore: maxScore > 0 ? (draftRule.requiredScore || 0) : 0,
    sequentialCheckpoints: cpCount >= 2 ? draftRule.sequentialCheckpoints : false,
  }), [draftRule, isTimeEnabled, isBlocksEnabled, isFuelEnabled, maxScore, cpCount]);

  const isDirty = useMemo(() => {
    // Basic comparison for equality. We compare specific fields to handle undefined/null consistency.
    return (
      finalRule.timeLimit !== (rule.timeLimit || 0) ||
      finalRule.maxBlocks !== (rule.maxBlocks || 0) ||
      finalRule.fuelLimit !== (rule.fuelLimit || 0) ||
      finalRule.requiredScore !== (rule.requiredScore || 0) ||
      finalRule.sequentialCheckpoints !== (rule.sequentialCheckpoints || false)
    );
  }, [finalRule, rule]);

  const handleApplyChanges = async () => {
    onChange(finalRule);
    setTimeout(() => {
      onSave(finalRule);
    }, 0);
  };

  const isScoreInvalid = maxScore > 0 && draftRule.requiredScore > maxScore;
  const isSeqInvalid = draftRule.sequentialCheckpoints && cpCount < 2;
  const hasAnyZodError = Object.values(errors).filter(Boolean).length > 0;
  const canSave = isDirty && !isScoreInvalid && !isSeqInvalid && !isSaving && !hasAnyZodError;

  return (
    <Dialog open={show} onOpenChange={(open) => !open && onClose()}>
      <DialogContent
        onOpenAutoFocus={(e) => e.preventDefault()}
        className="sm:max-w-4xl bg-[#121216] border border-white/10 p-0 overflow-hidden rounded shadow-[0_32px_64px_-12px_rgba(0,0,0,0.8)] flex flex-col animate-in fade-in zoom-in duration-300 [&>button]:hidden"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent pointer-events-none" />

        {/* ===== HEADER ===== */}
        <div className="relative z-10 px-5 py-3.5 flex items-center justify-between border-b border-white/5 bg-white/[0.01]">
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 rounded-full bg-primary shadow-[0_0_10px_rgba(239,68,68,0.8)]" />
            <DialogTitle className="text-[12px] font-black uppercase tracking-[0.2em] text-white">
              {t("title")}
            </DialogTitle>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-full flex items-center justify-center bg-white/5 hover:bg-white/10 text-white/40 hover:text-white transition-all border border-white/5"
          >
            <FaTimesCircle size={14} />
          </button>
        </div>

        <div className="relative z-10 px-6 py-6 overflow-y-auto scrollbar-thin max-h-[85vh]">
          <div className="flex flex-col md:flex-row gap-6 items-start">
            {/* LEFT COLUMN: Main Rules & Basics */}
            <div className="flex-1 flex flex-col gap-4 w-full">
              {/* Score Configuration Card */}
              <div className={cn(
                "p-4 rounded bg-white/[0.02] border transition-all duration-300",
                maxScore > 0 ? "border-white/5" : "border-primary/20 bg-primary/[0.01]"
              )}>
                <div className="flex items-center justify-between gap-3 mb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded bg-white/5 text-primary">
                      <FaTrophy size={14} />
                    </div>
                    <div>
                      <h3 className="text-[10px] font-black text-white/50 uppercase tracking-widest">{t("requiredScore")}</h3>
                      <p className="text-[9px] text-white/20 font-bold uppercase tracking-tight">{t("totalAvailable")}: {maxScore}</p>
                    </div>
                  </div>

                  {maxScore > 0 && (
                    <button
                      onClick={() => handleNumericChange("requiredScore", maxScore.toString())}
                      className="text-[9px] text-primary/60 hover:text-primary font-black uppercase tracking-widest transition-colors"
                    >
                      [ {t("useMax") || "Tối đa"} ]
                    </button>
                  )}
                </div>

                {maxScore > 0 ? (
                  <div className="flex flex-col gap-2">
                    <Input
                      type="number"
                      placeholder="0"
                      value={draftRule.requiredScore || ""}
                      onChange={(e) => handleNumericChange("requiredScore", e.target.value)}
                      className={cn(
                        "h-9 text-xs font-bold bg-black/40 border-white/5 focus:outline-none focus:border-primary/50 focus-visible:ring-0 transition-all rounded text-white tabular-nums shadow-inner",
                        isScoreInvalid && "border-primary/50 text-primary"
                      )}
                    />
                    {isScoreInvalid && (
                      <p className="text-[9px] text-primary font-black uppercase tracking-tight pl-1">
                        ⚠ {t("scoreError", { maxScore })}
                      </p>
                    )}
                  </div>
                ) : (
                  <div className="flex items-start gap-2 p-3 rounded bg-white/[0.01] border border-white/5 italic">
                    <FaInfoCircle className="text-white/20 mt-0.5 shrink-0" size={12} />
                    <p className="text-[9px] text-white/40 font-bold uppercase tracking-wide leading-relaxed">
                      {t("noBonusItems")}
                    </p>
                  </div>
                )}
              </div>

              {/* Time & Blocks Constraints */}
              <div className="p-4 rounded bg-white/[0.02] border border-white/5 flex flex-col gap-3 shadow-inner">
                <h3 className="text-[10px] font-black text-white/50 uppercase tracking-widest pl-1 mb-1">
                  {t("constraints")} (I)
                </h3>

                <div className="flex flex-col gap-2">
                  {/* Time Constraint */}
                  <div className="flex flex-col gap-1">
                    <div className={cn("flex items-center gap-3 p-2.5 rounded bg-black/20 border transition-colors", errors.timeLimit ? "border-primary/50" : "border-white/5")}>
                      <div className="p-1.5 rounded bg-white/5 text-primary/60">
                        <FaClock size={12} />
                      </div>
                      <span className="text-[10px] font-black text-white/70 uppercase tracking-tight flex-1">{t("timeLimit")}</span>
                      {isTimeEnabled && (
                        <Input
                          type="number"
                          placeholder="30"
                          value={draftRule.timeLimit || ""}
                          onChange={(e) => handleNumericChange("timeLimit", e.target.value)}
                          className={cn("h-7 w-16 text-[11px] font-bold bg-black/40 border-white/10 focus:outline-none focus:border-primary/50 transition-all rounded text-white text-center tabular-nums p-0", errors.timeLimit && "text-primary")}
                        />
                      )}
                      <Switch
                        checked={isTimeEnabled}
                        onCheckedChange={(checked) => {
                          setIsTimeEnabled(checked);
                          if (checked && (draftRule.timeLimit || 0) === 0) {
                            handleNumericChange("timeLimit", "30");
                          }
                        }}
                        className="data-[state=checked]:bg-primary h-4 w-7 shrink-0"
                      />
                    </div>
                    {errors.timeLimit && <span className="text-[9px] text-primary font-bold pl-1 uppercase">⚠ {errors.timeLimit}</span>}
                  </div>

                  {/* Block Constraint */}
                  <div className="flex flex-col gap-1">
                    <div className={cn("flex items-center gap-3 p-2.5 rounded bg-black/20 border transition-colors", errors.maxBlocks ? "border-primary/50" : "border-white/5")}>
                      <div className="p-1.5 rounded bg-white/5 text-primary/60">
                        <FaCube size={12} />
                      </div>
                      <span className="text-[10px] font-black text-white/70 uppercase tracking-tight flex-1">{t("maxBlocks")}</span>
                      {isBlocksEnabled && (
                        <Input
                          type="number"
                          placeholder="10"
                          value={draftRule.maxBlocks || ""}
                          onChange={(e) => handleNumericChange("maxBlocks", e.target.value)}
                          className={cn("h-7 w-16 text-[11px] font-bold bg-black/40 border-white/10 focus:outline-none focus:border-primary/50 transition-all rounded text-white text-center tabular-nums p-0", errors.maxBlocks && "text-primary")}
                        />
                      )}
                      <Switch
                        checked={isBlocksEnabled}
                        onCheckedChange={(checked) => {
                          setIsBlocksEnabled(checked);
                          if (checked && (draftRule.maxBlocks || 0) === 0) {
                            handleNumericChange("maxBlocks", "10");
                          }
                        }}
                        className="data-[state=checked]:bg-primary h-4 w-7 shrink-0"
                      />
                    </div>
                    {errors.maxBlocks && <span className="text-[9px] text-primary font-bold pl-1 uppercase">⚠ {errors.maxBlocks}</span>}
                  </div>
                </div>
              </div>
            </div>

            {/* RIGHT COLUMN: Fuel & Advanced */}
            <div className="flex-1 flex flex-col gap-4 w-full">
              {/* Fuel Constraint Header */}
              <div className="p-4 rounded bg-white/[0.02] border border-white/5 flex flex-col gap-3 shadow-inner">
                <h3 className="text-[10px] font-black text-white/50 uppercase tracking-widest pl-1 mb-1">
                  {t("constraints")} (II)
                </h3>
                {/* Fuel Constraint */}
                <div className="flex flex-col gap-1">
                  <div className={cn("flex flex-col gap-2 p-2.5 rounded bg-black/20 border transition-colors", errors.fuelLimit ? "border-primary/50" : "border-white/5")}>
                    <div className="flex items-center gap-3">
                      <div className="p-1.5 rounded bg-white/5 text-primary/60">
                        <FaBatteryFull size={12} />
                      </div>
                      <span className="text-[10px] font-black text-white/70 uppercase tracking-tight flex-1">{t("fuelLimit")}</span>
                      {isFuelEnabled && (
                        <Input
                          type="number"
                          placeholder="100"
                          value={draftRule.fuelLimit || ""}
                          onChange={(e) => handleNumericChange("fuelLimit", e.target.value)}
                          className={cn("h-7 w-16 text-[11px] font-bold bg-black/40 border-white/10 focus:outline-none focus:border-primary/50 transition-all rounded text-white text-center tabular-nums p-0", errors.fuelLimit && "text-primary")}
                        />
                      )}
                      <Switch
                        checked={isFuelEnabled}
                        onCheckedChange={(checked) => {
                          setIsFuelEnabled(checked);
                          if (!checked) handleNumericChange("fuelLimit", "0");
                          else if ((draftRule.fuelLimit ?? 0) === 0) handleNumericChange("fuelLimit", "100");
                        }}
                        className="data-[state=checked]:bg-primary h-4 w-7 shrink-0"
                      />
                    </div>
                    {isFuelEnabled && !errors.fuelLimit && (
                      <p className="text-[8px] text-white/20 font-bold uppercase tracking-wide italic pl-1">{t("fuelLimitDesc")}</p>
                    )}
                  </div>
                  {errors.fuelLimit && <span className="text-[9px] text-primary font-bold pl-1 uppercase">⚠ {errors.fuelLimit}</span>}
                </div>
              </div>

              {/* Advanced Controls Card */}
              <div className="p-4 rounded bg-white/[0.02] border border-white/5 flex flex-col gap-3 shadow-inner">
                <h3 className="text-[10px] font-black text-white/50 uppercase tracking-widest pl-1">
                  {t("advancedRules")}
                </h3>

                <div className="p-3.5 rounded bg-black/30 border border-white/5 flex flex-col gap-2.5">
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex flex-col gap-0.5">
                      <span className="text-[10px] font-black text-white/80 uppercase tracking-tight">{t("sequentialCheckpoints")}</span>
                      <p className="text-[8px] text-white/20 font-bold italic leading-tight uppercase">
                        {t("sequentialDesc")}
                      </p>
                    </div>
                    <Switch
                      disabled={cpCount < 2}
                      checked={draftRule.sequentialCheckpoints && cpCount >= 2}
                      onCheckedChange={(checked) =>
                        setDraftRule(prev => ({ ...prev, sequentialCheckpoints: checked }))
                      }
                      className="data-[state=checked]:bg-primary h-3.5 w-6.5 shrink-0"
                    />
                  </div>
                  {isSeqInvalid && cpCount > 0 && (
                    <p className="text-[8px] text-primary font-black uppercase tracking-tight pl-1 italic">
                      ⚠ {t("sequentialError")}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ===== ACTIONS ===== */}
        <div className="relative z-10 flex border-t border-white/5 p-4 bg-white/[0.02] justify-end items-center gap-3">
          <Button
            variant="ghost"
            onClick={onClose}
            className="text-[10px] font-black text-white/30 hover:text-white uppercase tracking-widest transition-all h-9 px-4"
          >
            {t("cancel")}
          </Button>

          <Button
            disabled={!canSave}
            onClick={handleApplyChanges}
            className={cn(
              "h-9 px-6 bg-primary hover:bg-primary/80 text-white text-[10px] font-black uppercase tracking-[0.15em] rounded shadow-lg transition-all active:scale-95 flex items-center gap-2.5",
              (isScoreInvalid || isSeqInvalid || hasAnyZodError) && "opacity-40 grayscale pointer-events-none"
            )}
          >
            {isSaving ? (
              <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : null}
            {isSaving ? t("saving") : (t("save") || "Lưu cập nhật")}
            {!isSaving && <FaChevronRight size={10} />}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
