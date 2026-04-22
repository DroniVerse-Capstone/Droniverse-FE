"use client";

import React from "react";
import { AxiosError } from "axios";
import toast from "react-hot-toast";
import { MdOutlineAddCircleOutline } from "react-icons/md";

import CommonDropdown, {
  CommonDropdownOption,
} from "@/components/common/CommonDropdown";
import AppPagination from "@/components/common/AppPagination";
import QuillEditor from "@/components/common/QuillEditor";
import SelectLabCard from "@/components/system/course-edit/course-settings/SelectLabCard";
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
import { Spinner } from "@/components/ui/spinner";
import { Textarea } from "@/components/ui/textarea";
import { useImportLabLesson } from "@/hooks/lesson/useLesson";
import { useGetLabs } from "@/hooks/lab/useLabs";
import { useGetWebSimulators, useImportSimulatorLesson, useGetVRSimulators, useImportVRSimulatorLesson } from "@/hooks/simulator/useSimulator";
import SelectSimulatorCard from "@/components/system/course-edit/course-settings/SelectSimulatorCard";
import { useCreateQuiz } from "@/hooks/quiz/useQuiz";
import { useCreateTheory } from "@/hooks/theory/useTheory";
import { ApiError } from "@/types/api/common";
import { Lesson, LessonType } from "@/validations/lesson/lesson";
import { useTranslations } from "@/providers/i18n-provider";
import EmptyState from "@/components/common/EmptyState";

type CreateLessonDialogProps = {
  moduleId: string;
  lessons: Lesson[];
};

export default function CreateLessonDialog({
  moduleId,
  lessons,
}: CreateLessonDialogProps) {
  const t = useTranslations("CourseManagement.CourseSettings.CreateLessonDialog");
  const [open, setOpen] = React.useState(false);
  const [lessonType, setLessonType] = React.useState<LessonType>("THEORY");
  const [selectedLabId, setSelectedLabId] = React.useState("");
  const [labSearchTerm, setLabSearchTerm] = React.useState("");
  const [labPageIndex, setLabPageIndex] = React.useState(1);

  const [titleVN, setTitleVN] = React.useState("");
  const [titleEN, setTitleEN] = React.useState("");
  const [estimatedTime, setEstimatedTime] = React.useState("");
  const [contentVN, setContentVN] = React.useState("");
  const [contentEN, setContentEN] = React.useState("");
  const [descriptionVN, setDescriptionVN] = React.useState("");
  const [descriptionEN, setDescriptionEN] = React.useState("");
  const [timeLimit, setTimeLimit] = React.useState("");
  const [totalScore, setTotalScore] = React.useState("");
  const [passScore, setPassScore] = React.useState("");

  const createTheoryMutation = useCreateTheory({
    onSuccess: (data) => {
      toast.success(data.message);
      setOpen(false);
      resetForm();
    },
    onError: (error) => {
      const axiosError = error as AxiosError<ApiError>;
      toast.error(
        axiosError.response?.data?.message ||
        axiosError.message ||
        t("error.createTheoryFailed"),
      );
    },
  });

  const createQuizMutation = useCreateQuiz({
    onSuccess: (data) => {
      toast.success(data.message);
      setOpen(false);
      resetForm();
    },
    onError: (error) => {
      const axiosError = error as AxiosError<ApiError>;
      toast.error(
        axiosError.response?.data?.message ||
        axiosError.message ||
        t("error.createQuizFailed"),
      );
    },
  });

  const importLabLessonMutation = useImportLabLesson({
    onSuccess: (data) => {
      toast.success(data.message || t("toast.importLabSuccess"));
      setOpen(false);
      resetForm();
    },
    onError: (error) => {
      const axiosError = error as AxiosError<ApiError>;
      toast.error(
        axiosError.response?.data?.message ||
        axiosError.message ||
        t("error.importLabFailed"),
      );
    },
  });

  const importSimulatorLessonMutation = useImportSimulatorLesson({
    onSuccess: (data) => {
      toast.success(data.message || t("toast.importLabSuccess"));
      setOpen(false);
      resetForm();
    },
    onError: (error) => {
      const axiosError = error as AxiosError<ApiError>;
      toast.error(
        axiosError.response?.data?.message ||
        axiosError.message ||
        t("error.importLabFailed"),
      );
    },
  });

  const importVRSimulatorLessonMutation = useImportVRSimulatorLesson({
    onSuccess: (data) => {
      toast.success(data.message || t("toast.importLabSuccess"));
      setOpen(false);
      resetForm();
    },
    onError: (error) => {
      const axiosError = error as AxiosError<ApiError>;
      toast.error(
        axiosError.response?.data?.message ||
        axiosError.message ||
        t("error.importLabFailed"),
      );
    },
  });

  const labPageSize = 6;

  const { data: activeLabsResponse, isLoading: isLabsLoading } = useGetLabs({
    type: "LEARNING",
    status: "ACTIVE",
    searchTerm: labSearchTerm,
    pageIndex: labPageIndex,
    pageSize: labPageSize,
    withPaginationMeta: true,
  });

  const activeLabsData =
    activeLabsResponse && !Array.isArray(activeLabsResponse)
      ? activeLabsResponse
      : null;
  const activeLabs = activeLabsData?.data || [];
  const labTotalPages = activeLabsData?.totalPages || 1;

  const { data: webSimulators = [], isLoading: isWebSimulatorsLoading } = useGetWebSimulators({
    type: ["PHYSIC", "LAB_PHYSIC"].includes(lessonType) ? lessonType : undefined,
  });
  const { data: vrSimulators = [], isLoading: isVRSimulatorsLoading } = useGetVRSimulators();

  const isSimulatorsLoading = lessonType === "VR" ? isVRSimulatorsLoading : isWebSimulatorsLoading;

  const filteredSimulators = React.useMemo(() => {
    const simsToFilter = lessonType === "VR" ? vrSimulators : webSimulators;
    
    if (!labSearchTerm) return simsToFilter;
    const term = labSearchTerm.toLowerCase();
    return simsToFilter.filter(
      (s) =>
        s.titleVN?.toLowerCase().includes(term) ||
        s.titleEN?.toLowerCase().includes(term) ||
        s.objectivesVN?.toLowerCase().includes(term) ||
        s.objectivesEN?.toLowerCase().includes(term),
    );
  }, [webSimulators, vrSimulators, lessonType, labSearchTerm]);

  const lessonTypeOptions: CommonDropdownOption[] = [
    { value: "THEORY", label: t("lessonTypes.theory") },
    { value: "QUIZ", label: t("lessonTypes.quiz") },
    { value: "LAB", label: t("lessonTypes.lab") },
    { value: "PHYSIC", label: t("lessonTypes.physic") },
    { value: "LAB_PHYSIC", label: t("lessonTypes.lab_physic") },
    { value: "VR", label: t("lessonTypes.vr") },
  ];

  const isSubmitting =
    createTheoryMutation.isPending ||
    createQuizMutation.isPending ||
    importLabLessonMutation.isPending ||
    importSimulatorLessonMutation.isPending ||
    importVRSimulatorLessonMutation.isPending;

  React.useEffect(() => {
    setLabPageIndex(1);
  }, [labSearchTerm]);

  React.useEffect(() => {
    if (labPageIndex > labTotalPages) {
      setLabPageIndex(labTotalPages);
    }
  }, [labPageIndex, labTotalPages]);

  const nextOrderIndex =
    lessons.length > 0
      ? Math.max(...lessons.map((lesson) => lesson.orderIndex)) + 1
      : 1;

  function resetForm() {
    setLessonType("THEORY");
    setTitleVN("");
    setTitleEN("");
    setEstimatedTime("");
    setContentVN("");
    setContentEN("");
    setDescriptionVN("");
    setDescriptionEN("");
    setTimeLimit("");
    setTotalScore("");
    setPassScore("");
    setSelectedLabId("");
    setLabSearchTerm("");
    setLabPageIndex(1);
  }

  const handleOpenChange = (nextOpen: boolean) => {
    if (isSubmitting) return;

    setOpen(nextOpen);
    if (!nextOpen) {
      resetForm();
    }
  };

  const parsePositiveInt = (value: string) => {
    const numberValue = Number(value);
    if (!Number.isInteger(numberValue) || numberValue <= 0) {
      return null;
    }

    return numberValue;
  };

  const parseNonNegativeInt = (value: string) => {
    const numberValue = Number(value);
    if (!Number.isInteger(numberValue) || numberValue < 0) {
      return null;
    }

    return numberValue;
  };

  const handleSubmit = async () => {
    const normalizedTitleVN = titleVN.trim();
    const normalizedTitleEN = titleEN.trim();
    const isTheoryOrQuiz = lessonType === "THEORY" || lessonType === "QUIZ";
    const isLabBased = ["LAB", "PHYSIC", "LAB_PHYSIC", "VR"].includes(lessonType);

    if (isTheoryOrQuiz && (!normalizedTitleVN || !normalizedTitleEN)) {
      toast.error(t("error.missingTitle"));
      return;
    }

    if (lessonType === "THEORY") {
      const normalizedContentVN = contentVN.trim();
      const normalizedContentEN = contentEN.trim();
      const parsedEstimatedTime = parsePositiveInt(estimatedTime);

      if (!normalizedContentVN || !normalizedContentEN || !parsedEstimatedTime) {
        toast.error(t("error.missingTheory"));
        return;
      }

      await createTheoryMutation.mutateAsync({
        moduleID: moduleId,
        orderIndex: nextOrderIndex,
        titleVN: normalizedTitleVN,
        titleEN: normalizedTitleEN,
        contentVN: normalizedContentVN,
        contentEN: normalizedContentEN,
        estimatedTime: parsedEstimatedTime,
      });

      return;
    }

    if (lessonType === "QUIZ") {
      const normalizedDescriptionVN = descriptionVN.trim();
      const normalizedDescriptionEN = descriptionEN.trim();
      const parsedTimeLimit = parsePositiveInt(timeLimit);
      const parsedTotalScore = parsePositiveInt(totalScore);
      const parsedPassScore = parseNonNegativeInt(passScore);

      if (
        !normalizedDescriptionVN ||
        !normalizedDescriptionEN ||
        !parsedTimeLimit ||
        !parsedTotalScore ||
        parsedPassScore === null
      ) {
        toast.error(t("error.missingQuiz"));
        return;
      }

      if (parsedPassScore > parsedTotalScore) {
        toast.error(t("error.invalidPassScore"));
        return;
      }

      await createQuizMutation.mutateAsync({
        moduleID: moduleId,
        orderIndex: nextOrderIndex,
        titleVN: normalizedTitleVN,
        titleEN: normalizedTitleEN,
        descriptionVN: normalizedDescriptionVN,
        descriptionEN: normalizedDescriptionEN,
        timeLimit: parsedTimeLimit,
        totalScore: parsedTotalScore,
        passScore: parsedPassScore,
      });

      return;
    }

    if (isLabBased && !selectedLabId) {
      toast.error(t("error.missingLab"));
      return;
    }

    if (lessonType === "VR") {
      await importVRSimulatorLessonMutation.mutateAsync({
        simulatorId: selectedLabId,
        payload: {
          moduleID: moduleId,
          orderIndex: nextOrderIndex,
        },
      });
      return;
    }

    if (["PHYSIC", "LAB_PHYSIC"].includes(lessonType)) {
      await importSimulatorLessonMutation.mutateAsync({
        simulatorId: selectedLabId,
        payload: {
          moduleID: moduleId,
          orderIndex: nextOrderIndex,
        },
      });
      return;
    }

    await importLabLessonMutation.mutateAsync({
      labId: selectedLabId,
      payload: {
        moduleID: moduleId,
        orderIndex: nextOrderIndex,
        type: lessonType,
      },
    });
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button icon={<MdOutlineAddCircleOutline size={18} />} variant="secondary">
          {t("buttons.createLesson")}
        </Button>
      </DialogTrigger>

      <DialogContent className="max-h-[90vh] sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{t("title")}</DialogTitle>
          <DialogDescription>
            {t("subtitle").replace("{orderIndex}", String(nextOrderIndex))}
          </DialogDescription>
        </DialogHeader>

        <div className="max-h-[65vh] space-y-4 overflow-y-auto py-2 pr-1">
          <CommonDropdown
            label={t("lessonType")}
            options={lessonTypeOptions}
            value={lessonType}
            onChange={(value) => setLessonType(value as LessonType)}
            placeholder={t("lessonTypePlaceholder")}
            disabled={isSubmitting}
          />

          {lessonType === "THEORY" || lessonType === "QUIZ" ? (
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="create-lesson-title-vn">{t("fields.titleVN")}</Label>
                <Input
                  id="create-lesson-title-vn"
                  value={titleVN}
                  onChange={(event) => setTitleVN(event.target.value)}
                  placeholder={t("fields.titleVNPlaceholder")}
                  disabled={isSubmitting}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="create-lesson-title-en">{t("fields.titleEN")}</Label>
                <Input
                  id="create-lesson-title-en"
                  value={titleEN}
                  onChange={(event) => setTitleEN(event.target.value)}
                  placeholder={t("fields.titleENPlaceholder")}
                  disabled={isSubmitting}
                />
              </div>
            </div>
          ) : null}

          {lessonType === "THEORY" ? (
            <div className="space-y-4">
              <QuillEditor
                id="create-theory-content-vn"
                label={t("fields.theoryContentVN")}
                value={contentVN}
                onChange={setContentVN}
                placeholder={t("fields.theoryContentVNPlaceholder")}
                readOnly={isSubmitting}
                minHeight={200}
              />

              <QuillEditor
                id="create-theory-content-en"
                label={t("fields.theoryContentEN")}
                value={contentEN}
                onChange={setContentEN}
                placeholder={t("fields.theoryContentENPlaceholder")}
                readOnly={isSubmitting}
                minHeight={200}
              />

              <div className="space-y-2">
                <Label htmlFor="create-theory-estimated-time">{t("fields.estimatedTime")}</Label>
                <Input
                  id="create-theory-estimated-time"
                  type="number"
                  min={1}
                  value={estimatedTime}
                  onChange={(event) => setEstimatedTime(event.target.value)}
                  placeholder={t("fields.estimatedTimePlaceholder")}
                  disabled={isSubmitting}
                />
              </div>
            </div>
          ) : null}

          {lessonType === "QUIZ" ? (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="create-quiz-description-vn">{t("fields.quizDescriptionVN")}</Label>
                <Textarea
                  id="create-quiz-description-vn"
                  value={descriptionVN}
                  onChange={(event) => setDescriptionVN(event.target.value)}
                  placeholder={t("fields.quizDescriptionVNPlaceholder")}
                  disabled={isSubmitting}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="create-quiz-description-en">{t("fields.quizDescriptionEN")}</Label>
                <Textarea
                  id="create-quiz-description-en"
                  value={descriptionEN}
                  onChange={(event) => setDescriptionEN(event.target.value)}
                  placeholder={t("fields.quizDescriptionENPlaceholder")}
                  disabled={isSubmitting}
                />
              </div>

              <div className="grid gap-4 md:grid-cols-3">
                <div className="space-y-2">
                  <Label htmlFor="create-quiz-time-limit">{t("fields.quizTimeLimit")}</Label>
                  <Input
                    id="create-quiz-time-limit"
                    type="number"
                    min={1}
                    value={timeLimit}
                    onChange={(event) => setTimeLimit(event.target.value)}
                    placeholder={t("fields.quizTimeLimitPlaceholder")}
                    disabled={isSubmitting}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="create-quiz-total-score">{t("fields.quizTotalScore")}</Label>
                  <Input
                    id="create-quiz-total-score"
                    type="number"
                    min={1}
                    value={totalScore}
                    onChange={(event) => setTotalScore(event.target.value)}
                    placeholder={t("fields.quizTotalScorePlaceholder")}
                    disabled={isSubmitting}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="create-quiz-pass-score">{t("fields.quizPassScore")}</Label>
                  <Input
                    id="create-quiz-pass-score"
                    type="number"
                    min={0}
                    value={passScore}
                    onChange={(event) => setPassScore(event.target.value)}
                    placeholder={t("fields.quizPassScorePlaceholder")}
                    disabled={isSubmitting}
                  />
                </div>
              </div>
            </div>
          ) : null}

          {["LAB", "PHYSIC", "LAB_PHYSIC", "VR"].includes(lessonType) ? (
            <div className="space-y-4 rounded border border-greyscale-700 bg-greyscale-900/70 p-3">
              <div className="space-y-2">
                <Label htmlFor="lab-search">
                  {lessonType === "PHYSIC" ? t("fields.simulatorSearch") : t("fields.labSearch")}
                </Label>
                <Input
                  type="search"
                  id="lab-search"
                  value={labSearchTerm}
                  onChange={(event) => setLabSearchTerm(event.target.value)}
                  placeholder={
                    lessonType === "PHYSIC"
                      ? t("fields.simulatorSearchPlaceholder")
                      : t("fields.labSearchPlaceholder")
                  }
                  disabled={isSubmitting}
                />
              </div>

              <p className="text-xs text-greyscale-300">
                {selectedLabId
                  ? lessonType === "PHYSIC"
                    ? t("fields.simulatorSelected")
                    : t("fields.labSelected")
                  : lessonType === "PHYSIC"
                    ? t("fields.simulatorSelectHint")
                    : t("fields.labSelectHint")}
              </p>

              {isLabsLoading || isSimulatorsLoading ? (
                <div className="flex min-h-24 items-center justify-center">
                  <Spinner className="h-5 w-5" />
                </div>
              ) : null}

              {["PHYSIC", "LAB_PHYSIC", "VR"].includes(lessonType) && !isSimulatorsLoading && filteredSimulators.length === 0 ? (
                <EmptyState title={t("fields.simulatorEmpty")} />
              ) : null}

              {!["PHYSIC", "LAB_PHYSIC", "VR"].includes(lessonType) && !isLabsLoading && activeLabs.length === 0 ? (
                <EmptyState title={t("fields.labEmpty")} />
              ) : null}

              {["PHYSIC", "LAB_PHYSIC", "VR"].includes(lessonType) && !isSimulatorsLoading && filteredSimulators.length > 0 ? (
                <div className="grid gap-3 md:grid-cols-2">
                  {filteredSimulators.map((simulator) => {
                    const simId = simulator.webSimulatorID || simulator.vrSimulatorID;
                    return (
                      <SelectSimulatorCard
                        key={simId}
                        simulator={simulator}
                        isSelected={selectedLabId === simId}
                        onSelect={setSelectedLabId}
                        disabled={isSubmitting}
                      />
                    );
                  })}
                </div>
              ) : null}

              {!["PHYSIC", "LAB_PHYSIC", "VR"].includes(lessonType) && !isLabsLoading && activeLabs.length > 0 ? (
                <div className="grid gap-3 md:grid-cols-2">
                  {activeLabs.map((lab) => {
                    return (
                      <SelectLabCard
                        key={lab.labID}
                        lab={lab}
                        isSelected={selectedLabId === lab.labID}
                        onSelect={setSelectedLabId}
                        disabled={isSubmitting}
                      />
                    );
                  })}
                </div>
              ) : null}

              {!["PHYSIC", "LAB_PHYSIC", "VR"].includes(lessonType) && !isLabsLoading ? (
                <AppPagination
                  currentPage={labPageIndex}
                  totalPages={labTotalPages}
                  onPageChange={setLabPageIndex}
                  disabled={isSubmitting}
                  className="justify-center"
                />
              ) : null}
            </div>
          ) : null}
        </div>

        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline" disabled={isSubmitting}>
              {t("buttons.cancel")}
            </Button>
          </DialogClose>

          <Button onClick={() => void handleSubmit()} disabled={isSubmitting}>
            {isSubmitting ? <Spinner className="h-4 w-4" /> : null}
            {t("buttons.createLesson")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export type { CreateLessonDialogProps };
