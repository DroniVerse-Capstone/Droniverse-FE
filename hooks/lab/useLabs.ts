import { useMemo } from "react";
import { useMutation, useQuery, useQueryClient, useSuspenseQuery } from "@tanstack/react-query";
import apiClient from "@/lib/api/client";
import { LabData, LabContent } from "@/types/lab";
import toast from "react-hot-toast";

// Helpers to avoid crash when BE returns {}
const sanitizeEnvironment = (env: any) => {
  if (!env || Object.keys(env).length === 0) {
    return {
      objects: [],
      map: { cells: 20, theme: "default" },
      rule: { timeLimit: 0, requiredScore: 0, sequentialCheckpoints: false, maxBlocks: 0 },
      hasSolution: false
    };
  }
  return {
    objects: env.objects || [],
    map: env.map || { cells: 20, theme: "default" },
    rule: env.rule ? {
      timeLimit: env.rule.timeLimit || 0,
      requiredScore: env.rule.requiredScore || 0,
      sequentialCheckpoints: !!env.rule.sequentialCheckpoints,
      maxBlocks: env.rule.maxBlocks || 0
    } : { timeLimit: 0, requiredScore: 0, sequentialCheckpoints: false, maxBlocks: 0 },
    hasSolution: env.hasSolution || env.rule?.hasSolution || false,
    solution: env.solution
  };
};

export type LabStatus = "DRAFT" | "ACTIVE" | "INACTIVE" | "LOCKED" | "DELETED";

export type UseGetLabsOptions = {
  type?: "LEARNING" | "COMPETITION";
  status?: LabStatus;
  searchTerm?: string;
  pageIndex?: number;
  pageSize?: number;
  withPaginationMeta?: boolean;
};

export type LabsPaginationData = {
  data: LabData[];
  totalRecords: number;
  pageIndex: number;
  pageSize: number;
  totalPages: number;
};

export function useGetLabs(options?: UseGetLabsOptions) {
  return useQuery<LabData[] | LabsPaginationData>({
    queryKey: [
      "labs",
      options?.type,
      options?.status,
      options?.searchTerm,
      options?.pageIndex,
      options?.pageSize,
      options?.withPaginationMeta,
    ],
    queryFn: async () => {
      const response = await apiClient.get<any>("/academy/labs", {
        params: {
          ...(options?.status && { Status: options.status }),
          ...(options?.searchTerm && { SearchTerm: options.searchTerm }),
          ...(options?.type && { Type: options.type }),
          ...(options?.pageIndex !== undefined && { PageIndex: options.pageIndex }),
          ...(options?.pageSize !== undefined
            ? { PageSize: options.pageSize }
            : { PageSize: 1000 }),
        }
      });
      const responseData = response.data?.data;
      const labsList = responseData?.data || [];
      const paginationData: LabsPaginationData = {
        data: labsList as LabData[],
        totalRecords: responseData?.totalRecords || 0,
        pageIndex: responseData?.pageIndex || options?.pageIndex || 1,
        pageSize: responseData?.pageSize || options?.pageSize || labsList.length || 0,
        totalPages: responseData?.totalPages || 1,
      };

      if (options?.withPaginationMeta) {
        return paginationData as LabsPaginationData;
      }

      return paginationData.data as LabData[];
    },
  });
}

export const useGetLab = (labID: string | null) => {
  return useQuery({
    queryKey: ["lab", labID],
    queryFn: async () => {
      if (!labID) return null;
      const response = await apiClient.get<any>(`/academy/labs/${labID}`);
      const beData = response.data?.data?.lab || response.data?.data || response.data;

      let labContent = response.data?.data?.labContent;
      if (labContent) {
        let env = labContent.environment;
        if (typeof env === 'string') {
          try { env = JSON.parse(env); } catch (e) { }
        }
        labContent.environment = sanitizeEnvironment(env);
      }

      return {
        ...beData,
        labID: beData.labID || beData.id,
        labContent: labContent
      } as LabData;
    },
    enabled: !!labID,
  });
};

export const useCreateLab = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: Omit<LabData, "labID" | "createdAt" | "updatedAt">) => {
      const response = await apiClient.post<any>("/academy/labs", data);

      const newLabData = response.data?.data?.lab || response.data?.data || response.data;

      return {
        ...newLabData,
        labID: newLabData.labID
      } as LabData;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["labs"] });
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || "Tạo Lab thất bại, vui lòng thử lại!";
      toast.error(message);
    }
  });
};

export const useUpdateLab = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ labID, data }: { labID: string; data: Partial<LabData> }) => {
      const metadata = { ...data };
      delete metadata.labContent;
      delete (metadata as any).labID;
      delete (metadata as any).creator;
      delete (metadata as any).updater;
      delete (metadata as any).createAt;
      delete (metadata as any).updateAt;
      delete (metadata as any).createdAt;
      delete (metadata as any).updatedAt;

      const response = await apiClient.put<LabData>(`/academy/labs/${labID}`, metadata);
      return response.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["labs"] });
      queryClient.invalidateQueries({ queryKey: ["lab", variables.labID] });
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || "Cập nhật Lab thất bại!";
      toast.error(message);
    }
  });
};

export const useDuplicateLab = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (labID: string) => {
      const response = await apiClient.post<any>(`/academy/labs/${labID}/duplicate`);
      const newLabData = response.data?.data?.lab || response.data?.data || response.data;
      return {
        ...newLabData,
        labID: newLabData.labID || newLabData.id
      } as LabData;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["labs"] });
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || "Nhân bản Lab thất bại!";
      toast.error(message);
    }
  });
};

export const useDeleteLab = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (labID: string) => {
      await apiClient.delete(`/academy/labs/${labID}`);
      return labID;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["labs"] });
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || "Xóa Lab thất bại!";
      toast.error(message);
    }
  });
};

// Lab Content Hooks (Environment/Map Data)
export const useGetLabContent = (labID: string | null) => {
  return useQuery({
    queryKey: ["labContent", labID],
    queryFn: async () => {
      if (!labID) return null;
      const response = await apiClient.get<any>(`/academy/labs/${labID}`);
      const content = response.data?.data?.labContent;
      if (content) {
        let env = content.environment;
        if (typeof env === 'string') {
          try { env = JSON.parse(env); } catch (e) { }
        }
        content.environment = sanitizeEnvironment(env);
      }
      return (content || null) as LabContent | null;
    },
    enabled: !!labID,
  });
};

export const useUpsertLabContent = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ labID, data, existingId }: { labID: string; data: any; existingId?: string }) => {
      // API yêu cầu environment là string (JSON string) thay vì object
      const environmentString = typeof data === 'string' ? data : JSON.stringify(data);

      const response = await apiClient.put<LabContent>(`/academy/labs/${labID}/content`, {
        environment: environmentString,
      });
      return response.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["labContent", variables.labID] });
      queryClient.invalidateQueries({ queryKey: ["lab", variables.labID] });
      queryClient.invalidateQueries({ queryKey: ["labs"] });
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || "Lưu nội dung Map thất bại!";
      toast.error(message);
    }
  });
};

export const useLabFull = (labID: string | null) => {
  const labQuery = useGetLab(labID);

  return {
    data: labQuery.data,
    isLoading: labQuery.isLoading,
    isError: labQuery.isError,
    contentId: (labQuery.data?.labContent as any)?.id
  };
};

export const useSuspenseGetLab = (labID: string) => {
  return useSuspenseQuery({
    queryKey: ["lab", labID],
    queryFn: async () => {
      try {
        const response = await apiClient.get<any>(`/academy/labs/${labID}`);
        const beData = response.data?.data?.lab || response.data?.data || response.data;

        let labContent = response.data?.data?.labContent;
        if (labContent) {
          let env = labContent.environment;
          if (typeof env === 'string') {
            try { env = JSON.parse(env); } catch (e) { }
          }
          labContent.environment = sanitizeEnvironment(env);
        }

        return {
          ...beData,
          labID: beData.labID || beData.id,
          labContent: labContent
        } as LabData;
      } catch (err: any) {
        if (err.response?.status === 404) return null;
        throw err;
      }
    },
  });
};

export const useSuspenseGetLabContent = (labID: string) => {
  return useSuspenseQuery({
    queryKey: ["labContent", labID],
    queryFn: async () => {
      try {
        const response = await apiClient.get<any>(`/academy/labs/${labID}`);
        let content = response.data?.data?.labContent;
        if (content) {
          let env = content.environment;
          if (typeof env === 'string') {
            try { env = JSON.parse(env); } catch (e) { }
          }
          content.environment = sanitizeEnvironment(env);
        }
        return (content || null) as LabContent | null;
      } catch (err: any) {
        if (err.response?.status === 404) return null;
        throw err;
      }
    },
  });
};

export const useSuspenseLabFull = (labID: string) => {
  const labQuery = useSuspenseGetLab(labID);

  return {
    data: labQuery.data,
    contentId: (labQuery.data?.labContent as any)?.id
  };
};

export const useUpdateLabFull = () => {
  const upsertContent = useUpsertLabContent();

  return useMutation({
    mutationFn: async ({ labID, data, contentId }: { labID: string; data: Partial<LabData>; contentId?: string }) => {
      const labContentData = data.labContent?.environment;

      if (labContentData) {
        await upsertContent.mutateAsync({
          labID,
          data: labContentData,
          existingId: contentId
        });
      }

      return data;
    }
  });
};

export const useGetStudentLabDetail = (enrollmentId: string, labId: string) => {
  return useQuery({
    queryKey: ["student-lab-detail", enrollmentId, labId],
    queryFn: async () => {
      if (!enrollmentId || !labId) return null;
      const response = await apiClient.get<any>(
        `/academy/user/enrollments/${enrollmentId}/labs/${labId}`
      );

      const data = response.data?.data;
      if (!data) return null;

      // Map/Sanitize structures
      if (data.labContent) {
        let env = data.labContent.environment;
        if (typeof env === "string") {
          try { env = JSON.parse(env); } catch (e) { }
        }
        data.labContent.environment = sanitizeEnvironment(env);
      }

      // Ensure consistent ID naming
      if (data.lab) {
        data.lab.labID = data.lab.labID || data.lab.id;
      }

      return data;
    },
    enabled: !!enrollmentId && !!labId,
  });
};

// -------------------------
// Submit student lab result
// -------------------------
interface SubmitLabPayload {
  solution: string;        // Blockly XML
  isCompleted: boolean;
  time: number;            // seconds spent
  numberOfStep: number;    // block count
  length: number;          // logical distance
  feedbackVN: string;
  feedbackEN: string;
  point: number;           // total score 0-100
}

export const useSubmitStudentLab = (enrollmentId: string, labId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: SubmitLabPayload) => {
      const response = await apiClient.post(
        `/academy/user/enrollments/${enrollmentId}/labs/${labId}/submit`,
        payload
      );
      return response.data;
    },
    onSuccess: () => {
      // Invalidate lab detail so next visit reflects submitted state
      queryClient.invalidateQueries({ queryKey: ["student-lab-detail", enrollmentId, labId] });
    },
  });
};
