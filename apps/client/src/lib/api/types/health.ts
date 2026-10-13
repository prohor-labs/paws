export interface HealthResponse {
  status: "ok";
  uptime: number;
  onlineUsers?: number;
  totalUsers?: number;
  totalQuestions?: number;
  timestamp: string;
}
