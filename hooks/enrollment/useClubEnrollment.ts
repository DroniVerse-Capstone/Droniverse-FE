import { useQuery } from "@tanstack/react-query";
import { AxiosError } from "axios";
import apiClient from "@/lib/api/client";
import { ApiError } from "@/types/api/common";
import {
  GetClubEnrollmentsData,
  GetClubEnrollmentsQuery,
  LearningPathData,
  getClubEnrollmentsDataSchema,
  getLearningPathDataSchema,
} from "@/validations/enrollment/club-enrollment";

export const useGetClubEnrollments = (
  query: GetClubEnrollmentsQuery,
  enabled: boolean = true
) => {
  return useQuery<GetClubEnrollmentsData, AxiosError<ApiError>>({
    queryKey: ["club-enrollments", query],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (query.courseId) params.append("courseId", query.courseId);
      if (query.userId) params.append("userId", query.userId);
      params.append("pageIndex", String(query.pageIndex));
      params.append("pageSize", String(query.pageSize));

      const response = await apiClient.get(
        `/academy/club/enrollments/${query.clubId}`,
        { params }
      );

      return getClubEnrollmentsDataSchema.parse(response.data.data);
    },
    enabled: !!query.clubId && enabled,
  });
};

export const useGetLearningPath = (
  enrollmentId?: string,
  enabled: boolean = true
) => {
  return useQuery<LearningPathData, AxiosError<ApiError>>({
    queryKey: ["learning-path", enrollmentId],
    queryFn: async () => {
      if (!enrollmentId) throw new Error("Enrollment ID is required");

      const response = await apiClient.get(
        `/academy/club/enrollments/learning-path/${enrollmentId}`
      );

      return getLearningPathDataSchema.parse(response.data.data);
    },
    enabled: !!enrollmentId && enabled,
  });
};
