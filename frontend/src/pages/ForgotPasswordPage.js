import React, { useMemo, useState, useEffect } from "react";
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
import {
  Mail,
  ArrowLeft,
  CheckCircle,
  AlertCircle,
  Loader2,
  KeyRound,
  Shield,
  Clock,
  Eye,
  EyeOff,
} from "lucide-react";

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
  const [focusedField, setFocusedField] = useState(null);
  const [countdown, setCountdown] = useState(0);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // Countdown timer for OTP resend
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const passwordError = useMemo(
    () => validatePasswordWithTranslation(newPassword),
    [newPassword]
  );

  const submitEmail = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await axios.post("/auth/forgot-password", { email });
      toast.success("OTP Sent! 📧", {
        description:
          res.data?.message || "Check your email for the verification code.",
      });

      const debugOtp = res.data?.debug_otp;
      if (debugOtp) {
        setOtp(String(debugOtp));
        toast.message("Debug OTP", {
          description: String(debugOtp),
        });
      }
      setStep("otp");
      setCountdown(60); // Start 60 second countdown
    } catch (err) {
      const msg =
        err?.response?.data?.detail ||
        err?.message ||
        t("auth.forgotPassword.requestFailed", "Request failed");
      toast.error("Request Failed", {
        description: msg,
        icon: <AlertCircle className="w-4 h-4" />,
      });
    } finally {
      setLoading(false);
    }
  };

  const submitOtp = async (e) => {
    e.preventDefault();
    const trimmed = (otp || "").trim();
    if (!isValidOtp(trimmed)) {
      toast.error("Invalid OTP", {
        description: "Please enter the 6-digit code sent to your email.",
        icon: <AlertCircle className="w-4 h-4" />,
      });
      return;
    }

    setLoading(true);
    try {
      await axios.post("/auth/verify-otp", { email, otp: trimmed });
      toast.success("OTP Verified! ✅", {
        description: "You can now set your new password.",
      });
      setStep("reset");
    } catch (err) {
      const msg =
        err?.response?.data?.detail ||
        err?.message ||
        t("auth.forgotPassword.verificationFailed", "Verification failed");
      toast.error("Verification Failed", {
        description: msg,
        icon: <AlertCircle className="w-4 h-4" />,
      });
    } finally {
      setLoading(false);
    }
  };

  const submitReset = async (e) => {
    e.preventDefault();

    const trimmedOtp = (otp || "").trim();
    if (!isValidOtp(trimmedOtp)) {
      toast.error("Invalid OTP", {
        description: "Please enter the 6-digit code.",
        icon: <AlertCircle className="w-4 h-4" />,
      });
      return;
    }

    if (passwordError) {
      toast.error("Weak Password", {
        description: passwordError,
        icon: <AlertCircle className="w-4 h-4" />,
      });
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error("Passwords Don't Match", {
        description: "Please make sure both passwords are identical.",
        icon: <AlertCircle className="w-4 h-4" />,
      });
      return;
    }

    setLoading(true);
    try {
      const res = await axios.post("/auth/reset-password", {
        email,
        otp: trimmedOtp,
        new_password: newPassword,
      });
      toast.success("Password Updated! 🎉", {
        description:
          res.data?.message || "Your password has been successfully reset.",
      });
      navigate("/auth");
    } catch (err) {
      const msg =
        err?.response?.data?.detail ||
        err?.message ||
        t("auth.forgotPassword.resetFailed", "Reset failed");
      toast.error("Reset Failed", {
        description: msg,
        icon: <AlertCircle className="w-4 h-4" />,
      });
    } finally {
      setLoading(false);
    }
  };

  const goBackToLogin = () => navigate("/auth");

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-orange-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse animation-delay-2000"></div>
        <div className="absolute top-40 left-40 w-80 h-80 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse animation-delay-4000"></div>
      </div>

      {/* Floating Particles */}
      <div className="absolute inset-0">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-white rounded-full opacity-20 animate-ping"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${2 + Math.random() * 2}s`,
            }}
          />
        ))}
      </div>

      <div className="w-full max-w-md relative z-10">
        <Card className="bg-black/40 backdrop-blur-xl border border-white/10 shadow-2xl">
          <CardHeader className="text-center pb-6">
            <CardTitle className="text-2xl font-bold text-white mb-2">
              {t("auth.forgotPassword.title", "Reset Password")}
            </CardTitle>
            <CardDescription className="text-zinc-400">
              {step === "email" && (
                <div className="flex items-center justify-center gap-2">
                  <Mail className="w-4 h-4" />
                  {t(
                    "auth.forgotPassword.step.email",
                    "Enter your registered email to receive an OTP"
                  )}
                </div>
              )}
              {step === "otp" && (
                <div className="flex items-center justify-center gap-2">
                  <KeyRound className="w-4 h-4" />
                  {t(
                    "auth.forgotPassword.step.otp",
                    "Enter the 6-digit OTP sent to your email"
                  )}
                </div>
              )}
              {step === "reset" && (
                <div className="flex items-center justify-center gap-2">
                  <Shield className="w-4 h-4" />
                  {t("auth.forgotPassword.step.reset", "Create a new password")}
                </div>
              )}
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            {step === "email" && (
              <form onSubmit={submitEmail} className="space-y-4">
                <div className="space-y-2">
                  <Label
                    htmlFor="fp-email"
                    className="text-zinc-300 flex items-center gap-2"
                  >
                    <Mail className="w-4 h-4" />
                    {t("auth.label.email", "Email")}
                  </Label>
                  <Input
                    id="fp-email"
                    type="email"
                    placeholder={t("auth.placeholder.email", "your@email.com")}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    onFocus={() => setFocusedField("email")}
                    onBlur={() => setFocusedField(null)}
                    required
                    className={`bg-black/20 border-white/10 text-white placeholder:text-zinc-500 transition-all duration-200 ${
                      focusedField === "email"
                        ? "border-orange-500 shadow-lg shadow-orange-500/20"
                        : ""
                    }`}
                  />
                </div>
                <Button
                  type="submit"
                  className="w-full rounded-full font-semibold bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      {t("auth.forgotPassword.sending", "Sending...")}
                    </>
                  ) : (
                    <>
                      <Mail className="w-4 h-4 mr-2" />
                      {t("auth.forgotPassword.sendOtp", "Send OTP")}
                    </>
                  )}
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  className="w-full text-zinc-300 hover:text-white hover:bg-white/10 rounded-full transition-all duration-200"
                  onClick={goBackToLogin}
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  {t("auth.backToLogin", "Back to Login")}
                </Button>
              </form>
            )}

            {step === "otp" && (
              <form onSubmit={submitOtp} className="space-y-4">
                <div className="space-y-2">
                  <Label
                    htmlFor="fp-otp"
                    className="text-zinc-300 flex items-center gap-2"
                  >
                    <KeyRound className="w-4 h-4" />
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
                    onFocus={() => setFocusedField("otp")}
                    onBlur={() => setFocusedField(null)}
                    required
                    className={`bg-black/20 border-white/10 text-white placeholder:text-zinc-500 transition-all duration-200 ${
                      focusedField === "otp"
                        ? "border-orange-500 shadow-lg shadow-orange-500/20"
                        : ""
                    }`}
                  />
                  {countdown > 0 && (
                    <p className="text-xs text-zinc-500 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      Resend in {countdown}s
                    </p>
                  )}
                </div>
                <Button
                  type="submit"
                  className="w-full rounded-full font-semibold bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      {t("auth.forgotPassword.verifying", "Verifying...")}
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-4 h-4 mr-2" />
                      {t("auth.forgotPassword.verifyOtp", "Verify OTP")}
                    </>
                  )}
                </Button>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="ghost"
                    className="flex-1 text-zinc-300 hover:text-white hover:bg-white/10 rounded-full transition-all duration-200"
                    onClick={() => setStep("email")}
                    disabled={loading}
                  >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    {t("auth.forgotPassword.changeEmail", "Change Email")}
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    className="flex-1 text-zinc-300 hover:text-white hover:bg-white/10 rounded-full transition-all duration-200"
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
                  <Label
                    htmlFor="fp-new"
                    className="text-zinc-300 flex items-center gap-2"
                  >
                    <Shield className="w-4 h-4" />
                    {t("auth.forgotPassword.newPassword", "New Password")}
                  </Label>
                  <div className="relative">
                    <Input
                      id="fp-new"
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      onFocus={() => setFocusedField("newPassword")}
                      onBlur={() => setFocusedField(null)}
                      required
                      className={`bg-black/20 border-white/10 text-white placeholder:text-zinc-500 pr-10 transition-all duration-200 ${
                        focusedField === "newPassword"
                          ? "border-orange-500 shadow-lg shadow-orange-500/20"
                          : ""
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-300 transition-colors"
                    >
                      {showPassword ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                  <p className="text-xs text-zinc-500">{passwordPolicyHelp}</p>
                </div>

                <div className="space-y-2">
                  <Label
                    htmlFor="fp-confirm"
                    className="text-zinc-300 flex items-center gap-2"
                  >
                    <CheckCircle className="w-4 h-4" />
                    {t(
                      "auth.forgotPassword.confirmPassword",
                      "Confirm Password"
                    )}
                  </Label>
                  <div className="relative">
                    <Input
                      id="fp-confirm"
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="••••••••"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      onFocus={() => setFocusedField("confirmPassword")}
                      onBlur={() => setFocusedField(null)}
                      required
                      className={`bg-black/20 border-white/10 text-white placeholder:text-zinc-500 pr-10 transition-all duration-200 ${
                        focusedField === "confirmPassword"
                          ? "border-orange-500 shadow-lg shadow-orange-500/20"
                          : ""
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setShowConfirmPassword(!showConfirmPassword)
                      }
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-300 transition-colors"
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>

                <Button
                  type="submit"
                  className="w-full rounded-full font-semibold bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      {t("auth.forgotPassword.updating", "Updating...")}
                    </>
                  ) : (
                    <>
                      <Shield className="w-4 h-4 mr-2" />
                      {t(
                        "auth.forgotPassword.updatePassword",
                        "Update Password"
                      )}
                    </>
                  )}
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  className="w-full text-zinc-300 hover:text-white hover:bg-white/10 rounded-full transition-all duration-200"
                  onClick={goBackToLogin}
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  {t("auth.backToLogin", "Back to Login")}
                </Button>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
