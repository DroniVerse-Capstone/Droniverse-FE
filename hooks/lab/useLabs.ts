import { useMemo } from "react";
import { useMutation, useQuery, useQueryClient, useSuspenseQuery } from "@tanstack/react-query";
import mockClient from "@/lib/api/mock-client";
import { LabData, LabContent } from "@/types/lab";

export const useGetLabs = () => {
  return useQuery({
    queryKey: ["labs"],
    queryFn: async () => {
      // 1. Fetch all Labs (Metadata)
      const response = await mockClient.get<any[]>("/lab");
      const labs = response.data;
      
      // 2. Fetch all LabContent entries (Simulate BE Join/Merge)
      // Note: We fetch all and map them locally to maintain performance on MockAPI
      const contentsRes = await mockClient.get<any[]>("/LabContent");
      const contents = contentsRes.data;

      // 3. Map MockAPI auto-id to labID and merge the content
      return labs.map(lab => {
        const labID = lab.labID || lab.id;
        const linkedContent = contents.find(c => c.labID === labID);
        return {
          ...lab,
          labID,
          labContent: linkedContent ? { environment: linkedContent.environment } : null
        };
      }) as LabData[];
    },
  });
};

export const useGetLab = (labID: string | null) => {
  return useQuery({
    queryKey: ["lab", labID],
    queryFn: async () => {
      if (!labID) return null;
      const response = await mockClient.get<any>(`/lab/${labID}`);
      const lab = response.data;
      return {
        ...lab,
        labID: lab.labID || lab.id // Ensure labID is available
      } as LabData;
    },
    enabled: !!labID,
  });
};

export const useCreateLab = () => {
  const queryClient = useQueryClient();
  const upsertContent = useUpsertLabContent();

  return useMutation({
    mutationFn: async (data: Omit<LabData, "labID" | "createdAt" | "updatedAt">) => {
      // 1. Prepare metadata by removing nested labContent if present
      const metadata = { ...data };
      const initialContent = {
        objects: [],
        mapCells: 20,
        timeLimit: 0,
        requiredScore: 0,
        sequentialCheckpoints: false,
        hasSolution: false,
      };
      delete (metadata as any).labContent;

      // 2. Create the Lab Metadata
      const response = await mockClient.post<any>("/lab", metadata);
      const newLab = {
        ...response.data,
        labID: response.data.labID || response.data.id
      } as LabData;

      // 3. Create the Initial LabContent linked to the new labID
      await upsertContent.mutateAsync({
        labID: newLab.labID,
        data: initialContent,
      });

      return newLab;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["labs"] });
    },
  });
};

export const useUpdateLab = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ labID, data }: { labID: string; data: Partial<LabData> }) => {
      // Strictly filter metadata to avoid huge payloads to the /lab endpoint
      const metadata = { ...data };
      delete metadata.labContent;
      delete (metadata as any).labID; // Don't send the ID in the body for MockAPI metadata
      
      const response = await mockClient.put<LabData>(`/lab/${labID}`, metadata);
      return response.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["labs"] });
      queryClient.invalidateQueries({ queryKey: ["lab", variables.labID] });
    },
  });
};

export const useDeleteLab = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (labID: string) => {
      // 1. Find the associated LabContent first
      const contentRes = await mockClient.get<LabContent[]>(`/LabContent?labID=${labID}`);
      const content = contentRes.data[0];

      // 2. Delete LabContent if it exists
      if (content) {
        await mockClient.delete(`/LabContent/${content.id}`);
      }

      // 3. Delete Lab Metadata
      await mockClient.delete(`/lab/${labID}`);
      return labID;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["labs"] });
    },
  });
};

// Lab Content Hooks (Environment/Map Data)
export const useGetLabContent = (labID: string | null) => {
  return useQuery({
    queryKey: ["labContent", labID],
    queryFn: async () => {
      if (!labID) return null;
      const response = await mockClient.get<LabContent[]>(`/LabContent?labID=${labID}`);
      return response.data[0] || null;
    },
    enabled: !!labID,
  });
};

export const useUpsertLabContent = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ labID, data, existingId }: { labID: string; data: any; existingId?: string }) => {
      if (existingId) {
        const response = await mockClient.put<LabContent>(`/LabContent/${existingId}`, {
          labID,
          environment: data,
        });
        return response.data;
      } else {
        const response = await mockClient.post<LabContent>("/LabContent", {
          labID,
          environment: data,
        });
        return response.data;
      }
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["labContent", variables.labID] });
      queryClient.invalidateQueries({ queryKey: ["lab", variables.labID] });
      queryClient.invalidateQueries({ queryKey: ["labs"] });
    },
  });
};

export const useLabFull = (labID: string | null) => {
  const labQuery = useGetLab(labID);
  const contentQuery = useGetLabContent(labID);

  const labFull = useMemo(() => {
    if (!labQuery.data) return null;
    return {
      ...labQuery.data,
      labContent: contentQuery.data ? { environment: contentQuery.data.environment } : undefined
    } as LabData;
  }, [labQuery.data, contentQuery.data]);

  return {
    data: labFull,
    isLoading: labQuery.isLoading || contentQuery.isLoading,
    isError: labQuery.isError || contentQuery.isError,
    contentId: contentQuery.data?.id
  };
};

export const useSuspenseGetLab = (labID: string) => {
  return useSuspenseQuery({
    queryKey: ["lab", labID],
    queryFn: async () => {
      try {
        const response = await mockClient.get<any>(`/lab/${labID}`);
        const lab = response.data;
        return {
          ...lab,
          labID: lab.labID || lab.id
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
        const response = await mockClient.get<LabContent[]>(`/LabContent?labID=${labID}`);
        return response.data[0] || null;
      } catch (err: any) {
        if (err.response?.status === 404) return null;
        throw err;
      }
    },
  });
};

export const useSuspenseLabFull = (labID: string) => {
  const labQuery = useSuspenseGetLab(labID);
  const contentQuery = useSuspenseGetLabContent(labID);

  const labFull = useMemo(() => {
    if (!labQuery.data) return null;
    return {
      ...labQuery.data,
      labContent: contentQuery.data ? { environment: contentQuery.data.environment } : undefined
    } as LabData;
  }, [labQuery.data, contentQuery.data]);

  return {
    data: labFull,
    contentId: contentQuery.data?.id
  };
};

export const useUpdateLabFull = () => {
  const updateLab = useUpdateLab();
  const upsertContent = useUpsertLabContent();

  return useMutation({
    mutationFn: async ({ labID, data, contentId }: { labID: string; data: Partial<LabData>; contentId?: string }) => {
      // 1. Update Metadata
      const metadataToUpdate = { ...data };
      const labContentData = metadataToUpdate.labContent?.environment;
      delete metadataToUpdate.labContent;

      const labResponse = await updateLab.mutateAsync({ labID, data: metadataToUpdate });

      // 2. Update Content if provided
      if (labContentData) {
        await upsertContent.mutateAsync({
          labID,
          data: labContentData,
          existingId: contentId
        });
      }

      return labResponse;
    }
  });
};
