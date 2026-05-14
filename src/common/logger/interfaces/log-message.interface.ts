export interface ILogMessage {
  level: string;
  message: string;
  context: string | null;
  statusCode: number | null;
  trace: string | null;
  createdAt: string;
  request: {
    ipAddress: string | null;
    host: string | null;
    fullUrl: string | null;
    path: string | null;
    httpMethod: string | null;
    protocol: string | null;
    userId: string | null;
  };
}
