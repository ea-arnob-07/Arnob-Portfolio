export const ARNOB_EMAIL = "eaarnob178@gmail.com";

export const ARNOB_LINKEDIN_URL =
  "https://www.linkedin.com/in/estiuk-arafat-arnob-0350ba34a";

export const OPPORTUNITY_SUBJECT =
  "We’d Like to Discuss an Opportunity.";

type GmailComposeOptions = {
  to: string;
  subject?: string;
  body?: string;
};

export function createGmailComposeUrl({
  to,
  subject = OPPORTUNITY_SUBJECT,
  body,
}: GmailComposeOptions) {
  const query = new URLSearchParams({
    view: "cm",
    fs: "1",
    to,
    su: subject,
  });

  if (body) {
    query.set("body", body);
  }

  return `https://mail.google.com/mail/?${query.toString()}`;
}
