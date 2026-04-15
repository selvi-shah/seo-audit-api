export class AuditService {
  async auditUrl(url: string) {
    console.log("URL received:", url);

    return {
      success: true,
      url,
    };
  }
}