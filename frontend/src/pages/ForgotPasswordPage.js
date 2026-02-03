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

const passwordPolicyHelp =
  "Min 8 chars, 1 uppercase, 1 number, 1 special character";

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

  const [step, setStep] = useState("email"); // email | otp | reset
  const [loading, setLoading] = useState(false);

  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const passwordError = useMemo(
    () => validatePassword(newPassword),
    [newPassword]
  );

  const submitEmail = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await axios.post("/auth/forgot-password", { email });
      toast.success(
        res.data?.message || "If the email is registered, an OTP has been sent."
      );

      const debugOtp = res.data?.debug_otp;
      if (debugOtp) {
        setOtp(String(debugOtp));
        toast.message("Debug OTP", { description: String(debugOtp) });
      }
      setStep("otp");
    } catch (err) {
      const msg =
        err?.response?.data?.detail || err?.message || "Request failed";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const submitOtp = async (e) => {
    e.preventDefault();
    const trimmed = (otp || "").trim();
    if (!isValidOtp(trimmed)) {
      toast.error("Enter the 6-digit OTP");
      return;
    }

    setLoading(true);
    try {
      await axios.post("/auth/verify-otp", { email, otp: trimmed });
      toast.success("OTP verified");
      setStep("reset");
    } catch (err) {
      const msg =
        err?.response?.data?.detail || err?.message || "Verification failed";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const submitReset = async (e) => {
    e.preventDefault();

    const trimmedOtp = (otp || "").trim();
    if (!isValidOtp(trimmedOtp)) {
      toast.error("Enter the 6-digit OTP");
      return;
    }

    if (passwordError) {
      toast.error(passwordError);
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    setLoading(true);
    try {
      const res = await axios.post("/auth/reset-password", {
        email,
        otp: trimmedOtp,
        new_password: newPassword,
      });
      toast.success(res.data?.message || "Password updated successfully");
      navigate("/auth");
    } catch (err) {
      const msg = err?.response?.data?.detail || err?.message || "Reset failed";
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
              src="/logo.jpeg"
              alt="LearnovateX Logo"
              className="w-full h-full object-cover"
            />
          </div>
          <CardTitle className="text-2xl font-bold text-white">
            Reset Password
          </CardTitle>
          <CardDescription className="text-zinc-400">
            {step === "email" &&
              "Enter your registered email to receive an OTP"}
            {step === "otp" && "Enter the 6-digit OTP sent to your email"}
            {step === "reset" && "Create a new password"}
          </CardDescription>
        </CardHeader>

        <CardContent>
          {step === "email" && (
            <form onSubmit={submitEmail} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="fp-email" className="text-zinc-300">
                  Email
                </Label>
                <Input
                  id="fp-email"
                  type="email"
                  placeholder="your@email.com"
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
                {loading ? "Sending..." : "Send OTP"}
              </Button>
              <Button
                type="button"
                variant="ghost"
                className="w-full text-zinc-300 hover:text-white"
                onClick={goBackToLogin}
              >
                Back to Login
              </Button>
            </form>
          )}

          {step === "otp" && (
            <form onSubmit={submitOtp} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="fp-otp" className="text-zinc-300">
                  OTP
                </Label>
                <Input
                  id="fp-otp"
                  inputMode="numeric"
                  placeholder="6-digit code"
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
                {loading ? "Verifying..." : "Verify OTP"}
              </Button>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="ghost"
                  className="w-full text-zinc-300 hover:text-white"
                  onClick={() => setStep("email")}
                  disabled={loading}
                >
                  Change Email
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  className="w-full text-zinc-300 hover:text-white"
                  onClick={goBackToLogin}
                  disabled={loading}
                >
                  Back to Login
                </Button>
              </div>
            </form>
          )}

          {step === "reset" && (
            <form onSubmit={submitReset} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="fp-new" className="text-zinc-300">
                  New Password
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
                  Confirm Password
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
                {loading ? "Updating..." : "Update Password"}
              </Button>
              <Button
                type="button"
                variant="ghost"
                className="w-full text-zinc-300 hover:text-white"
                onClick={goBackToLogin}
                disabled={loading}
              >
                Back to Login
              </Button>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ForgotPasswordPage;
