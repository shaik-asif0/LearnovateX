import React, { useState } from "react";
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
import { Brain } from "lucide-react";

const AuthPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const { t } = useI18n();

  // Login state
  const [loginData, setLoginData] = useState({ email: "", password: "" });

  // Register state
  const [registerData, setRegisterData] = useState({
    email: "",
    password: "",
    name: "",
    role: "student",
  });

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

      toast.success("Login successful!");

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

      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
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

      toast.success("Registration successful!");

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

      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

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
          <CardTitle className="text-3xl font-bold text-white">
            AI Learning Platform
          </CardTitle>
          <CardDescription className="text-zinc-400">
            Master skills, ace interviews, build your career
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="login" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-6 bg-zinc-800">
              <TabsTrigger
                data-testid="login-tab"
                value="login"
                className="data-[state=active]:bg-white data-[state=active]:text-black"
              >
                {t("auth.login", "Login")}
              </TabsTrigger>
              <TabsTrigger
                data-testid="register-tab"
                value="register"
                className="data-[state=active]:bg-white data-[state=active]:text-black"
              >
                {t("auth.register", "Register")}
              </TabsTrigger>
            </TabsList>

            <TabsContent value="login">
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="login-email" className="text-zinc-300">
                    {t("auth.label.email", "Email")}
                  </Label>
                  <Input
                    data-testid="login-email-input"
                    id="login-email"
                    type="email"
                    placeholder="your@email.com"
                    value={loginData.email}
                    onChange={(e) =>
                      setLoginData({ ...loginData, email: e.target.value })
                    }
                    required
                    className="bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="login-password" className="text-zinc-300">
                    {t("auth.label.password", "Password")}
                  </Label>
                  <Input
                    data-testid="login-password-input"
                    id="login-password"
                    type="password"
                    placeholder="••••••••"
                    value={loginData.password}
                    onChange={(e) =>
                      setLoginData({ ...loginData, password: e.target.value })
                    }
                    required
                    className="bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500"
                  />
                </div>
                <div className="flex justify-end">
                  <Button
                    type="button"
                    variant="ghost"
                    className="h-auto p-0 text-sm text-zinc-400 hover:text-white"
                    onClick={() => navigate("/forgot-password")}
                  >
                    {t("auth.forgotPassword", "Forgot Password?")}
                  </Button>
                </div>
                <Button
                  data-testid="login-submit-btn"
                  type="submit"
                  className="w-full rounded-full font-semibold bg-white text-black hover:bg-zinc-200"
                  disabled={loading}
                >
                  {loading
                    ? t("auth.loggingIn", "Logging in...")
                    : t("auth.login", "Login")}
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="register">
              <form onSubmit={handleRegister} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="register-name" className="text-zinc-300">
                    {t("auth.label.fullName", "Full Name")}
                  </Label>
                  <Input
                    data-testid="register-name-input"
                    id="register-name"
                    type="text"
                    placeholder="John Doe"
                    value={registerData.name}
                    onChange={(e) =>
                      setRegisterData({ ...registerData, name: e.target.value })
                    }
                    required
                    className="bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="register-email" className="text-zinc-300">
                    {t("auth.label.email", "Email")}
                  </Label>
                  <Input
                    data-testid="register-email-input"
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
                    required
                    className="bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="register-password" className="text-zinc-300">
                    {t("auth.label.password", "Password")}
                  </Label>
                  <Input
                    data-testid="register-password-input"
                    id="register-password"
                    type="password"
                    placeholder="••••••••"
                    value={registerData.password}
                    onChange={(e) =>
                      setRegisterData({
                        ...registerData,
                        password: e.target.value,
                      })
                    }
                    required
                    className="bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="register-role" className="text-zinc-300">
                    {t("auth.label.role", "I am a")}
                  </Label>
                  <Select
                    value={registerData.role}
                    onValueChange={(value) =>
                      setRegisterData({ ...registerData, role: value })
                    }
                  >
                    <SelectTrigger
                      data-testid="register-role-select"
                      id="register-role"
                      className="bg-zinc-800 border-zinc-700 text-white"
                    >
                      <SelectValue placeholder="Select your role" />
                    </SelectTrigger>
                    <SelectContent className="bg-zinc-900 border-zinc-800">
                      <SelectItem value="student">
                        {t("auth.role.student", "Student")}
                      </SelectItem>
                      <SelectItem value="job_seeker">
                        {t("auth.role.job_seeker", "Job Seeker")}
                      </SelectItem>
                      <SelectItem value="company">
                        {t("auth.role.company", "Company/Recruiter")}
                      </SelectItem>
                      <SelectItem value="college_admin">
                        {t("auth.role.college_admin", "College Admin")}
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button
                  data-testid="register-submit-btn"
                  type="submit"
                  className="w-full rounded-full font-semibold bg-white text-black hover:bg-zinc-200"
                  disabled={loading}
                >
                  {loading
                    ? t("auth.creatingAccount", "Creating account...")
                    : t("auth.createAccount", "Create Account")}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default AuthPage;
