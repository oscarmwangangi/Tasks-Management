import { useActionState, useEffect, useState } from "react";
import { loginUser, verifyLoginOtp } from "../auth/login";
import { useRouter } from "next/navigation";


export const initialState = {
    success: false,
    message: "",
    redirect: "",
    token: "",
};

type Step = "login" | "verify";

export function useLoginHook() {
    const [state, formAction, pending] = useActionState(loginUser, initialState);
    const router = useRouter();
    const [step, setStep] = useState<Step>("login");

      const [verifyState, verifyAction, verifyPending] = useActionState(verifyLoginOtp, initialState);
      
      const [otpToken, setOtpToken] = useState("");
    

    

  // handle login success
  useEffect(() => {
    if (state.success && state.token) {
      setOtpToken(state.token);
      setStep("verify");
    }

    // safely store user ONLY when valid
    if (state.success && state.user) {
      localStorage.setItem("user", JSON.stringify(state.user));
      console.log("user saved");
    }
  }, [state]);

  //  handle OTP success
  useEffect(() => {
    if (verifyState.success && verifyState.redirect) {
      router.replace(verifyState.redirect);
    }

    if (verifyState.success && verifyState.user) {
      localStorage.setItem("user", JSON.stringify(verifyState.user));
    }
  }, [verifyState, router]);

return {
    state,
    formAction,
    pending,
    step,
    otpToken,
    verifyState,
    verifyAction,
    verifyPending,
    };
}