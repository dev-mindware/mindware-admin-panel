import api from "./api";

export interface ExecutiveMetrics {
  mrr: number;
  arr: number;
  arpu: number;
  activationRate: number;
  churnRate: number;
  activeSubscriptions: number;
  totalCompanies: number;
}

export interface ProductAnalyticsData {
  activeUsers: {
    dau: number;
    wau: number;
    mau: number;
  };
  onboardingFunnel: {
    step: string;
    count: number;
  }[];
  featureUsage: {
    feature: string;
    usageCount: number;
  }[];
}

export interface MarketingAnalyticsData {
  affiliateStats: {
    affiliateId: string;
    clicks: number;
    conversions: number;
    totalRevenue: number;
    conversionRate: number;
  }[];
  campaignStats: {
    campaign: string;
    source: string;
    clicks: number;
    leads: number;
    totalRevenue: number;
  }[];
}

export interface HealthScoreItem {
  id: string;
  companyId: string;
  companyName: string;

  score: number;
  status: 'VERY_HEALTHY' | 'HEALTHY' | 'ATTENTION' | 'AT_RISK' | 'HIGH_RISK';
  factors: {
    recentLogin: boolean;
    invoicesIssued30d: number;
    itemsCreatedCount: number;
    subscriptionStatus: string;
    daysInactive: number;
  };
}

export interface SystemAlertItem {
  id: string;
  timestamp: string;
  title: string;
  message: string;
  severity: 'INFO' | 'WARNING' | 'CRITICAL';
  category: string;
  companyId?: string;
  isRead: boolean;
  company?: { id: string; name: string };
}

export interface ApplicationLogItem {
  id: string;
  timestamp: string;
  level: "DEBUG" | "INFO" | "WARN" | "ERROR" | "FATAL";
  service: string;
  environment: string;
  requestId?: string;
  traceId?: string;
  userId?: string;
  companyId?: string;
  route?: string;
  method?: string;
  statusCode?: number;
  durationMs?: number;
  errorCode?: string;
  message: string;
  stackTrace?: string;
  metadata?: Record<string, any>;
}

export interface AuditTrailItem {
  id: string;
  action: string;
  entity: string;
  entityId: string;
  userId: string;
  companyId: string;
  oldValues?: any;
  newValues?: any;
  ipAddress?: string;
  userAgent?: string;
  createdAt: string;
  user?: { name?: string; email?: string };
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface TrendAnalyticsItem {
  month: string;
  mrr: number;
  registrations: number;
  activations: number;
}

export const analyticsService = {
  getExecutiveMetrics: async (timeRange?: string): Promise<ExecutiveMetrics> => {
    const params = timeRange && timeRange !== "all" ? `?timeRange=${timeRange}` : "";
    const res = await api.get(`/analytics/executive${params}`);
    return res.data;
  },

  getTrendAnalytics: async (): Promise<TrendAnalyticsItem[]> => {
    const res = await api.get("/analytics/trend");
    return res.data;
  },


  getProductAnalytics: async (): Promise<ProductAnalyticsData> => {
    const res = await api.get("/analytics/product");
    return res.data;
  },

  getMarketingAnalytics: async (): Promise<MarketingAnalyticsData> => {
    const res = await api.get("/analytics/marketing");
    return res.data;
  },

  getHealthScores: async (
    page = 1,
    limit = 10,
    status?: string,
    search?: string
  ): Promise<PaginatedResponse<HealthScoreItem>> => {
    const params = new URLSearchParams();
    params.append("page", String(page));
    params.append("limit", String(limit));
    if (status && status !== "ALL") params.append("status", status);
    if (search) params.append("search", search);
    const res = await api.get(`/analytics/health-scores?${params.toString()}`);
    return res.data;
  },

  getSystemAlerts: async (unreadOnly = false): Promise<SystemAlertItem[]> => {
    const res = await api.get(`/analytics/system-alerts?unreadOnly=${unreadOnly}`);
    return res.data;
  },

  markAlertRead: async (id: string): Promise<void> => {
    await api.patch(`/analytics/system-alerts/${id}/read`);
  },

  getApplicationLogs: async (
    page = 1,
    limit = 10,
    level?: string,
    search?: string
  ): Promise<PaginatedResponse<ApplicationLogItem>> => {
    const params = new URLSearchParams();
    params.append("page", String(page));
    params.append("limit", String(limit));
    if (level && level !== "ALL") params.append("level", level);
    if (search) params.append("search", search);
    const res = await api.get(`/analytics/application-logs?${params.toString()}`);
    return res.data;
  },

  getAuditTrails: async (
    page = 1,
    limit = 10,
    entity?: string,
    action?: string,
    search?: string
  ): Promise<PaginatedResponse<AuditTrailItem>> => {
    const params = new URLSearchParams();
    params.append("page", String(page));
    params.append("limit", String(limit));
    if (entity && entity !== "ALL") params.append("entity", entity);
    if (action && action !== "ALL") params.append("action", action);
    if (search) params.append("search", search);
    const res = await api.get(`/audit-trails?${params.toString()}`);
    return res.data;
  },
};


