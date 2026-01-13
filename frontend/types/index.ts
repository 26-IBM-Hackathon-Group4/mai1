// 1. 공통 응답 래퍼 (CommonResponse)
export interface APIResponse<T> {
  status: string;
  message: string;
  data: T;
}

// 2. 이메일 데이터 (Email)
export interface EmailItem {
  id: number;          // DB의 email_id
  subject: string;
  sender: string;
  received_at: string; // ISO Date string
  classification?: "REGISTER" | "OTHER" | null;
}

// 3. 서비스 데이터 (UserServiceResponse)
export interface ServiceItem {
  user_service_id: number;
  service_id: number;
  service_name: string;
  domain: string | null;
  risk_level: "A" | "B" | "C" | null; // 보안 등급
  subscription_date: string | null;
  evidence_email_id: number | null;
}

// 4. API별 응답 데이터 구조

// GET /users/me/services
export interface ServiceListResponse {
  total_count: number;
  services: ServiceItem[];
}

// GET /emails
export interface EmailListResponse {
  total_count: number;
  emails: EmailItem[];
}

// POST /emails/sync
export interface SyncResponse {
  synced_count: number;
}

// POST /ai/classify-emails
export interface ClassifyResult {
  id: number;
  classification: string;
}

export interface ClassifyResponse {
  results: ClassifyResult[];
  failed_ids: number[];
}