export const SITE = {
  home: "https://internal.iti.gov.eg/home",
  origin: "https://internal.iti.gov.eg",
  identity: "https://identity.iti.gov.eg",
  logout: "https://identity.iti.gov.eg/Account/Logout",
  support: "https://ititic.zohodesk.com/portal/en/newticket",
} as const;

/**
 * Known ITI hosts. Kept for reference; isItiUrl accepts any *.iti.gov.eg
 * subdomain so new portals do not get kicked out to the external browser.
 */
export const ALLOWED_HOSTS = [
  "internal.iti.gov.eg",
  "identity.iti.gov.eg",
  "igateway.iti.gov.eg",
  "rgateway.iti.gov.eg",
] as const;

/** Only these API responses are forwarded to the native layer. */
export const CAPTURABLE_API =
  /igateway\.iti\.gov\.eg\/OldApi(Public)?\/(Applicant|ApplicantActionBatch|ApplicantActionBatchAction|ApplicantActionCriteria|ApplicantPreference|ApplicantContentType|Examinations|Interview)\//i;

export function isItiHost(hostname: string): boolean {
  const host = hostname.toLowerCase();
  return host === "iti.gov.eg" || host.endsWith(".iti.gov.eg");
}

/** True when the URL should stay inside the embedded browser. */
export function isItiUrl(url: string): boolean {
  if (
    url === "about:blank" ||
    url.startsWith("about:") ||
    url.startsWith("data:") ||
    url.startsWith("blob:")
  ) {
    return true;
  }
  try {
    const parsed = new URL(url);
    if (parsed.protocol !== "https:" && parsed.protocol !== "http:")
      return false;
    return isItiHost(parsed.hostname);
  } catch {
    return false;
  }
}

export function isCapturableUrl(url: string): boolean {
  return CAPTURABLE_API.test(url);
}

/**
 * Support links shown on Home and in Settings.
 *
 * Paste the full URL between the quotes and the matching button appears
 * automatically. Leave a value as `''` to hide that button. No code changes
 * are needed anywhere else.
 *
 * Examples:
 *   kofiUrl: 'https://ko-fi.com/your-name'
 *   bmcUrl: 'https://buymeacoffee.com/your-name'
 */
export const SUPPORT: { kofiUrl: string; bmcUrl: string } = {
  kofiUrl: "https://ko-fi.com/F6P229ORJB",
  bmcUrl: "https://ipn.eg/S/y0ung-phara0h/instapay/7AGv6e",
};
