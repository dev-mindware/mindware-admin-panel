import { api } from "./api";
import { Client } from "./clients-service";
import { Clause } from "./clauses-service";

export interface Template {
  id: string;
  name: string;
  description?: string;
  type: "HTML" | "DOCX";
  templatePath: string;
}

export interface PriceItem {
  id?: string;
  phaseName: string;
  days: number;
  deliverable: string;
  valueKz: number;
  order?: number;
}

export interface PaymentMilestone {
  id?: string;
  name: string;
  percentage: number;
  calculatedKz: number;
  order?: number;
}

export interface DocumentSnapshot {
  id: string;
  version: number;
  pdfS3Key?: string | null;
  docxS3Key?: string | null;
  fileSize?: number | null;
  createdAt: string;
}

export interface DocumentItem {
  id: string;
  code: string;
  title: string;
  clientId: string;
  templateId: string;
  status: "DRAFT" | "GENERATING" | "GENERATED" | "FAILED" | "ARCHIVED";
  validityDays: number;
  deliveryDays: number;
  notes?: string | null;
  createdAt: string;
  updatedAt: string;
  client: Client;
  template: Template;
  clauses?: Array<{ clause: Clause; customText?: string }>;
  priceItems?: PriceItem[];
  milestones?: PaymentMilestone[];
  snapshots?: DocumentSnapshot[];
}

export interface CreateDocumentPayload {
  code: string;
  title: string;
  clientId?: string;
  clientName?: string;
  clientNif?: string;
  templateId: string;
  validityDays?: number;
  deliveryDays?: number;
  notes?: string;
  clauseIds?: string[];
  priceItems?: PriceItem[];
  milestones?: PaymentMilestone[];
}

export interface TriggerGenerationResponse {
  message: string;
  jobId: string;
  documentId: string;
  status: string;
}

export interface JobStatusResponse {
  jobId: string;
  status: "PENDING" | "PROCESSING" | "COMPLETED" | "FAILED";
  startedAt?: string | null;
  completedAt?: string | null;
  errorLog?: string | null;
  downloadUrl?: string | null;
}

import { PaginatedResult, PaginationParams } from "@/types/pagination";

export interface DocumentFilterParams extends PaginationParams {
  type?: string;
  status?: string;
}

export const documentsService = {
  async getDocuments(params?: DocumentFilterParams): Promise<PaginatedResult<DocumentItem>> {
    try {
      const response = await api.get<any>("/documents", {
        params,
      });
      const res = response.data;
      if (Array.isArray(res)) {
        return {
          data: res,
          meta: {
            total: res.length,
            page: 1,
            limit: res.length,
            totalPages: 1,
            hasNextPage: false,
            hasPreviousPage: false,
          },
          total: res.length,
          page: 1,
          limit: res.length,
          totalPages: 1,
        };
      }
      return {
        data: Array.isArray(res?.data) ? res.data : [],
        meta: res?.meta || {
          total: res?.total || 0,
          page: res?.page || 1,
          limit: res?.limit || 10,
          totalPages: res?.totalPages || 1,
          hasNextPage: false,
          hasPreviousPage: false,
        },
        total: res?.total ?? res?.meta?.total ?? 0,
        page: res?.page ?? res?.meta?.page ?? 1,
        limit: res?.limit ?? res?.meta?.limit ?? 10,
        totalPages: res?.totalPages ?? res?.meta?.totalPages ?? 1,
      };
    } catch {
      return {
        data: [],
        meta: {
          total: 0,
          page: 1,
          limit: 10,
          totalPages: 1,
          hasNextPage: false,
          hasPreviousPage: false,
        },
        total: 0,
        page: 1,
        limit: 10,
        totalPages: 1,
      };
    }
  },

  async getDocumentById(id: string): Promise<DocumentItem> {
    const response = await api.get<DocumentItem>(`/documents/${id}`);
    return response.data;
  },

  async createDocument(data: CreateDocumentPayload): Promise<DocumentItem> {
    const response = await api.post<DocumentItem>("/documents", data);
    return response.data;
  },

  async updateDocument(id: string, data: Partial<CreateDocumentPayload>): Promise<DocumentItem> {
    const response = await api.patch<DocumentItem>(`/documents/${id}`, data);
    return response.data;
  },

  async deleteDocument(id: string): Promise<{ success: boolean; message: string }> {
    const response = await api.delete<{ success: boolean; message: string }>(`/documents/${id}`);
    return response.data;
  },

  async getTemplates(): Promise<Template[]> {
    const response = await api.get<Template[]>("/templates");
    return response.data;
  },

  async triggerGeneration(documentId: string): Promise<TriggerGenerationResponse> {
    const response = await api.post<TriggerGenerationResponse>(`/documents/${documentId}/generate`);
    return response.data;
  },

  async getJobStatus(jobId: string): Promise<JobStatusResponse> {
    const response = await api.get<JobStatusResponse>(`/documents/jobs/${jobId}`);
    return response.data;
  },

  getPreviewHtmlUrl(documentId: string): string {
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";
    const apiKey = process.env.NEXT_PUBLIC_API_KEY;
    const query = apiKey ? `?apiKey=${encodeURIComponent(apiKey)}` : "";
    return `${baseUrl}/documents/${documentId}/preview-html${query}`;
  },

  getDirectPdfUrl(documentId: string): string {
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";
    const apiKey = process.env.NEXT_PUBLIC_API_KEY;
    const query = apiKey ? `?apiKey=${encodeURIComponent(apiKey)}` : "";
    return `${baseUrl}/documents/${documentId}/render-pdf${query}`;
  },

  getDownloadPdfUrl(documentId: string): string {
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";
    const apiKey = process.env.NEXT_PUBLIC_API_KEY;
    const query = apiKey ? `?apiKey=${encodeURIComponent(apiKey)}` : "";
    return `${baseUrl}/documents/${documentId}/download-pdf${query}`;
  },

  async renderLivePdfBlob(payload: any): Promise<Blob> {
    const response = await api.post("/documents/preview-live", payload, {
      responseType: "blob",
    });
    return response.data;
  },
};
