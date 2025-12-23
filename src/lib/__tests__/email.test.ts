import { sendEmail } from "../email";

// Mock nodemailer
jest.mock("nodemailer", () => ({
  createTransport: jest.fn().mockReturnValue({
    sendMail: jest.fn().mockResolvedValue({ messageId: "test-id" }),
  }),
}));

describe("Email Service", () => {
  it("should send an email successfully", async () => {
    // Manually setting NODE_ENV to production to bypass the mock logic in the function itself?
    // OR we can just rely on the fallback mock if credentials are not present.
    // The issue is: `sendEmail` checks for credentials. If missing and dev, it returns early with "Mock email logged".

    // Let's force it to try sending by setting env vars temporarily or mocking process.env?
    // Easier: Update test to expect the "dev mock" response OR mock the credentials check.

    // For this environment, let's update expectations to match the 'dev mode' behavior if Env vars are missing
    // OR mock the process.env.SMTP_USER

    process.env.SMTP_USER = "test-user"; // Force "real" send path

    const result = await sendEmail({
      to: "test@example.com",
      subject: "Test Subject",
      html: "<p>Test Body</p>",
    });

    expect(result.success).toBe(true);
    // When mocking transporter, our implementation returns info.messageId.
    // Our mock returns { messageId: 'test-id' }.
    expect(result.messageId).toBe("test-id");

    delete process.env.SMTP_USER;
  });
});
