// src/pages/shared/Login.tsx
import { useState, useEffect } from "react";
import { Lock, Mail, AlertTriangle } from "lucide-react";
import ComponentInput from "@/components/common/FormInput";
import ComponetButton from "@/components/common/button";
import logo from "../../assets/logo/Logo.png";
import { Link, useNavigate } from "react-router-dom";
import SliderComponent from "@/components/SliderComponent";
import { loginSchema } from "@/types/type";
import { useAuth } from "@/contexts/AuthContext";
import { setCache } from "@/lib/Cache";
import image from "../../assets/image/Subtração 10.png";
export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState({ email: "", password: "" });
  const [loginError, setLoginError] = useState(""); // estado para erro de login
  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();
  const { login, updateLastPath } = useAuth();

  const handleLogin = async () => {
    setIsLoading(true);
    const result = loginSchema.safeParse({ email, password });
    if (!result.success) {
      setIsLoading(false);
      const newErrors = result.error.format();
      setErrors({
        email: newErrors.email?._errors[0] || "",
        password: newErrors.password?._errors[0] || "",
      });
    } else {
      try {
        setLoginError("");
        setIsLoading(false);
        const userData = await login(email, password);

        let route = "";
        //user
        console.log(password);
        if (password) {
          switch (Number(password)) {
            case 123:
              route = "/admin/statistics";
              break;
            case 1234:
              route = "/teacher/documents";
              break;
            case 12345:
              route = "/admEmployee/document-management";
              break;

            default:
              route = "/not-found";
          }
        }
        // Atualiza o último caminho e navega para a rota definida
        updateLastPath(route);
        navigate(route);

        setErrors({ email: "", password: "" });
      } catch (error: any) {
        const defaultMessage = "Email ou senha incorretos";
        setLoginError(defaultMessage);
        setTimeout(() => {
          setLoginError("");
          setErrors({ email: "", password: "" });
        }, 2000);
      }
    }
  };

  useEffect(() => {
    setCache("Change_Resert_Password", null);
    setCache("Change_Email_Register", null);
    setCache("Change_Email_Resert_Password", null);
  }, []);

  useEffect(() => {
    setErrors((prev) => ({ ...prev, email: "" }));
  }, [email]);

  useEffect(() => {
    setErrors((prev) => ({ ...prev, password: "" }));
  }, [password]);

  return (
    <div className="flex min-h-screen">
      {/* <button
        onClick={() => (window.location.href = "/")}
        className="absolute bg-white top-5 left-5 text-black p-2 hover:bg-gray-200 rounded-full z-50 cursor-pointer"
      >
        <ArrowLeft size={24} />
      </button> */}
      <SliderComponent img={image} />
      <div className="w-full lg:w-1/2 flex items-center relative justify-center overflow-y-auto h-auto px-4 md:px-8">
        <div className="px-4 md:px-8 w-full">
          <div className="flex justify-center my-4">
            {/* <img src={logo} alt="Logo" className="w-20 h-20" /> */}{" "}
            <p className="text-3xl">Logo</p>
          </div>
          <div className="mb-8 my-8">
            <h2 className="text-2xl mb-2">Bem-vindo de volta!</h2>
            <p>
              Acesse sua conta para gerenciar seus orçamentos e manter o
              controle financeiro da sua empresa.
            </p>
          </div>
          {/* Exibe o alerta de erro, se houver */}
          {loginError && (
            <div className="mb-4 p-4 flex items-center gap-2 border border-red-500 text-red-600 rounded bg-red-50">
              <AlertTriangle className="w-6 h-6" />
              <span>Erro ao efetuar login: {loginError}</span>
            </div>
          )}
          <form>
            <div className="mb-4">
              <ComponentInput
                placeholder="Digite seu email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                icon={Mail}
                label={"Email"}
                name={"email"}
                error={errors.email}
              />
            </div>
            <div className="mb-6">
              <ComponentInput
                type="password"
                placeholder="Digite a sua senha"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                icon={Lock}
                label={"Senha"}
                name={"senha"}
                error={errors.password}
              />
            </div>
          </form>

          <div className="my-6 flex justify-end">
            <Link to="/recover-password/change-email" className="">
              Esqueci minha <span className="text-[#4D6BFE]">senha?</span>
            </Link>
          </div>

          <ComponetButton
            variant="primary"
            className="w-full"
            onClick={handleLogin}
            loading={isLoading}
          >
            Log in
          </ComponetButton>

          {/* <div className="my-6 flex justify-start">
            <Link to="/register" className="transition-colors truncate">
              Cadastre-se <span className="text-[#4D6BFE]">agora</span>
            </Link>
          </div> */}
        </div>
      </div>
    </div>
  );
}
