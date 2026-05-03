"use client";


const initialState = {
  success: false,
  message: "",
  redirect: "",
  token: "",
};

type Step = "register" | "verify";

export default function RegisterPage() {
  const [state, formAction, pending] = useActionState(registerUser, initialState);
  const [verifyState, verifyAction, verifyPending] =
  useActionState(verifyOtp, initialState);
  const [step, setStep] = useState<Step>("register");
  const router = useRouter();
  const [token, setToken] = useState("");



  useEffect(() => {
    if (state.redirect) {
      router.push(state.redirect);
    }
    if(state.success){
      setToken((state as any).token);
      setStep("verify");
    }
  }, [state, router]);

  return (
    <div className="min-h-screen bg-amber-950 flex flex-col items-center justify-center px-4 py-12 transition-colors duration-300">

      {/* ── Logo / Brand ── */}
      <div className="mb-8 flex flex-col items-center gap-2">
        <div className="w-10 h-10 rounded-xl bg-(--color-accent) flex items-center justify-center shadow-md">
          <ChecklistIcon />
        </div>
        <span className="text-(--color-text-primary) text-lg font-semibold tracking-tight">
          TaskFlow
        </span>
      </div>

      {/* ── Card ── */}
      <div className="w-full max-w-sm rounded-2xl border border-(--color-border) bg-(--color-surface) shadow-sm p-8">

        {/* ── Step indicator ── */}
        <StepIndicator current={step} />

        {/* ── Step: Register ── */}
        {step === "register" && (
          <>
            <h1 className="mt-6 text-2xl font-semibold text-(--color-text-primary) tracking-tight">
              Create your account
            </h1>
            <p className="mt-1 text-sm text-(--color-text-muted)">
              Start managing tasks in seconds.
            </p>

            <form action={formAction} className="mt-6 flex flex-col gap-4">
              {/* First & Last name side-by-side */}
              <div className="grid grid-cols-2 gap-3">
                <Field id="firstName" name="firstName" label="First name" placeholder="Ada" />
                <Field id="secondName" name="secondName" label="Last name" placeholder="Lovelace" />
              </div>

              <Field id="email" name="email" type="email" label="Email" placeholder="ada@example.com" />
              <Field id="password" name="password" type="password" label="Password" placeholder="Min. 8 characters" />

              <StatusMessage state={state} />

              <button
                type="submit"
                disabled={pending}
                className="mt-1 w-full rounded-lg hover:bg-(--color-accent-hover) active:scale-[0.98] transition-all text-white font-medium py-2.5 text-sm disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {pending ? (
                  <span className="flex items-center justify-center gap-2">
                    <Spinner /> Creating account…
                  </span>
                ) : (
                  "Create account"
                )}
              </button>
            </form>
          </>
        )}

        {/* ── Step: Verify OTP ── */}
        {step === "verify" && (
          <>
            <h1 className="mt-6 text-2xl font-semibold text-(--color-text-primary) tracking-tight">
              Check your inbox
            </h1>
            <p className="mt-1 text-sm text-(--color-text-muted)">
              We sent a 6-digit code to your email address.
            </p>

            <form action={verifyAction} className="mt-6 flex flex-col gap-4">
              <Field
                id="otp"
                name="otp"
                label="Verification code"
                placeholder="123456"
                inputMode="numeric"
                // maxLength={6}
                // pattern="[0-9]{6}"
                onChange={(e) => {sendOtpToEmail(e.target.value)}}
              />
              <input type="hidden" name="token" value={token} />

              <StatusMessage state={state} />

              <button
                type="submit"
                disabled={pending}
                className="mt-1 w-full rounded-lg hover:bg-(--color-accent-hover) active:scale-[0.98] transition-all text-white font-medium py-2.5 text-sm disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {pending ? (
                  <span className="flex items-center justify-center gap-2">
                    <Spinner /> Verifying…
                  </span>
                ) : (
                  "Verify email"
                )}
              </button>

              <button
                type="button"
                onClick={() => setStep("register")}
                className="text-xs text-center text-(--color-text-muted) hover:text-(--color-text-primary) transition-colors"
              >
                ← Back to registration
              </button>
            </form>
          </>
        )}
      </div>

      {/* ── Footer link ── */}
      <p className="mt-6 text-sm text-(--color-text-muted)">
        Already have an account?{" "}
        <a
          href="/auth/login"
          className="font-medium text-(--color-accent) hover:underline"
        >
          Log in
        </a>
      </p>


    </div>
  );
}
import { useActionState, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { registerUser } from "../actions";

import { Field } from "../shared/ui/field";
import { StatusMessage } from "../shared/ui/statusmessage";
import { StepIndicator } from "../shared/ui/stepIndictor";
import { Spinner } from "../shared/ui/spinner";
import { ChecklistIcon } from "@/app/features/icon/checkListIcon";

import { sendOtpToEmail } from "../otp_utils";
import { verifyOtp } from "../actions";