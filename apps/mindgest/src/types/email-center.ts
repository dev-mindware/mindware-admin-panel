// ===== Email Center Types =====

export type CampaignType = "BILLING" | "MARKETING" | "PUBLICITY";
export type CampaignStatus =
  | "DRAFT"
  | "SCHEDULED"
  | "SENDING"
  | "SENT"
  | "CANCELLED"
  | "FAILED";
export type EmailLogStatus =
  | "QUEUED"
  | "SENT"
  | "DELIVERED"
  | "OPENED"
  | "CLICKED"
  | "BOUNCED"
  | "FAILED";
export type TemplateCategory = "BILLING" | "MARKETING";

export interface EmailCampaign {
  id: string;
  name: string;
  subject: string;
  preheader?: string;
  type: CampaignType;
  status: CampaignStatus;
  scheduledAt?: string;
  sentAt?: string;
  segmentFilters?: SegmentFilters;
  content?: Record<string, any>;
  templateId?: string;
  totalRecipients: number;
  totalSent: number;
  totalDelivered: number;
  totalOpened: number;
  totalClicked: number;
  totalConversions: number;
  totalBounces: number;
  recoveredRevenue: number;
  createdById?: string;
  createdAt: string;
  updatedAt: string;
  template?: EmailTemplate | null;
}

export interface SegmentFilters {
  subscriptionStatus?: string[];
  planIds?: string[];
  clientTypes?: string[];
  activityFilter?: "recent_active" | "inactive" | "no_login_recent";
}

export interface EmailTemplate {
  id: string;
  name: string;
  category: TemplateCategory;
  subject: string;
  preheader?: string;
  content?: Record<string, any>;
  isSystemDefault: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface EmailLog {
  id: string;
  campaignId?: string;
  companyId?: string;
  recipientEmail: string;
  recipientName?: string;
  type: string;
  status: EmailLogStatus;
  openedAt?: string;
  clickedAt?: string;
  convertedAt?: string;
  recoveredAmount?: number;
  errorMessage?: string;
  createdAt: string;
  campaign?: { name: string; type: CampaignType } | null;
}

export interface EmailDashboardKpis {
  totalSent: number;
  openRate: number;
  clickRate: number;
  recoveredRevenue: number;
}

export interface SubscriptionBreakdown {
  active: number;
  expiring: number;
  expired: number;
  pastDue: number;
  suspended: number;
}

export interface EmailDashboardIndicators {
  activeCampaigns: number;
  scheduledCampaigns: number;
  recoveredClients: number;
}

export interface EmailDashboardResponse {
  kpis: EmailDashboardKpis;
  subscriptionBreakdown: SubscriptionBreakdown;
  indicators: EmailDashboardIndicators;
}

export interface CampaignAnalyticsMetrics {
  totalSent: number;
  delivered: number;
  opened: number;
  clicked: number;
  converted: number;
  bounces: number;
  openRate: string;
  clickRate: string;
  conversionRate: string;
  recoveredRevenue: number;
}

export interface CampaignAnalyticsResponse {
  campaignId: string;
  name: string;
  type: CampaignType;
  status: CampaignStatus;
  metrics: CampaignAnalyticsMetrics;
}

export interface CreateCampaignPayload {
  name: string;
  subject: string;
  preheader?: string;
  type: CampaignType;
  segmentFilters?: SegmentFilters;
  content?: Record<string, any>;
  templateId?: string;
  scheduledAt?: string;
  ctaText?: string;
  ctaUrl?: string;
}

export interface SendTestEmailPayload {
  toEmail: string;
  subject: string;
  preheader?: string;
  contentHtml: string;
  ctaText?: string;
  ctaUrl?: string;
}
