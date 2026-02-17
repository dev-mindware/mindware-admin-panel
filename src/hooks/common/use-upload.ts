"use client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { File as MyFile } from "@/types";
import { api } from "@/services/api";

type UploadFile = MyFile | null | undefined;

type UploadData = Record<
  string,
  string | number | boolean | MyFile | MyFile[] | null
>;

interface MutationVariables {
  files: Record<string, UploadFile | UploadFile[]>; // ✅ aceita array também
  extraData?: UploadData;
}

export function useFileUpload(apiEndpoint: string, queryKey?: string) {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async ({ files, extraData = {} }: MutationVariables) => {
      const formData = new FormData();

      // 👉 percorre os arquivos
      for (const [key, value] of Object.entries(files)) {
        if (!value) continue;

        // Se for array de arquivos
        if (Array.isArray(value)) {
          for (const file of value) {
            if (!file) continue;
            if (!file?.url) continue;
            const response = await fetch(file.url);
            const blob = await response.blob();
            const fileObject = new File([blob], file.originalname, {
              type: file.mimetype,
            });
            formData.append(key, fileObject); // mesmo "key" várias vezes
          }
        } else {
          // Se for um único arquivo
          if (!value?.url) continue;
          const response = await fetch(value.url);
          const blob = await response.blob();
          const fileObject = new File([blob], value.originalname, {
            type: value.mimetype,
          });
          formData.append(key, fileObject);
        }
      }

      for (const [key, value] of Object.entries(extraData)) {
        if (value !== null && typeof value !== "object") {
          formData.append(key, value.toString());
        }
      }

      const response = await api.post(apiEndpoint, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["current-user", queryKey] });
    },
    onError: (error: any) => {
      console.error("Erro no upload:", error);
    },
  });

  return { ...mutation };
}
