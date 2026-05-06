"use client";
import { StatusMessage } from "../shared/ui/statusmessage";
import { Field } from "../shared/ui/field";
import { Spinner } from "../shared/ui/spinner";
import { useLoginHook } from "@/app/hooks/login";


export default function LoginPage() {
    const { state, formAction, pending, step, otpToken, verifyState, verifyAction, verifyPending } = useLoginHook();


    return (
        <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center -mt-16">
            <h1 className="text-4xl font-bold mb-8 font-(family-name:--font-geist-sans text-[#333333]">
                Login
            </h1>

            {step === "login" && (
                
            
            <form action={formAction} className="bg-white p-6 rounded shadow-md w-full max-w-sm">
                {state.message && (
                    <div className={`mb-4 text-sm ${state.success ? "text-green-500" : "text-red-500"}`}>
                        {state.message}
                        </div>
                )}
                <div className="mb-4">
                        <Field id="email" name="email" type="email" label="Email" placeholder="ada@example.com" />
                </div>
                <div className="mb-4">
                    <Field id="password" name="password" type="password" label="Password" placeholder="Min. 8 characters" />
                        </div>
                        <button 
                        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline" type="submit"
                        disabled={pending}
                        
                        >
                           {pending ? (
                                <span className="flex items-center justify-center gap-2">
                                    <Spinner /> Logging in… </span>
                           ):(
                                "Login"
                           )
                        }
                        </button>
                        </form>

                       )}

                        {step === "verify" && (
                           
                       
                            <form action={verifyAction}>
                        <Field id="otp" name="otp" label="Verification code" placeholder="123456" inputMode="numeric" maxLength={6} pattern="[0-9]{6}"
                        />

                                <input type="hidden" name="token" value={otpToken} hidden />
                                  <StatusMessage state={verifyState} />

                                <button type="submit"
                                disabled={verifyPending}
                                className={`mt-1 w-full rounded-lg hover:bg-(--color-accent-hover) active:scale-[0.98] transition-all text-white font-medium py-2.5 text-sm disabled:opacity-60 disabled:cursor-not-allowed ${verifyPending ? "opacity-60 cursor-not-allowed" : "hover:bg-blue-600"}`}
                                >{
                                    verifyPending ? (
                                        <span className="flex items-center justify-center gap-2">
                                            <Spinner /> Verifying…
                                        </span>
                                    ) : (
                                        "Verify email"
                                    )
                                }
                                </button>
                                
                            </form>
                        )}
                        <span className="text-sm text-gray-600 mt-4">
                            Don't have an account? <a href="/auth/register" className="text-blue-500 hover:text-blue-700">Register here</a>
                        </span>
                        </div>
                        )
             }