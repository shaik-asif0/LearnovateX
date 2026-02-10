import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "../lib/axios";
import { toast } from "sonner";
import { Button } from "../components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { useI18n } from "../i18n/I18nProvider";

const isValidOtp = (value) => /^\d{6}$/.test((value || "").trim());

const validatePassword = (value) => {
  const password = value || "";
  if (password.length < 8) return "Password must be at least 8 characters";
  if (!/[A-Z]/.test(password))
    return "Password must include at least 1 uppercase letter";
  if (!/\d/.test(password)) return "Password must include at least 1 number";
  if (!/[^A-Za-z0-9]/.test(password))
    return "Password must include at least 1 special character";
  return null;
};

const ForgotPasswordPage = () => {
  const navigate = useNavigate();
  const { t } = useI18n();

  const passwordPolicyHelp = t(
    "auth.passwordPolicy",
    "Min 8 chars, 1 uppercase, 1 number, 1 special character"
  );

  const validatePasswordWithTranslation = (value) => {
    const password = value || "";
    if (password.length < 8)
      return t(
        "auth.validation.passwordMinLength",
        "Password must be at least 8 characters"
      );
    if (!/[A-Z]/.test(password))
      return t(
        "auth.validation.passwordUppercase",
        "Password must include at least 1 uppercase letter"
      );
    if (!/\d/.test(password))
      return t(
        "auth.validation.passwordNumber",
        "Password must include at least 1 number"
      );
    if (!/[^A-Za-z0-9]/.test(password))
      return t(
        "auth.validation.passwordSpecial",
        "Password must include at least 1 special character"
      );
    return null;
  };

  const [step, setStep] = useState("email"); // email | otp | reset
  const [loading, setLoading] = useState(false);

  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const passwordError = useMemo(
    () => validatePasswordWithTranslation(newPassword),
    [newPassword]
  );

  const submitEmail = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await axios.post("/auth/forgot-password", { email });
      toast.success(
        res.data?.message ||
          t(
            "auth.forgotPassword.otpSent",
            "If the email is registered, an OTP has been sent."
          )
      );

      const debugOtp = res.data?.debug_otp;
      if (debugOtp) {
        setOtp(String(debugOtp));
        toast.message(t("auth.forgotPassword.debugOtp", "Debug OTP"), {
          description: String(debugOtp),
        });
      }
      setStep("otp");
    } catch (err) {
      const msg =
        err?.response?.data?.detail ||
        err?.message ||
        t("auth.forgotPassword.requestFailed", "Request failed");
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const submitOtp = async (e) => {
    e.preventDefault();
    const trimmed = (otp || "").trim();
    if (!isValidOtp(trimmed)) {
      toast.error(t("auth.forgotPassword.invalidOtp", "Enter the 6-digit OTP"));
      return;
    }

    setLoading(true);
    try {
      await axios.post("/auth/verify-otp", { email, otp: trimmed });
      toast.success(t("auth.forgotPassword.otpVerified", "OTP verified"));
      setStep("reset");
    } catch (err) {
      const msg =
        err?.response?.data?.detail ||
        err?.message ||
        t("auth.forgotPassword.verificationFailed", "Verification failed");
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const submitReset = async (e) => {
    e.preventDefault();

    const trimmedOtp = (otp || "").trim();
    if (!isValidOtp(trimmedOtp)) {
      toast.error(t("auth.forgotPassword.invalidOtp", "Enter the 6-digit OTP"));
      return;
    }

    if (passwordError) {
      toast.error(passwordError);
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error(
        t("auth.validation.passwordsMismatch", "Passwords do not match")
      );
      return;
    }

    setLoading(true);
    try {
      const res = await axios.post("/auth/reset-password", {
        email,
        otp: trimmedOtp,
        new_password: newPassword,
      });
      toast.success(
        res.data?.message ||
          t(
            "auth.forgotPassword.passwordUpdated",
            "Password updated successfully"
          )
      );
      navigate("/auth");
    } catch (err) {
      const msg =
        err?.response?.data?.detail ||
        err?.message ||
        t("auth.forgotPassword.resetFailed", "Reset failed");
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const goBackToLogin = () => navigate("/auth");

  return (
    <div className="min-h-screen flex items-center justify-center bg-black p-6">
      <Card className="w-full max-w-md bg-zinc-900 border-zinc-800">
        <CardHeader className="text-center pb-4">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-r from-orange-500 to-orange-600 flex items-center justify-center shadow-lg overflow-hidden">
            <img
              src="/logo.png"
              alt="LearnovateX Logo"
              className="w-full h-full object-cover"
            />
          </div>
          <CardTitle className="text-2xl font-bold text-white">
            {t("auth.forgotPassword.title", "Reset Password")}
          </CardTitle>
          <CardDescription className="text-zinc-400">
            {step === "email" &&
              t(
                "auth.forgotPassword.step.email",
                "Enter your registered email to receive an OTP"
              )}
            {step === "otp" &&
              t(
                "auth.forgotPassword.step.otp",
                "Enter the 6-digit OTP sent to your email"
              )}
            {step === "reset" &&
              t("auth.forgotPassword.step.reset", "Create a new password")}
          </CardDescription>
        </CardHeader>

        <CardContent>
          {step === "email" && (
            <form onSubmit={submitEmail} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="fp-email" className="text-zinc-300">
                  {t("auth.label.email", "Email")}
                </Label>
                <Input
                  id="fp-email"
                  type="email"
                  placeholder={t("auth.placeholder.email", "your@email.com")}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500"
                />
              </div>
              <Button
                type="submit"
                className="w-full rounded-full font-semibold bg-white text-black hover:bg-zinc-200"
                disabled={loading}
              >
                {loading
                  ? t("auth.forgotPassword.sending", "Sending...")
                  : t("auth.forgotPassword.sendOtp", "Send OTP")}
              </Button>
              <Button
                type="button"
                variant="ghost"
                className="w-full text-zinc-300 hover:text-white"
                onClick={goBackToLogin}
              >
                {t("auth.backToLogin", "Back to Login")}
              </Button>
            </form>
          )}

          {step === "otp" && (
            <form onSubmit={submitOtp} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="fp-otp" className="text-zinc-300">
                  {t("auth.forgotPassword.otpLabel", "OTP")}
                </Label>
                <Input
                  id="fp-otp"
                  inputMode="numeric"
                  placeholder={t(
                    "auth.forgotPassword.otpPlaceholder",
                    "6-digit code"
                  )}
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  required
                  className="bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500"
                />
              </div>
              <Button
                type="submit"
                className="w-full rounded-full font-semibold bg-white text-black hover:bg-zinc-200"
                disabled={loading}
              >
                {loading
                  ? t("auth.forgotPassword.verifying", "Verifying...")
                  : t("auth.forgotPassword.verifyOtp", "Verify OTP")}
              </Button>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="ghost"
                  className="w-full text-zinc-300 hover:text-white"
                  onClick={() => setStep("email")}
                  disabled={loading}
                >
                  {t("auth.forgotPassword.changeEmail", "Change Email")}
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  className="w-full text-zinc-300 hover:text-white"
                  onClick={goBackToLogin}
                  disabled={loading}
                >
                  {t("auth.backToLogin", "Back to Login")}
                </Button>
              </div>
            </form>
          )}

          {step === "reset" && (
            <form onSubmit={submitReset} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="fp-new" className="text-zinc-300">
                  {t("auth.forgotPassword.newPassword", "New Password")}
                </Label>
                <Input
                  id="fp-new"
                  type="password"
                  placeholder="••••••••"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  className="bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500"
                />
                <p className="text-xs text-zinc-500">{passwordPolicyHelp}</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="fp-confirm" className="text-zinc-300">
                  {t("auth.forgotPassword.confirmPassword", "Confirm Password")}
                </Label>
                <Input
                  id="fp-confirm"
                  type="password"
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  className="bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500"
                />
              </div>

              <Button
                type="submit"
                className="w-full rounded-full font-semibold bg-white text-black hover:bg-zinc-200"
                disabled={loading}
              >
                {loading
                  ? t("auth.forgotPassword.updating", "Updating...")
                  : t("auth.forgotPassword.updatePassword", "Update Password")}
              </Button>
              <Button
                type="button"
                variant="ghost"
                className="w-full text-zinc-300 hover:text-white"
                onClick={goBackToLogin}
                disabled={loading}
              >
                {t("auth.backToLogin", "Back to Login")}
              </Button>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ForgotPasswordPage;
