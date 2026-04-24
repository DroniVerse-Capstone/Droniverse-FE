import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import apiClient from "@/lib/api/client";
import { WebSimulator, WebSimulatorResponse } from "@/types/simulator";
import { AxiosError } from "axios";
import { ApiError } from "@/types/api/common";

export function useGetWebSimulators(options?: { type?: string; droneId?: string }) {
  return useQuery<WebSimulator[]>({
    queryKey: ["web-simulators", options?.type, options?.droneId],
    queryFn: async () => {
      const response = await apiClient.get<WebSimulatorResponse>("/academy/web-simulators", {
        params: {
          ...(options?.type && { type: options.type }),
          ...(options?.droneId && { droneId: options.droneId }),
        },
      });
      return response.data.data;
    },
  });
}

export const useImportSimulatorLesson = (options?: {
  onSuccess?: (data: any) => void;
  onError?: (error: AxiosError<ApiError>) => void;
}) => {
  const queryClient = useQueryClient();

  return useMutation<any, AxiosError<ApiError>, { simulatorId: string; payload: any }>({
    mutationFn: async ({ simulatorId, payload }) => {
      const response = await apiClient.post(
        `/academy/web-simulators/${simulatorId}/lessons`,
        {
          moduleID: payload.moduleID,
          orderIndex: payload.orderIndex,
        }
      );
      return response.data;
    },
    onSuccess: async (data, variables) => {
      await queryClient.invalidateQueries({
        queryKey: ["lessons", variables.payload.moduleID],
      });
      options?.onSuccess?.(data);
    },
    onError: (error) => {
      options?.onError?.(error);
    },
  });
};

export const useImportVRSimulatorLesson = (options?: {
  onSuccess?: (data: any) => void;
  onError?: (error: AxiosError<ApiError>) => void;
}) => {
  const queryClient = useQueryClient();

  return useMutation<any, AxiosError<ApiError>, { simulatorId: string; payload: any }>({
    mutationFn: async ({ simulatorId, payload }) => {
      const response = await apiClient.post(
        `/academy/vr-simulators/${simulatorId}/lessons`,
        {
          moduleID: payload.moduleID,
          orderIndex: payload.orderIndex,
        }
      );
      return response.data;
    },
    onSuccess: async (data, variables) => {
      await queryClient.invalidateQueries({
        queryKey: ["lessons", variables.payload.moduleID],
      });
      options?.onSuccess?.(data);
    },
    onError: (error) => {
      options?.onError?.(error);
    },
  });
};

export function useGetWebSimulator(simulatorId: string | null) {
  return useQuery<WebSimulator>({
    queryKey: ["web-simulator", simulatorId],
    queryFn: async () => {
      if (!simulatorId) return null as any;
      const response = await apiClient.get<any>(`/academy/web-simulators/${simulatorId}`);
      return response.data.data;
    },
    enabled: !!simulatorId,
  });
}

export function useGetVRSimulators() {
  return useQuery<any[]>({
    queryKey: ["vr-simulators"],
    queryFn: async () => {
      const response = await apiClient.get<any>("/academy/vr-simulators");
      return response.data?.data?.data || response.data?.data || [];
    },
  });
}

export function useGetVRSimulator(simulatorId: string | null) {
  return useQuery<any>({
    queryKey: ["vr-simulator", simulatorId],
    queryFn: async () => {
      if (!simulatorId) return null as any;
      const response = await apiClient.get<any>(`/academy/vr-simulators/${simulatorId}`);
      return response.data?.data || response.data;
    },
    enabled: !!simulatorId,
  });
}

export function useGetUserSimulatorLesson(enrollmentId?: string, lessonId?: string) {
  return useQuery({
    queryKey: ["user-simulator-lesson", enrollmentId, lessonId],
    queryFn: async () => {
      if (!enrollmentId || !lessonId) return null;
      const response = await apiClient.get<any>(
        `/academy/user/enrollments/${enrollmentId}/lessons/${lessonId}/simulator`
      );
      return response.data.data;
    },
    enabled: !!enrollmentId && !!lessonId,
  });
}

export const useSubmitUserSimulatorLesson = (options?: {
  onSuccess?: (data: any) => void;
  onError?: (error: AxiosError<ApiError>) => void;
}) => {
  const queryClient = useQueryClient();

  return useMutation<any, AxiosError<ApiError>, { enrollmentId: string; lessonId: string; payload: { flightTime: number; score?: number; isSuccess?: boolean } }>({
    mutationFn: async ({ enrollmentId, lessonId, payload }) => {
      const response = await apiClient.post(
        `/academy/user/enrollments/${enrollmentId}/lessons/${lessonId}/simulator/submit`,
        payload
      );
      return response.data;
    },
    onSuccess: async (data, variables) => {
      // Đảm bảo cache được làm mới ở tất cả các trang (kể cả trang preview bài học)
      await queryClient.invalidateQueries({
        queryKey: ["user-simulator-lesson"],
      });
      // Invalidate cái cây thư mục bên trái (learning-path) để nó gọi API mở khóa bài tiếp theo
      await queryClient.invalidateQueries({
        queryKey: ["user-learning-path"]
      });
      options?.onSuccess?.(data);
    },
    onError: (error) => {
      options?.onError?.(error);
    },
  });
};

export const useCompleteLesson = (options?: {
  onSuccess?: (data: any) => void;
  onError?: (error: AxiosError<ApiError>) => void;
}) => {
  const queryClient = useQueryClient();

  return useMutation<any, AxiosError<ApiError>, { enrollmentId: string; lessonId: string }>({
    mutationFn: async ({ enrollmentId, lessonId }) => {
      const response = await apiClient.post(
        `/academy/user/enrollments/${enrollmentId}/lessons/${lessonId}/complete`
      );
      return response.data;
    },
    onSuccess: async (data, variables) => {
      await queryClient.invalidateQueries({
        queryKey: ["user-learning-path"]
      });
      options?.onSuccess?.(data);
    },
    onError: (error) => {
      options?.onError?.(error);
    },
  });
};