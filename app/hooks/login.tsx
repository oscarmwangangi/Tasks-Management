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
    

  useEffect(() => {
    if (state.success && state.token) {
      setOtpToken(state.token);
      setStep("verify");
    }

  }, [state]);


useEffect(() => {
  if (verifyState.success && verifyState.redirect) {
    console.log("Secure authentication cookie is set. Redirecting...");

    router.replace(verifyState.redirect); 
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