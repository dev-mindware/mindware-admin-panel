import { api } from "@/services/api";
import type {
  Activity,
  ActivityDetail,
  ActivityEventItem,
  ActivityList,
  ActivityListParams,
  ActivityPayload,
  MoveActivityPayload,
  UpdateActivityPayload,
  ActivityComment,
} from "@/types/activity";

export const activitiesService = {
  list: async (params?: ActivityListParams): Promise<ActivityList> => {
    const { status, ...rest } = params ?? {};
    const { data } = await api.get("/activities", {
      params: { ...rest, ...(status?.length ? { status: status.join(",") } : {}) },
    });
    return data;
  },

  getById: async (id: string): Promise<ActivityDetail> => {
    const { data } = await api.get(`/activities/${id}`);
    return data;
  },

  events: async (id: string): Promise<ActivityEventItem[]> => {
    const { data } = await api.get(`/activities/${id}/events`);
    return data;
  },

  create: async (payload: ActivityPayload): Promise<Activity> => {
    const { data } = await api.post("/activities", payload);
    return data;
  },

  update: async (id: string, payload: UpdateActivityPayload): Promise<Activity> => {
    const { data } = await api.patch(`/activities/${id}`, payload);
    return data;
  },

  move: async (id: string, payload: MoveActivityPayload): Promise<Activity> => {
    const { data } = await api.patch(`/activities/${id}/move`, payload);
    return data;
  },

  comment: async (id: string, body: string): Promise<ActivityComment> => {
    const { data } = await api.post(`/activities/${id}/comments`, { body });
    return data;
  },

  remove: async (id: string): Promise<void> => {
    await api.delete(`/activities/${id}`);
  },
};
