import React, { useState, useEffect } from "react";
import { useI18n } from "../i18n/I18nProvider";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import { API, setAuthToken, setUser, getAuthToken } from "../lib/utils";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../components/ui/tabs";
import {
  Eye,
  EyeOff,
  Mail,
  Lock,
  User,
  Sparkles,
  ArrowRight,
  CheckCircle,
  AlertCircle,
  Loader2,
} from "lucide-react";

const AuthPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const { t } = useI18n();
  const [activeTab, setActiveTab] = useState("login");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [focusedField, setFocusedField] = useState(null);

  // Login state
  const [loginData, setLoginData] = useState({ email: "", password: "" });

  // Register state
  const [registerData, setRegisterData] = useState({
    email: "",
    password: "",
    name: "",
    role: "student",
  });

  // Calculate password strength
  useEffect(() => {
    const password = registerData.password;
    let strength = 0;
    if (password.length >= 8) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[a-z]/.test(password)) strength++;
    if (/\d/.test(password)) strength++;
    if (/[^A-Za-z0-9]/.test(password)) strength++;
    setPasswordStrength(strength);
  }, [registerData.password]);

  const getPasswordStrengthColor = () => {
    if (passwordStrength <= 2) return "bg-red-500";
    if (passwordStrength <= 3) return "bg-yellow-500";
    return "bg-green-500";
  };

  const getPasswordStrengthText = () => {
    if (passwordStrength <= 2) return "Weak";
    if (passwordStrength <= 3) return "Medium";
    return "Strong";
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      console.log("Attempting login with:", { email: loginData.email });
      console.log("API URL:", API);

      const response = await axios.post(`${API}/auth/login`, loginData);
      console.log("Login response:", response.data);

      setAuthToken(response.data.token);
      setUser(response.data.user);

      // Verify token was stored
      const storedToken = getAuthToken();
      console.log("Token stored successfully:", !!storedToken);

      // Dispatch auth change event for App to detect
      window.dispatchEvent(new Event("authChange"));

      toast.success("Welcome back! 🎉", {
        description: "Login successful!",
      });

      // Navigate based on role
      const role = response.data.user.role;
      if (role === "company") navigate("/company");
      else if (role === "college_admin") navigate("/college");
      else navigate("/dashboard");
    } catch (error) {
      console.error("Login error:", error);
      console.error("Error response:", error.response);
      console.error("Error message:", error.message);

      let errorMessage = "Login failed";
      if (error.response?.data?.detail) {
        errorMessage = error.response.data.detail;
      } else if (error.message) {
        errorMessage = `Network error: ${error.message}`;
      } else if (!navigator.onLine) {
        errorMessage = "No internet connection. Please check your network.";
      }

      toast.error("Login Failed", {
        description: errorMessage,
        icon: <AlertCircle className="w-4 h-4" />,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();

    // Validate password strength
    if (passwordStrength < 3) {
      toast.error("Weak Password", {
        description: "Please choose a stronger password",
        icon: <AlertCircle className="w-4 h-4" />,
      });
      return;
    }

    setLoading(true);

    try {
      console.log("Attempting registration with:", {
        email: registerData.email,
        name: registerData.name,
        role: registerData.role,
      });
      console.log("API URL:", API);

      const response = await axios.post(`${API}/auth/register`, registerData);
      console.log("Registration response:", response.data);

      setAuthToken(response.data.token);
      setUser(response.data.user);

      // Verify token was stored
      const storedToken = getAuthToken();
      console.log("Token stored successfully:", !!storedToken);

      // Dispatch auth change event for App to detect
      window.dispatchEvent(new Event("authChange"));

      toast.success("Account Created! 🎉", {
        description: "Welcome to LearnovateX!",
      });

      // Navigate based on role
      const role = response.data.user.role;
      if (role === "company") navigate("/company");
      else if (role === "college_admin") navigate("/college");
      else navigate("/dashboard");
    } catch (error) {
      console.error("Registration error:", error);
      console.error("Error response:", error.response);
      console.error("Error message:", error.message);

      let errorMessage = "Registration failed";
      if (error.response?.data?.detail) {
        errorMessage = error.response.data.detail;
      } else if (error.message) {
        errorMessage = `Network error: ${error.message}`;
      } else if (!navigator.onLine) {
        errorMessage = "No internet connection. Please check your network.";
      }

      toast.error("Registration Failed", {
        description: errorMessage,
        icon: <AlertCircle className="w-4 h-4" />,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-zinc-900 to-black flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 left-20 w-72 h-72 bg-gradient-to-r from-[var(--accent-color)]/10 to-[var(--accent-color)]/10 rounded-full blur-3xl animate-pulse"></div>
        <div
          className="absolute bottom-20 right-20 w-96 h-96 bg-gradient-to-r from-[var(--accent-color)]/10 to-[var(--accent-color)]/10 rounded-full blur-3xl animate-pulse"
          style={{ animationDelay: "2s" }}
        ></div>
        <div
          className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-gradient-to-r from-[var(--accent-color)]/10 to-[var(--accent-color)]/10 rounded-full blur-3xl animate-pulse"
          style={{ animationDelay: "4s" }}
        ></div>

        {/* Floating particles */}
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-[var(--accent-color)]/30 rounded-full animate-bounce"
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
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-white via-zinc-200 to-white bg-clip-text text-transparent mb-2">
            Welcome to LearnovateX
          </h1>
          <p className="text-zinc-400 text-sm">
            Master skills, ace interviews, build your career with AI
          </p>
        </div>

        {/* Main Auth Card */}
        <Card className="bg-zinc-900/80 backdrop-blur-xl border-zinc-700/50 shadow-2xl shadow-black/50 relative overflow-hidden">
          {/* Card background gradient */}
          <div className="absolute inset-0 bg-gradient-to-br from-[var(--accent-color)]/5 via-transparent to-[var(--accent-color)]/5"></div>

          <CardContent className="p-8 relative z-10">
            <Tabs
              value={activeTab}
              onValueChange={setActiveTab}
              className="w-full"
            >
              <TabsList className="grid w-full grid-cols-2 mb-8 bg-zinc-800/50 backdrop-blur-sm border border-zinc-700/50 p-1 rounded-xl">
                <TabsTrigger
                  value="login"
                  className="rounded-lg data-[state=active]:bg-gradient-to-r data-[state=active]:from-[var(--accent-color)] data-[state=active]:to-[var(--accent-color)] data-[state=active]:text-white data-[state=active]:shadow-lg transition-all duration-300"
                >
                  <User className="w-4 h-4 mr-2" />
                  Login
                </TabsTrigger>
                <TabsTrigger
                  value="register"
                  className="rounded-lg data-[state=active]:bg-gradient-to-r data-[state=active]:from-[var(--accent-color)] data-[state=active]:to-[var(--accent-color)] data-[state=active]:text-white data-[state=active]:shadow-lg transition-all duration-300"
                >
                  <Sparkles className="w-4 h-4 mr-2" />
                  Sign Up
                </TabsTrigger>
              </TabsList>

              {/* Login Tab */}
              <TabsContent value="login" className="space-y-6">
                <form onSubmit={handleLogin} className="space-y-6">
                  {/* Email Field */}
                  <div className="space-y-2">
                    <Label
                      htmlFor="login-email"
                      className="text-zinc-300 font-medium flex items-center gap-2"
                    >
                      <Mail className="w-4 h-4" />
                      Email Address
                    </Label>
                    <div className="relative">
                      <Input
                        id="login-email"
                        type="email"
                        placeholder="your@email.com"
                        value={loginData.email}
                        onChange={(e) =>
                          setLoginData({ ...loginData, email: e.target.value })
                        }
                        onFocus={() => setFocusedField("login-email")}
                        onBlur={() => setFocusedField(null)}
                        className="bg-zinc-800/50 border-zinc-600 text-white placeholder:text-zinc-500 h-12 pl-4 pr-4 rounded-xl focus:border-[var(--accent-color)] focus:ring-2 focus:ring-[var(--accent-color)]/20 transition-all duration-300"
                        required
                      />
                      {loginData.email && (
                        <CheckCircle className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-green-400" />
                      )}
                    </div>
                  </div>

                  {/* Password Field */}
                  <div className="space-y-2">
                    <Label
                      htmlFor="login-password"
                      className="text-zinc-300 font-medium flex items-center gap-2"
                    >
                      <Lock className="w-4 h-4" />
                      Password
                    </Label>
                    <div className="relative">
                      <Input
                        id="login-password"
                        type={showPassword ? "text" : "password"}
                        placeholder="••••••••"
                        value={loginData.password}
                        onChange={(e) =>
                          setLoginData({
                            ...loginData,
                            password: e.target.value,
                          })
                        }
                        onFocus={() => setFocusedField("login-password")}
                        onBlur={() => setFocusedField(null)}
                        className="bg-zinc-800/50 border-zinc-600 text-white placeholder:text-zinc-500 h-12 pl-4 pr-12 rounded-xl focus:border-[var(--accent-color)] focus:ring-2 focus:ring-[var(--accent-color)]/20 transition-all duration-300"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-zinc-400 hover:text-zinc-200 transition-colors"
                      >
                        {showPassword ? (
                          <EyeOff className="w-5 h-5" />
                        ) : (
                          <Eye className="w-5 h-5" />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Forgot Password Link */}
                  <div className="flex justify-end">
                    <button
                      type="button"
                      onClick={() => navigate("/forgot-password")}
                      className="text-sm text-[var(--accent-color)] hover:text-[var(--accent-color)]/80 transition-colors hover:underline"
                    >
                      Forgot Password?
                    </button>
                  </div>

                  {/* Login Button */}
                  <Button
                    type="submit"
                    disabled={loading}
                    className="w-full h-12 bg-gradient-to-r from-[var(--accent-color)] to-[var(--accent-color)] hover:from-[var(--accent-color)]/90 hover:to-[var(--accent-color)]/90 text-white font-semibold rounded-xl shadow-lg shadow-[var(--accent-color)]/25 hover:shadow-xl hover:shadow-[var(--accent-color)]/40 transform hover:scale-[1.02] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? (
                      <div className="flex items-center gap-2">
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Signing In...
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <ArrowRight className="w-5 h-5" />
                        Sign In
                      </div>
                    )}
                  </Button>
                </form>
              </TabsContent>

              {/* Register Tab */}
              <TabsContent value="register" className="space-y-6">
                <form onSubmit={handleRegister} className="space-y-6">
                  {/* Name Field */}
                  <div className="space-y-2">
                    <Label
                      htmlFor="register-name"
                      className="text-zinc-300 font-medium flex items-center gap-2"
                    >
                      <User className="w-4 h-4" />
                      Full Name
                    </Label>
                    <div className="relative">
                      <Input
                        id="register-name"
                        type="text"
                        placeholder="John Doe"
                        value={registerData.name}
                        onChange={(e) =>
                          setRegisterData({
                            ...registerData,
                            name: e.target.value,
                          })
                        }
                        onFocus={() => setFocusedField("register-name")}
                        onBlur={() => setFocusedField(null)}
                        className="bg-zinc-800/50 border-zinc-600 text-white placeholder:text-zinc-500 h-12 pl-4 pr-4 rounded-xl focus:border-[var(--accent-color)] focus:ring-2 focus:ring-[var(--accent-color)]/20 transition-all duration-300"
                        required
                      />
                      {registerData.name && (
                        <CheckCircle className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-green-400" />
                      )}
                    </div>
                  </div>

                  {/* Email Field */}
                  <div className="space-y-2">
                    <Label
                      htmlFor="register-email"
                      className="text-zinc-300 font-medium flex items-center gap-2"
                    >
                      <Mail className="w-4 h-4" />
                      Email Address
                    </Label>
                    <div className="relative">
                      <Input
                        id="register-email"
                        type="email"
                        placeholder="your@email.com"
                        value={registerData.email}
                        onChange={(e) =>
                          setRegisterData({
                            ...registerData,
                            email: e.target.value,
                          })
                        }
                        onFocus={() => setFocusedField("register-email")}
                        onBlur={() => setFocusedField(null)}
                        className="bg-zinc-800/50 border-zinc-600 text-white placeholder:text-zinc-500 h-12 pl-4 pr-4 rounded-xl focus:border-[var(--accent-color)] focus:ring-2 focus:ring-[var(--accent-color)]/20 transition-all duration-300"
                        required
                      />
                      {registerData.email && (
                        <CheckCircle className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-green-400" />
                      )}
                    </div>
                  </div>

                  {/* Password Field */}
                  <div className="space-y-2">
                    <Label
                      htmlFor="register-password"
                      className="text-zinc-300 font-medium flex items-center gap-2"
                    >
                      <Lock className="w-4 h-4" />
                      Password
                    </Label>
                    <div className="relative">
                      <Input
                        id="register-password"
                        type={showPassword ? "text" : "password"}
                        placeholder="••••••••"
                        value={registerData.password}
                        onChange={(e) =>
                          setRegisterData({
                            ...registerData,
                            password: e.target.value,
                          })
                        }
                        onFocus={() => setFocusedField("register-password")}
                        onBlur={() => setFocusedField(null)}
                        className="bg-zinc-800/50 border-zinc-600 text-white placeholder:text-zinc-500 h-12 pl-4 pr-12 rounded-xl focus:border-[var(--accent-color)] focus:ring-2 focus:ring-[var(--accent-color)]/20 transition-all duration-300"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-zinc-400 hover:text-zinc-200 transition-colors"
                      >
                        {showPassword ? (
                          <EyeOff className="w-5 h-5" />
                        ) : (
                          <Eye className="w-5 h-5" />
                        )}
                      </button>
                    </div>

                    {/* Password Strength Indicator */}
                    {registerData.password && (
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <div className="flex-1 bg-zinc-700 rounded-full h-2">
                            <div
                              className={`h-2 rounded-full transition-all duration-300 ${getPasswordStrengthColor()}`}
                              style={{
                                width: `${(passwordStrength / 5) * 100}%`,
                              }}
                            ></div>
                          </div>
                          <span className="text-xs text-zinc-400">
                            {getPasswordStrengthText()}
                          </span>
                        </div>
                        <div className="text-xs text-zinc-500 space-y-1">
                          <div
                            className={`flex items-center gap-1 ${
                              registerData.password.length >= 8
                                ? "text-green-400"
                                : "text-zinc-500"
                            }`}
                          >
                            <CheckCircle className="w-3 h-3" />
                            At least 8 characters
                          </div>
                          <div
                            className={`flex items-center gap-1 ${
                              /[A-Z]/.test(registerData.password)
                                ? "text-green-400"
                                : "text-zinc-500"
                            }`}
                          >
                            <CheckCircle className="w-3 h-3" />
                            One uppercase letter
                          </div>
                          <div
                            className={`flex items-center gap-1 ${
                              /\d/.test(registerData.password)
                                ? "text-green-400"
                                : "text-zinc-500"
                            }`}
                          >
                            <CheckCircle className="w-3 h-3" />
                            One number
                          </div>
                          <div
                            className={`flex items-center gap-1 ${
                              /[^A-Za-z0-9]/.test(registerData.password)
                                ? "text-green-400"
                                : "text-zinc-500"
                            }`}
                          >
                            <CheckCircle className="w-3 h-3" />
                            One special character
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Role Selection */}
                  <div className="space-y-2">
                    <Label
                      htmlFor="register-role"
                      className="text-zinc-300 font-medium"
                    >
                      I am a
                    </Label>
                    <Select
                      value={registerData.role}
                      onValueChange={(value) =>
                        setRegisterData({ ...registerData, role: value })
                      }
                    >
                      <SelectTrigger className="bg-zinc-800/50 border-zinc-600 text-white h-12 rounded-xl focus:border-[var(--accent-color)] focus:ring-2 focus:ring-[var(--accent-color)]/20">
                        <SelectValue placeholder="Select your role" />
                      </SelectTrigger>
                      <SelectContent className="bg-zinc-800 border-zinc-600 rounded-xl">
                        <SelectItem
                          value="student"
                          className="text-white hover:bg-zinc-700 focus:bg-zinc-700"
                        >
                          🎓 Student
                        </SelectItem>
                        <SelectItem
                          value="job_seeker"
                          className="text-white hover:bg-zinc-700 focus:bg-zinc-700"
                        >
                          💼 Job Seeker
                        </SelectItem>
                        <SelectItem
                          value="company"
                          className="text-white hover:bg-zinc-700 focus:bg-zinc-700"
                        >
                          🏢 Company/Recruiter
                        </SelectItem>
                        <SelectItem
                          value="college_admin"
                          className="text-white hover:bg-zinc-700 focus:bg-zinc-700"
                        >
                          🎓 College Admin
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Register Button */}
                  <Button
                    type="submit"
                    disabled={loading}
                    className="w-full h-12 bg-gradient-to-r from-[var(--accent-color)] to-[var(--accent-color)] hover:from-[var(--accent-color)]/90 hover:to-[var(--accent-color)]/90 text-white font-semibold rounded-xl shadow-lg shadow-[var(--accent-color)]/25 hover:shadow-xl hover:shadow-[var(--accent-color)]/40 transform hover:scale-[1.02] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? (
                      <div className="flex items-center gap-2">
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Creating Account...
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <Sparkles className="w-5 h-5" />
                        Create Account
                      </div>
                    )}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center mt-6">
          <p className="text-zinc-500 text-sm">
            By signing up, you agree to our{" "}
            <button className="text-[var(--accent-color)] hover:text-[var(--accent-color)]/80 transition-colors hover:underline">
              Terms of Service
            </button>{" "}
            and{" "}
            <button className="text-[var(--accent-color)] hover:text-[var(--accent-color)]/80 transition-colors hover:underline">
              Privacy Policy
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
