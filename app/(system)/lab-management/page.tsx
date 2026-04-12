"use client";

import { useEffect, useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { FaPlus, FaTrash, FaVial, FaClock, FaStar, FaFolderOpen, FaCheckCircle, FaTimesCircle, FaChevronLeft, FaChevronRight, FaTerminal, FaSearch, FaPen, FaPlay, FaPause, FaCheck, FaChevronDown, FaDatabase, FaRocket, FaEdit, FaPowerOff, FaMap, FaUser } from "react-icons/fa";
import { toast } from "react-hot-toast";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { LabData } from "@/types/lab";
import { getLabValidation } from "@/lib/map-editor/labValidation";
import { cn } from "@/lib/utils";
import { useGetLabs, useCreateLab, useUpdateLab, useDeleteLab, useLabFull, LabsPaginationData, UseGetLabsOptions } from "@/hooks/lab/useLabs";
import { useLocale, useTranslations } from "@/providers/i18n-provider";
import ConfirmActionPopover from "@/components/common/ConfirmActionPopover";
import { useDebounce } from "@/hooks/useDebounce";


const ITEMS_PER_PAGE = 4;



export default function LabManagement() {
  const t = useTranslations("LabManagement");
  const tCommon = useTranslations("Common");
  const locale = useLocale();

  const router = useRouter();

  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const debouncedSearch = useDebounce(searchQuery, 500);
  const [statusFilter, setStatusFilter] = useState<"all" | "ACTIVE" | "INACTIVE" | "DRAFT">("all");

  // Global query for overall statistics (fetches all labs metadata)
  const { data: allLabsData = [] } = useGetLabs();
  const allLabs = Array.isArray(allLabsData) ? allLabsData : [];

  const { data: labsResponse, isLoading: loading } = useGetLabs({
    pageIndex: currentPage,
    pageSize: ITEMS_PER_PAGE,
    searchTerm: debouncedSearch,
    status: statusFilter === "all" ? undefined : statusFilter,
    withPaginationMeta: true
  });

  const paginationData = labsResponse as LabsPaginationData;
  const labs = paginationData?.data || [];
  const totalRecords = paginationData?.totalRecords || 0;
  const totalPages = paginationData?.totalPages || 1;

  const createLab = useCreateLab();
  const updateLab = useUpdateLab();
  const deleteLab = useDeleteLab();

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingLabId, setEditingLabId] = useState<string | null>(null);

  // Popover State (controlled by the component itself now)
  const [isDeleting, setIsDeleting] = useState(false);


  // Load chi tiết lab để lấy labContent phục vụ validation
  const { data: editingLabDetail, isLoading: isLoadingDetail } = useLabFull(editingLabId);

  const [newLabStatus, setNewLabStatus] = useState<"DRAFT" | "ACTIVE" | "INACTIVE">("DRAFT");
  const [originalLabStatus, setOriginalLabStatus] = useState<"DRAFT" | "ACTIVE" | "INACTIVE">("DRAFT");
  const [newLabName, setNewLabName] = useState("");
  const [newLabNameEN, setNewLabNameEN] = useState("");
  const [newLabDesc, setNewLabDesc] = useState("");
  const [newLabDescEN, setNewLabDescEN] = useState("");
  const [newLabLevel, setNewLabLevel] = useState<"EASY" | "MEDIUM" | "HARD">("EASY");
  const [newLabType, setNewLabType] = useState<"LEARNING" | "COMPETITION">("LEARNING");
  const [newLabEstimatedTime, setNewLabEstimatedTime] = useState<number | "">("");
  const [formErrors, setFormErrors] = useState<Record<string, boolean>>({});

  const handleOpenCreateNew = () => {
    setEditingLabId(null);
    setNewLabStatus("DRAFT");
    setOriginalLabStatus("DRAFT");
    setNewLabName("");
    setNewLabNameEN("");
    setNewLabDesc("");
    setNewLabDescEN("");
    setNewLabLevel("EASY");
    setNewLabType("LEARNING");
    setNewLabEstimatedTime("");
    setFormErrors({});
    setShowCreateModal(true);
  };

  const handleEditBasicInfo = (lab: LabData, e: React.MouseEvent) => {
    e.stopPropagation();
    const currentStatus = lab.status;
    setEditingLabId(lab.labID);
    setNewLabStatus(currentStatus);
    setOriginalLabStatus(currentStatus);
    setNewLabName(lab.nameVN);
    setNewLabNameEN(lab.nameEN || "");
    setNewLabDesc(lab.descriptionVN || "");
    setNewLabDescEN(lab.descriptionEN || "");
    setNewLabLevel(lab.level || "EASY");
    setNewLabType(lab.type || "LEARNING");
    setNewLabEstimatedTime(lab.estimatedTime ?? "");
    setFormErrors({});
    setShowCreateModal(true);
  };

  const isDirty = useMemo(() => {
    if (!editingLabId) return !!newLabName.trim();
    const lab = labs.find(l => l.labID === editingLabId);
    if (!lab) return false;

    return (
      newLabName !== lab.nameVN ||
      newLabNameEN !== (lab.nameEN || "") ||
      newLabDesc !== (lab.descriptionVN || "") ||
      newLabDescEN !== (lab.descriptionEN || "") ||
      newLabLevel !== (lab.level || "EASY") ||
      newLabType !== (lab.type || "LEARNING") ||
      newLabEstimatedTime !== (lab.estimatedTime ?? "") ||
      newLabStatus !== lab.status
    );
  }, [editingLabId, labs, newLabName, newLabNameEN, newLabDesc, newLabDescEN, newLabLevel, newLabType, newLabEstimatedTime, newLabStatus]);

  const validateForm = () => {
    const errors: Record<string, boolean> = {};
    if (!newLabName.trim()) errors.nameVN = true;
    if (!newLabNameEN.trim()) errors.nameEN = true;
    if (!newLabDesc.trim()) errors.descVN = true;
    if (!newLabDescEN.trim()) errors.descEN = true;
    if (newLabEstimatedTime === "") errors.estimatedTime = true;
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleCreateLabSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    if (editingLabId) {
      if (editingLabDetail) {
        const validation = getLabValidation(editingLabDetail);
        if (newLabStatus === "ACTIVE" && !validation.isValid) {
          toast.error(t("toasts.publishError"));
          return;
        }
        updateLab.mutate({
          labID: editingLabId,
          data: {
            status: newLabStatus,
            nameVN: newLabName,
            nameEN: newLabNameEN,
            descriptionVN: newLabDesc,
            descriptionEN: newLabDescEN,
            type: newLabType,
            estimatedTime: newLabEstimatedTime === "" ? 15 : newLabEstimatedTime,
          }
        }, {
          onSuccess: () => {
            toast.success(t("toasts.updateSuccess"));
          }
        });
      }
      setShowCreateModal(false);
    } else {
      createLab.mutate({
        status: "DRAFT",
        nameVN: newLabName,
        nameEN: newLabNameEN,
        descriptionVN: newLabDesc,
        descriptionEN: newLabDescEN,
        level: newLabLevel,
        type: newLabType,
        estimatedTime: newLabEstimatedTime === "" ? 15 : newLabEstimatedTime,
      }, {
        onSuccess: (newLab) => {
          toast.success(t("toasts.createSuccess"));
          router.push(`/map-editor?id=${newLab.labID}`);
        }
      });
    }
  };


  const handleConfirmDelete = (id: string) => {
    setIsDeleting(true);
    deleteLab.mutate(id, {
      onSuccess: () => {
        toast.success(t("toasts.deleteSuccess"));
      },
      onSettled: () => {
        setIsDeleting(false);
      }
    });
  };


  useEffect(() => {
    if (showCreateModal) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [showCreateModal]);

  const handleEdit = (id: string) => {
    router.push(`/map-editor?id=${id}`);
  };

  const stats = useMemo(() => ({
    total: allLabs.length,
    active: allLabs.filter(l => (l.status || (l as any).Status)?.toString().toUpperCase() === "ACTIVE").length,
    draft: allLabs.filter(l => (l.status || (l as any).Status)?.toString().toUpperCase() === "DRAFT").length,
    inactive: allLabs.filter(l => (l.status || (l as any).Status)?.toString().toUpperCase() === "INACTIVE").length,
  }), [allLabs]);

  const paginatedLabs = labs;

  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearch, statusFilter]);

  return (
    <div className="w-full text-greyscale-0 font-sans min-h-full">
      <div className="w-full mx-auto flex flex-col gap-6 lg:gap-8 pb-10 shadow-inner">

        {/* Header - Glassmorphism Darker Style */}
        <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 rounded bg-[#09090b]/60 backdrop-blur-2xl border border-white/5 p-5 lg:p-6 shadow-xl shadow-[inset_0_1px_1px_rgba(255,255,255,0.02)] relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-white/[0.01] to-transparent pointer-events-none" />

          <div className="flex items-center gap-5 sm:gap-6 relative z-10 w-full">
            <div className="relative shrink-0">
              <div className="absolute -inset-2 bg-primary-300/10 rounded blur-xl opacity-0 hover:opacity-100 transition-opacity" />
              <div className="relative w-14 h-14 sm:w-16 sm:h-16 bg-[#141418] border border-white/5 rounded shadow-inner flex items-center justify-center overflow-hidden">
                <FaTerminal className="text-primary-300 text-xl sm:text-2xl drop-shadow-[0_0_10px_rgba(239,68,68,0.5)]" />
              </div>
            </div>
            <div className="flex flex-col gap-2 flex-wrap">
              <div className="flex items-center gap-3 flex-wrap font-black uppercase tracking-tight text-white">
                <span className="text-2xl sm:text-3xl drop-shadow-md">
                  {locale === 'vi' ? (t("title").split(" ")[0] + " " + t("title").split(" ")[1]) : t("title").split(" ")[0]}
                </span>
                <span className="text-primary-300 px-4 py-1.5 bg-primary-300/10 border border-primary-300/20 rounded text-[13px] sm:text-[15px] tracking-widest flex items-center justify-center">
                  {locale === 'vi' ? (t("title").split(" ")[2] + " " + t("title").split(" ")[3]) : t("title").split(" ")[1]}
                </span>
              </div>
            </div>

            <Button
              size="default"
              onClick={handleOpenCreateNew}
              className="w-full sm:w-auto px-6 h-8 sm:h-10 bg-primary-300 hover:bg-primary-400 text-white font-black uppercase tracking-widest shadow-[0_6px_25px_-5px_var(--primary-300,rgba(239,68,68,0.4))] shadow-[inset_0_1px_1px_rgba(255,255,255,0.3)] transition-all active:scale-95 text-xs sm:text-sm flex items-center gap-2 rounded border border-primary-200 ml-auto"
            >
              <FaPlus size={14} /> {t("createBtn")}
            </Button>
          </div>
        </header>


        {/* Create Lab Modal */}
        {showCreateModal && (
          <div
            className="fixed inset-0 z-[100] flex items-center justify-center bg-[#000]/60 backdrop-blur-[4px] p-4"
            onClick={(e) => {
              if (e.target === e.currentTarget) setShowCreateModal(false);
            }}
          >
            <div className="bg-[#121216] border border-white/10 rounded p-5 w-full max-w-4xl shadow-[0_32px_64px_-12px_rgba(0,0,0,0.8)] relative overflow-hidden flex flex-col animate-in fade-in zoom-in duration-300">
              <div className="absolute inset-0 bg-gradient-to-br from-primary-300/5 to-transparent pointer-events-none" />

              <div className="relative z-10 flex flex-col gap-4">
                <div className="flex items-center justify-between">
                  <div className="flex flex-col gap-1">
                    <h3 className="text-base font-black uppercase tracking-widest flex items-center gap-2 text-white">
                      <span className="w-2 h-2 rounded-full bg-primary-300 shadow-[0_0_10px_var(--primary-300,rgba(239,68,68,0.8))]"></span>
                      {editingLabId ? t("form.editTitle") : t("form.createTitle")}
                    </h3>
                  </div>
                  <button
                    onClick={() => setShowCreateModal(false)}
                    className="w-7 h-7 rounded-full flex items-center justify-center bg-white/5 hover:bg-white/10 text-greyscale-400 hover:text-white transition-all border border-white/5"
                  >
                    <FaTimesCircle className="text-base" />
                  </button>
                </div>

                <form onSubmit={handleCreateLabSubmit} noValidate className="flex flex-col gap-5">
                  <div className="flex flex-col md:flex-row gap-6">
                    {/* Left Column: Content */}
                    <div className="flex-[1.2] flex flex-col gap-4">
                      <div className="grid grid-cols-1 gap-3">
                        <div className="flex flex-col gap-1.5 ">
                          <label className="text-[10px] font-black text-greyscale-400 uppercase tracking-widest pl-1">{t("form.nameVN")}</label>
                          <input
                            autoFocus
                            type="text"
                            className={cn(
                              "w-full h-9 bg-black/40 border rounded px-3 text-xs text-white focus:outline-none transition-all shadow-inner placeholder:text-greyscale-700",
                              formErrors.nameVN ? "border-rose-500/50 focus:border-rose-500" : "border-white/5 focus:border-primary-300/50"
                            )}
                            placeholder={t("form.namePlaceholderVN")}
                            value={newLabName}
                            onChange={(e) => {
                              setNewLabName(e.target.value);
                              if (formErrors.nameVN) setFormErrors(prev => ({ ...prev, nameVN: false }));
                            }}
                          />
                          {formErrors.nameVN && <span className="text-[9px] text-rose-500 font-bold ml-1 animate-in fade-in slide-in-from-top-1 duration-200 uppercase tracking-wider">{t("form.required")}</span>}
                        </div>
                        <div className="flex flex-col gap-1.5">
                          <label className="text-[10px] font-black text-greyscale-400 uppercase tracking-widest pl-1">{t("form.nameEN")}</label>
                          <input
                            type="text"
                            className={cn(
                              "w-full h-9 bg-black/40 border rounded px-3 text-xs text-white focus:outline-none transition-all shadow-inner placeholder:text-greyscale-700",
                              formErrors.nameEN ? "border-rose-500/50 focus:border-rose-500" : "border-white/5 focus:border-primary-300/50"
                            )}
                            placeholder={t("form.namePlaceholderEN")}
                            value={newLabNameEN}
                            onChange={(e) => {
                              setNewLabNameEN(e.target.value);
                              if (formErrors.nameEN) setFormErrors(prev => ({ ...prev, nameEN: false }));
                            }}
                          />
                          {formErrors.nameEN && <span className="text-[9px] text-rose-500 font-bold ml-1 animate-in fade-in slide-in-from-top-1 duration-200 uppercase tracking-wider">{t("form.required")}</span>}
                        </div>
                      </div>

                      <div className="grid grid-cols-1 gap-3">
                        <div className="flex flex-col gap-1.5">
                          <label className="text-[10px] font-black text-greyscale-400 uppercase tracking-widest pl-1">{t("form.descVN")}</label>
                          <textarea
                            className={cn(
                              "w-full bg-black/40 border rounded px-3 py-2 text-xs text-white focus:outline-none transition-all resize-none h-20 shadow-inner placeholder:text-greyscale-700 leading-relaxed",
                              formErrors.descVN ? "border-rose-500/50 focus:border-rose-500" : "border-white/5 focus:border-primary-300/50"
                            )}
                            placeholder={t("form.descPlaceholderVN")}
                            value={newLabDesc}
                            onChange={(e) => {
                              setNewLabDesc(e.target.value);
                              if (formErrors.descVN) setFormErrors(prev => ({ ...prev, descVN: false }));
                            }}
                          />
                          {formErrors.descVN && <span className="text-[9px] text-rose-500 font-bold ml-1 animate-in fade-in slide-in-from-top-1 duration-200 uppercase tracking-wider">{t("form.required")}</span>}
                        </div>
                        <div className="flex flex-col gap-1.5">
                          <label className="text-[10px] font-black text-greyscale-400 uppercase tracking-widest pl-1">{t("form.descEN")}</label>
                          <textarea
                            className={cn(
                              "w-full bg-black/40 border rounded px-3 py-2 text-xs text-white focus:outline-none transition-all resize-none h-20 shadow-inner placeholder:text-greyscale-700 leading-relaxed",
                              formErrors.descEN ? "border-rose-500/50 focus:border-rose-500" : "border-white/5 focus:border-primary-300/50"
                            )}
                            placeholder={t("form.descPlaceholderEN")}
                            value={newLabDescEN}
                            onChange={(e) => {
                              setNewLabDescEN(e.target.value);
                              if (formErrors.descEN) setFormErrors(prev => ({ ...prev, descEN: false }));
                            }}
                          />
                          {formErrors.descEN && <span className="text-[9px] text-rose-500 font-bold ml-1 animate-in fade-in slide-in-from-top-1 duration-200 uppercase tracking-wider">{t("form.required")}</span>}
                        </div>
                      </div>
                    </div>

                    {/* Right Column: Settings & Validation */}
                    <div className="flex-1 flex flex-col gap-4">
                      <div className="p-4 bg-white/[0.02] border border-white/5 rounded flex flex-col gap-4">
                        <div className="grid grid-cols-2 gap-3">
                          <div className="flex flex-col gap-1.5">
                            <label className="text-[10px] font-black text-greyscale-400 uppercase tracking-widest pl-1">{t("form.level")}</label>
                            <Select value={newLabLevel} onValueChange={(val: any) => setNewLabLevel(val)}>
                              <SelectTrigger className="w-full bg-black/40 border-white/5 rounded h-9 text-xs text-white focus:ring-0 focus:border-primary-300/50 transition-all font-bold shadow-inner border">
                                <SelectValue placeholder={t("form.level")} />
                              </SelectTrigger>
                              <SelectContent className="bg-[#141418] border-white/10 z-[120]">
                                <SelectItem value="EASY" className="text-xs font-bold">{t("level.easy")}</SelectItem>
                                <SelectItem value="MEDIUM" className="text-xs font-bold">{t("level.medium")}</SelectItem>
                                <SelectItem value="HARD" className="text-xs font-bold">{t("level.hard")}</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="flex flex-col gap-1.5">
                            <label className="text-[10px] font-black text-greyscale-400 uppercase tracking-widest pl-1">{t("form.type")}</label>
                            <Select value={newLabType} onValueChange={(val: any) => setNewLabType(val)}>
                              <SelectTrigger className="w-full bg-black/40 border-white/5 rounded h-9 text-xs text-white focus:ring-0 focus:border-primary-300/50 transition-all font-bold shadow-inner border">
                                <SelectValue placeholder={t("form.type")} />
                              </SelectTrigger>
                              <SelectContent className="bg-[#141418] border-white/10 z-[120]">
                                <SelectItem value="LEARNING" className="text-xs font-bold">{t("type.learning")}</SelectItem>
                                <SelectItem value="COMPETITION" className="text-xs font-bold">{t("type.competition")}</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>

                        <div className="flex flex-col gap-1.5">
                          <label className="text-[10px] font-black text-greyscale-400 uppercase tracking-widest pl-1">{t("form.estimatedTime")}</label>
                          <input
                            type="number"
                            min={1}
                            max={999}
                            className={cn(
                              "w-full h-9 bg-black/40 border rounded px-3 text-xs text-white focus:outline-none transition-all shadow-inner placeholder:text-greyscale-700 font-bold",
                              formErrors.estimatedTime ? "border-rose-500/50 focus:border-rose-500" : "border-white/5 focus:border-primary-300/50"
                            )}
                            placeholder="15"
                            value={newLabEstimatedTime}
                            onChange={(e) => {
                              const val = e.target.value;
                              if (val === "") {
                                setNewLabEstimatedTime("");
                              } else {
                                let num = Number(val);
                                if (num > 999) num = 999;
                                setNewLabEstimatedTime(num);
                              }
                              if (formErrors.estimatedTime) setFormErrors(prev => ({ ...prev, estimatedTime: false }));
                            }}
                          />
                          {formErrors.estimatedTime && <span className="text-[9px] text-rose-500 font-bold ml-1 animate-in fade-in slide-in-from-top-1 duration-200 uppercase tracking-wider">{t("form.required")}</span>}
                        </div>

                        {editingLabId && (
                          <div className="flex flex-col gap-1.5">
                            <label className="text-[10px] font-black text-greyscale-400 uppercase tracking-widest pl-1">{t("form.status")}</label>
                            <Select value={newLabStatus} onValueChange={(val: any) => setNewLabStatus(val)}>
                              <SelectTrigger className={cn(
                                "w-full rounded h-9 text-xs focus:ring-0 font-bold shadow-inner transition-all border",
                                newLabStatus === "ACTIVE" ? "text-emerald-400" : newLabStatus === "INACTIVE" ? "text-rose-400" : "text-amber-500"
                              )}>
                                <SelectValue placeholder={t("form.status")} />
                              </SelectTrigger>
                              <SelectContent className="bg-[#141418] border-white/10 z-[120]">
                                {originalLabStatus === "DRAFT" ? (
                                  <>
                                    <SelectItem value="DRAFT" className="text-xs text-amber-500 font-bold">{t("table.status.draft")}</SelectItem>
                                    <SelectItem
                                      value="ACTIVE"
                                      disabled={editingLabId ? (!editingLabDetail || !getLabValidation(editingLabDetail!).isValid) : false}
                                      className={cn(
                                        "text-xs font-bold transition-opacity",
                                        editingLabId && (!editingLabDetail || !getLabValidation(editingLabDetail!).isValid) ? "text-emerald-500/30 line-through opacity-50 cursor-not-allowed" : "text-emerald-400"
                                      )}>
                                      {t("table.status.active")}
                                    </SelectItem>
                                  </>
                                ) : (
                                  <>
                                    <SelectItem
                                      value="ACTIVE"
                                      disabled={editingLabId ? (!editingLabDetail || !getLabValidation(editingLabDetail!).isValid) : false}
                                      className={cn(
                                        "text-xs font-bold transition-opacity",
                                        editingLabId && (!editingLabDetail || !getLabValidation(editingLabDetail!).isValid) ? "text-emerald-500/30 line-through opacity-50 cursor-not-allowed" : "text-emerald-400"
                                      )}>
                                      {t("table.status.active")}
                                    </SelectItem>
                                    <SelectItem value="INACTIVE" className="text-xs text-rose-400 font-bold">{t("table.status.inactive")}</SelectItem>
                                  </>
                                )}
                              </SelectContent>
                            </Select>
                          </div>
                        )}
                      </div>

                      {/* Checklist Section */}
                      {(originalLabStatus === "DRAFT" || newLabStatus === "ACTIVE") && editingLabId && (
                        <div className="p-4 bg-amber-500/[0.03] border border-amber-500/10 rounded flex flex-col gap-3 shadow-inner text-white">
                          <span className="text-[9px] font-black text-amber-500 uppercase tracking-[0.1em] flex items-center gap-2 mb-0.5">
                            <FaCheckCircle size={11} /> {t("form.publishRequirements")}
                          </span>
                          {(() => {
                            if (isLoadingDetail) return <div className="text-[10px] text-amber-500 animate-pulse font-bold tracking-widest uppercase">{t("form.syncing")}</div>;
                            const lab = editingLabDetail;
                            if (!lab) return null;
                            const v = getLabValidation(lab);
                            return (
                              <div className="flex flex-col gap-2.5">
                                {[
                                  { label: t("form.checklist.drone"), done: v.hasDrone },
                                  { label: t("form.checklist.objects"), done: v.hasObjects },
                                  { label: t("form.checklist.rules"), done: v.hasRules },
                                  { label: t("form.checklist.solution"), done: v.hasSolution },
                                ].map((item, idx) => (
                                  <div key={idx} className="flex items-center justify-between text-[10px] font-bold">
                                    <span className={cn(item.done ? "text-emerald-400" : "text-greyscale-500")}>{item.label}</span>
                                    {item.done ? (
                                      <FaCheck className="text-emerald-500" size={9} />
                                    ) : (
                                      <div className="w-2.5 h-2.5 rounded-full border-2 border-greyscale-700/50" />
                                    )}
                                  </div>
                                ))}
                              </div>
                            );
                          })()}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="pt-4 flex justify-end items-center gap-3 mt-1 border-t border-white/5">
                    <button
                      type="button"
                      onClick={() => setShowCreateModal(false)}
                      className="px-5 h-9 rounded text-greyscale-400 hover:text-white text-[10px] font-bold uppercase tracking-widest transition-all"
                    >
                      {tCommon("buttons.cancel")}
                    </button>
                    <Button
                      type="submit"
                      disabled={!isDirty || (editingLabId ? (!editingLabDetail || !getLabValidation(editingLabDetail!).isValid) && newLabStatus === "ACTIVE" : false)}
                      className={cn(
                        "uppercase font-black text-[10px] tracking-widest px-7 h-9 rounded transition-all active:scale-95 flex items-center gap-2",
                        (!isDirty || (editingLabId && (!editingLabDetail || !getLabValidation(editingLabDetail!).isValid) && newLabStatus === "ACTIVE"))
                          ? "bg-white/5 text-white/20 border-white/5 cursor-not-allowed"
                          : "bg-primary-300 hover:bg-primary-400 text-white border-primary-200 shadow-[0_8px_16px_-4px_rgba(239,68,68,0.4)]"
                      )}
                    >
                      {editingLabId ? tCommon("buttons.save") : t("table.actions.editMap")}
                      {!editingLabId && <FaChevronRight size={11} />}
                    </Button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            {
              label: t("stats.total"),
              value: stats.total,
              icon: <FaDatabase />,
              color: "white",
              glow: "bg-white/5",
              bg: "from-white/5 to-transparent border-white/10"
            },
            {
              label: t("stats.active"),
              value: stats.active,
              icon: <FaRocket />,
              color: "emerald-400",
              glow: "bg-emerald-500/10",
              bg: "from-emerald-500/5 to-transparent border-emerald-500/10"
            },
            {
              label: t("stats.draft"),
              value: stats.draft,
              icon: <FaEdit />,
              color: "amber-500",
              glow: "bg-amber-500/10",
              bg: "from-amber-500/5 to-transparent border-amber-500/10"
            },
            {
              label: t("stats.inactive"),
              value: stats.inactive,
              icon: <FaPowerOff />,
              color: "rose-500",
              glow: "bg-rose-500/10",
              bg: "from-rose-500/5 to-transparent border-rose-500/10"
            }
          ].map((stat, i) => (

            <div key={i} className={cn(
              "relative p-5 sm:p-6 rounded bg-[#09090b]/60 backdrop-blur-2xl border overflow-hidden group transition-all duration-500 hover:-translate-y-1.5 shadow-lg shadow-[inset_0_1px_1px_rgba(255,255,255,0.02)] hover:bg-[#09090b]/80 hover:shadow-[0_20px_40px_-10px_rgba(0,0,0,0.5)]",
              stat.bg
            )}>
              <div className={cn("absolute inset-0 bg-gradient-to-br opacity-10 group-hover:opacity-20 transition-opacity", stat.bg)} />

              <div className="relative flex items-center justify-between z-10 w-full">
                <div className="flex flex-col gap-2">
                  <span className="text-greyscale-500 text-[10px] font-bold uppercase tracking-[0.2em] drop-shadow-sm">
                    {stat.label}
                  </span>
                  <span className={cn(
                    "text-3xl sm:text-4xl font-bold tabular-nums tracking-tighter drop-shadow-lg transition-colors duration-500",
                    `text-${stat.color}`
                  )}>
                    {stat.value}
                  </span>
                </div>
                <div className={cn(
                  "w-12 h-12 rounded flex items-center justify-center text-xl transition-all duration-500 group-hover:scale-110 border border-white/5 shadow-inner relative overflow-hidden",
                  `text-${stat.color}`,
                  stat.glow
                )}>
                  <div className={cn("absolute inset-0 opacity-20 blur-md", stat.glow)} />
                  <span className="relative z-10">{stat.icon}</span>
                </div>
              </div>
            </div>
          ))}
        </section>

        {/* Main Content Area */}
        <section className="flex flex-col rounded bg-[#09090b]/60 backdrop-blur-3xl border border-white/5 p-6 lg:p-8 gap-6 shadow-[0_8px_32px_0_rgba(0,0,0,0.3)] shadow-[inset_0_1px_1px_rgba(255,255,255,0.02)] relative overflow-hidden min-h-[500px]">

          <div className="flex flex-col xl:flex-row xl:items-center justify-between z-10 gap-6">
            <h2 className="text-sm font-black uppercase tracking-widest text-greyscale-300 flex items-center gap-3 shrink-0">
              <span className="w-2 h-2 rounded bg-primary-300 shadow-[0_0_10px_var(--primary-300,rgba(239,68,68,0.8))]"></span>
              {t("table.databaseTitle")}
            </h2>

            {/* Filter and Search Bar */}
            <div className="flex flex-col sm:flex-row items-center gap-3 w-full xl:w-auto">
              <div className="relative w-full sm:w-72 xl:w-80">
                <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-greyscale-500" size={14} />
                <input
                  type="text"
                  placeholder={t("searchPlaceholder")}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full h-11 bg-black/40 border border-white/5 rounded pl-11 pr-4 text-sm text-white focus:outline-none focus:border-white/20 transition-all placeholder:text-greyscale-600 shadow-inner"
                />
              </div>

              <div className="flex p-1 bg-black/40 border border-white/5 rounded w-full sm:w-auto shrink-0 shadow-inner h-11 items-center">
                <button
                  onClick={() => setStatusFilter("all")}
                  className={cn("flex-1 sm:flex-none px-4 py-1.5 rounded text-xs font-bold transition-all h-full", statusFilter === 'all' ? "bg-primary-300/20 text-primary-300 shadow-sm" : "text-greyscale-500 hover:text-greyscale-300")}
                >
                  {t("filters.all")}
                </button>

                <button
                  onClick={() => setStatusFilter("DRAFT")}
                  className={cn("flex-1 sm:flex-none px-4 py-1.5 rounded text-xs font-bold transition-all h-full", statusFilter === 'DRAFT' ? "bg-primary-300/20 text-primary-300 shadow-sm" : "text-greyscale-500 hover:text-greyscale-300")}
                >
                  {t("filters.draft")}
                </button>
                <button
                  onClick={() => setStatusFilter("ACTIVE")}
                  className={cn("flex-1 sm:flex-none px-4 py-1.5 rounded text-xs font-bold transition-all h-full", statusFilter === 'ACTIVE' ? "bg-primary-300/20 text-primary-300 shadow-sm" : "text-greyscale-500 hover:text-greyscale-300")}
                >
                  {t("filters.active")}
                </button>
                <button
                  onClick={() => setStatusFilter("INACTIVE")}
                  className={cn("flex-1 sm:flex-none px-4 py-1.5 rounded text-xs font-bold transition-all h-full", statusFilter === 'INACTIVE' ? "bg-primary-300/20 text-primary-300 shadow-sm" : "text-greyscale-500 hover:text-greyscale-300")}
                >
                  {t("filters.inactive")}
                </button>
              </div>
            </div>
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center min-h-[400px] w-full gap-5 opacity-80 z-10">
              <div className="w-16 h-16 border-b-2 border-primary-300 rounded animate-spin shadow-[0_4px_15px_var(--primary-300,rgba(239,68,68,0.3))]" />
              <span className="text-xs font-black uppercase tracking-[0.5em] animate-pulse text-white drop-shadow-md">{t("form.syncing")}</span>
            </div>
          ) : labs.length === 0 ? (
            <div className="flex flex-col items-center justify-center min-h-[400px] w-full text-center opacity-50 z-10 transition-all duration-500">
              <div className="w-24 h-24 border border-dashed border-white/10 rounded flex items-center justify-center mb-6 bg-white/[0.01]">
                {labs.length === 0 ? <FaVial className="text-4xl text-white drop-shadow-lg" /> : <FaSearch className="text-4xl text-white drop-shadow-lg" />}
              </div>
              <h3 className="text-2xl font-black uppercase tracking-widest italic text-white drop-shadow-md">
                {labs.length === 0 ? t("table.empty") : t("table.notFound")}
              </h3>
              <p className="mt-2 text-sm max-w-sm font-medium tracking-wide text-greyscale-400">
                {labs.length === 0 ? t("table.emptyDesc") : t("table.notFoundDesc")}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 lg:gap-8 z-10 flex-1 content-start">
              {paginatedLabs.map((lab) => {
                const currentStatus = lab.status;
                const name = locale === 'vi' ? lab.nameVN : (lab.nameEN || lab.nameVN);
                const desc = locale === 'vi' ? lab.descriptionVN : (lab.descriptionEN || lab.descriptionVN);

                return (
                  <article
                    key={lab.labID}
                    onClick={() => handleEdit(lab.labID)}
                    className="group flex flex-col bg-[#141418]/80 border border-white/5 rounded overflow-hidden cursor-pointer transition-all duration-400 hover:border-primary-300/30 hover:-translate-y-2 hover:shadow-[0_25px_50px_-12px_rgba(0,0,0,0.6)] shadow-[inset_0_1px_1px_rgba(255,255,255,0.02)] hover:bg-[#1a1a20]/90 relative"
                  >
                    {/* Subtle Glow Behind the Card */}
                    <div className="absolute -inset-1 bg-gradient-to-br from-primary-300/10 to-transparent opacity-0 group-hover:opacity-100 blur-xl transition-opacity duration-500 pointer-events-none" />
                    {/* Thumbnail Container */}
                    <div className="aspect-[4/3] bg-[#09090b] relative overflow-hidden shrink-0 z-10 border-b border-white/5">
                      {lab.thumbnail ? (
                        <img src={lab.thumbnail} alt={name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 opacity-70 group-hover:opacity-100" />
                      ) : (
                        <div className="w-full h-full relative group-hover:opacity-100 opacity-70 transition-opacity duration-500">
                          <img src="https://images.unsplash.com/photo-1508614589041-895b88991e3e?q=80&w=1000&auto=format&fit=crop" alt="Default Drone" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                          <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-colors duration-500" />
                        </div>
                      )}

                      {/* Status Badge */}
                      <div className="absolute top-4 left-4">
                        <div className={cn(
                          "px-3 py-1.5 rounded text-[9px] font-black uppercase tracking-widest border backdrop-blur-xl shadow-lg flex items-center gap-2",
                          currentStatus === "ACTIVE"
                            ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20 shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)]"
                            : currentStatus === "DRAFT"
                              ? "bg-amber-500/10 text-amber-500 border-amber-500/20 shadow-[inset_0_1px_1px_rgba(255,255,255,0.02)]"
                              : "bg-rose-500/10 text-rose-400 border-rose-500/20 shadow-[inset_0_1px_1px_rgba(255,255,255,0.02)]"
                        )}>
                          <div className={cn("w-1.5 h-1.5 rounded",
                            currentStatus === "ACTIVE" ? "bg-emerald-400 shadow-[0_0_10px_var(--emerald-400,rgba(52,211,153,0.8))] animate-pulse"
                              : currentStatus === "DRAFT" ? "bg-amber-500" : "bg-rose-500")} />
                          {t(`table.status.${currentStatus.toLowerCase() as "active" | "draft" | "inactive"}`)}
                        </div>
                      </div>

                      <div className="absolute inset-0 bg-gradient-to-t from-[#141418] via-transparent to-transparent opacity-90 group-hover:opacity-60 transition-opacity" />
                    </div>

                    {/* Info Panel */}
                    <div className="p-4 flex flex-col gap-3 flex-1 z-10 bg-[#141418]/50">
                      <div className="flex justify-between items-start gap-4">
                        <h3 className="text-[15px] font-bold text-white tracking-tight leading-snug line-clamp-2 drop-shadow-sm">
                          {name}
                        </h3>
                      </div>

                      <p className="text-greyscale-400 text-[11px] leading-relaxed line-clamp-2 min-h-[1.75rem] font-medium opacity-80 group-hover:opacity-100 transition-opacity">
                        {desc || t("table.noDescription")}
                      </p>

                      <div className="flex flex-col gap-3">
                        {/* Main Tags Only */}
                        <div className="flex flex-wrap items-center gap-2">
                          {lab.type && (
                            <div className="text-[9px] font-black text-indigo-300 uppercase bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/20 shadow-sm">
                              {t(`type.${lab.type.toLowerCase() as "learning" | "competition"}`)}
                            </div>
                          )}
                          {lab.level && (
                            <div className={cn("text-[9px] font-black uppercase px-2 py-0.5 rounded border shadow-sm",
                              lab.level === "EASY" ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" :
                                lab.level === "MEDIUM" ? "bg-amber-500/10 text-amber-500 border-amber-500/20" :
                                  "bg-rose-500/10 text-rose-400 border-rose-500/20"
                            )}>
                              {t(`level.${lab.level.toLowerCase() as "easy" | "medium" | "hard"}`)}
                            </div>
                          )}
                        </div>
                        <div className="flex items-center gap-4">
                          {lab.estimatedTime && (
                            <div className="flex items-center gap-1.5 text-greyscale-500 text-[10px] font-bold">
                              <FaClock className="text-primary-300/70" size={10} />
                              <span>{lab.estimatedTime} {locale === 'vi' ? 'phút' : 'minutes'}</span>
                            </div>
                          )}
                          {lab.creator && (
                            <div className="flex items-center gap-1.5 text-greyscale-500 text-[10px] font-bold">
                              <FaUser className="text-primary-300/70" size={10} />
                              <span className="truncate max-w-[100px]">{lab.creator.fullName}</span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-2 mt-auto pt-2 relative z-20">
                        <button
                          onClick={(e) => handleEditBasicInfo(lab, e)}
                          className="flex-1 h-8 px-3 rounded bg-white/5 hover:bg-white/10 text-white text-[9px] md:text-[10px] font-bold transition-colors flex items-center justify-center gap-1.5 border border-white/5 hover:border-white/10 shadow-sm shrink-0 uppercase tracking-wider"
                          aria-label={t("table.actions.editInfo")}
                        >
                          <FaPen size={10} /> {t("table.actions.editInfo")}
                        </button>

                        <div onClick={(e) => e.stopPropagation()}>
                          <ConfirmActionPopover
                            trigger={
                              <button
                                className="w-8 h-8 rounded bg-rose-500/10 hover:bg-rose-500 text-rose-500 hover:text-white flex items-center justify-center transition-all border border-rose-500/20 hover:border-rose-500 shrink-0 shadow-sm"
                                aria-label={t("table.actions.delete")}
                              >
                                <FaTrash size={10} />
                              </button>
                            }
                            title={t("confirm.deleteTitle")}
                            description={t("confirm.deleteDescription")}
                            confirmText={tCommon("buttons.delete")}
                            cancelText={tCommon("buttons.cancel")}
                            onConfirm={() => handleConfirmDelete(lab.labID)}
                            isLoading={isDeleting}
                            side="bottom"
                            avoidCollisions={false}
                            widthClassName="w-64"
                          />
                        </div>
                      </div>
                    </div>


                    {/* Subtle Accent */}
                    <div className="h-[2px] w-0 bg-primary-300 group-hover:w-full transition-all duration-700 ease-out absolute bottom-0 left-0" />
                    <div className="absolute inset-0 border-[2px] border-primary-300/0 group-hover:border-primary-300/20 rounded transition-colors duration-500 pointer-events-none" />
                  </article>
                )
              })}
            </div>
          )}

          {/* Pagination Container */}
          {totalPages > 1 && totalRecords > 0 && !loading && (
            <div className="mt-8 pt-6 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-6 z-10 w-full shrink-0">
              <div className="flex items-center gap-4 w-full sm:w-auto">
                <div className="text-[10px] font-black uppercase tracking-[0.2em] text-greyscale-400 whitespace-nowrap">
                  Console <span className="text-white ml-2">{t("pagination.page")} <span className="text-primary-300 text-[12px]">{currentPage}</span> / {totalPages}</span>
                </div>
                <div className="h-1.5 w-full sm:w-40 bg-white/5 rounded overflow-hidden shrink-0 shadow-inner">
                  <div className="h-full bg-primary-300 transition-all duration-500 shadow-[0_0_12px_var(--primary-300,rgba(239,68,68,0.6))]" style={{ width: `${(currentPage / totalPages) * 100}%` }} />
                </div>
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto justify-center sm:justify-end">
                <button
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  className="w-10 h-10 sm:w-12 sm:h-12 rounded bg-white/[0.02] border border-white/5 text-white disabled:opacity-30 disabled:cursor-not-allowed hover:bg-white/5 hover:border-white/10 transition-all flex items-center justify-center outline-none shrink-0 shadow-sm disabled:shadow-none"
                  aria-label={tCommon("pagination.previous")}
                >
                  <FaChevronLeft size={12} />
                </button>

                <div className="flex items-center gap-1.5 px-3 py-2 bg-white/[0.02] rounded border border-white/5 shadow-sm backdrop-blur-md">
                  {Array.from({ length: totalPages }).map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setCurrentPage(i + 1)}
                      className={cn(
                        "w-8 h-8 sm:w-10 sm:h-10 rounded text-xs sm:text-sm font-black transition-all flex items-center justify-center outline-none shrink-0 relative overflow-hidden",
                        currentPage === i + 1
                          ? "bg-primary-300 text-white shadow-[0_4px_15px_var(--primary-300,rgba(239,68,68,0.3))] shadow-[inset_0_1px_1px_rgba(255,255,255,0.2)]"
                          : "text-greyscale-400 hover:text-white hover:bg-white/5"
                      )}
                    >
                      {currentPage === i + 1 && <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent pointer-events-none" />}
                      <span className="relative z-10">{i + 1}</span>
                    </button>
                  ))}
                </div>

                <button
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  className="w-10 h-10 sm:w-12 sm:h-12 rounded bg-white/[0.02] border border-white/5 text-white disabled:opacity-30 disabled:cursor-not-allowed hover:bg-white/5 hover:border-white/10 transition-all flex items-center justify-center outline-none shrink-0 shadow-sm disabled:shadow-none"
                  aria-label={tCommon("pagination.next")}
                >
                  <FaChevronRight size={12} />
                </button>
              </div>
            </div>
          )}
        </section>

      </div>
    </div>
  );
}
