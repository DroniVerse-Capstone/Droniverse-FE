import { useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import { useGetUserLearningPath } from "@/hooks/learning/useUserLearning";


const NAV_CONFIG = {
  LESSON_QUERY_PARAM: "lessonId",

  getDashboardUrl: (clubSlug: string, enrollmentId: string) =>
    `/learn/${clubSlug}/${enrollmentId}`,

  getDeepLinkUrl: (clubSlug: string, enrollmentId: string, lessonId: string) =>
    `/learn/${clubSlug}/${enrollmentId}?${NAV_CONFIG.LESSON_QUERY_PARAM}=${lessonId}`,
};

export const useLessonNavigation = (enrollmentId: string, currentReferenceId?: string) => {
  const router = useRouter();
  const params = useParams();
  const clubSlug = params?.clubSlug as string;

  const { data: learningPath, isLoading, isError } = useGetUserLearningPath(enrollmentId);

  const lessonContext = useMemo(() => {
    if (!learningPath || !currentReferenceId) return null;
    const allLessons: any[] = [];
    learningPath.modules.forEach(m => {
      allLessons.push(...m.lessons);
    });

    const currentIndex = allLessons.findIndex(l => l.referenceID === currentReferenceId);

    return {
      allLessons,
      current: currentIndex !== -1 ? allLessons[currentIndex] : null,
      next: (currentIndex !== -1 && currentIndex < allLessons.length - 1) ? allLessons[currentIndex + 1] : null,
      prev: (currentIndex > 0) ? allLessons[currentIndex - 1] : null,
    };
  }, [learningPath, currentReferenceId]);


  const nextLessonUrl = useMemo(() => {
    if (!lessonContext?.next) return NAV_CONFIG.getDashboardUrl(clubSlug, enrollmentId);

    return NAV_CONFIG.getDeepLinkUrl(clubSlug, enrollmentId, lessonContext.next.lessonID);
  }, [lessonContext, enrollmentId, clubSlug]);

  const currentLessonUrl = useMemo(() => {
    if (!lessonContext?.current) return NAV_CONFIG.getDashboardUrl(clubSlug, enrollmentId);
    return NAV_CONFIG.getDeepLinkUrl(clubSlug, enrollmentId, lessonContext.current.lessonID);
  }, [lessonContext, enrollmentId, clubSlug]);


  const handleNext = () => router.push(nextLessonUrl);

  const handleExit = () => router.push(currentLessonUrl);

  return {
    learningPath,
    lessonContext,
    nextLessonUrl,
    currentLessonUrl,
    handleNext,
    handleExit,
    isLoading,
    isError
  };
};
