import { useState, useEffect } from "react";
import { Mail } from "lucide-react";
import ComponentInput from "@/components/common/FormInput";
import ComponetButton from "@/components/common/button";
import { Link, useNavigate } from "react-router-dom";
import { loginSchema } from "@/types/type";
import { clearCache, setCache } from "@/lib/Cache";
import logo from "../../assets/logo/logo_login.svg";
import SliderComponent from "@/components/SliderComponent";
import image from "../../assets/image/Subtração 10.png";
export function ChangeEmailScreen() {
  const [email, setEmail] = useState("");
  const [errors, setErrors] = useState({ email: "" });
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  useEffect(() => {
    const clearDataOnRender = async () => {
      clearCache();
    };
    clearDataOnRender();
  }, []);
  const handleChangeEmail = () => {
    const result = loginSchema.safeParse({ email, password: "placeholder" });
    setIsLoading(true);
    if (!result.success) {
      setIsLoading(false);
      const newErrors = result.error.format();
      setErrors({
        email: newErrors.email?._errors[0] || "",
      });
    } else {
      setIsLoading(false);
      setErrors({ email: "" });
      setCache("Change_Email_Resert_Password", email);
      navigate("/recover-password/reset-password");
    }
  };

  useEffect(() => {
    setErrors((prev) => ({ ...prev, email: "" }));
  }, [email]);

  return (
    <div className="flex min-h-screen">
      <SliderComponent img={image} />
      <div className="w-full lg:w-1/2 flex items-center relative justify-center px-4 md:px-8">
        <div className="px-4 md:px-8 w-full">
          <div className="flex justify-center my-4">
            {/* <img src={logo} alt="" className="w-20 h-20" /> */}
            <p className="text-3xl">Logo</p>
          </div>
          <div className="mb-8 my-8">
            <h2 className="text-2xl mb-2">Redefinir Senha</h2>
            <p className="mb-6">
              Informe seu e-mail para receber um código de confirmação e
              redefinir sua senha.
            </p>
          </div>
          <div className="mb-6">
            <ComponentInput
              type="email"
              placeholder="Digite seu email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              icon={Mail}
              label={"Email"}
              name={"email"}
              error={errors.email}
            />
          </div>
          <ComponetButton
            variant="primary"
            className="w-full"
            onClick={handleChangeEmail}
            loading={isLoading}
          >
            Avançar
          </ComponetButton>
          <div className="my-6 flex justify-start">
            <Link to="/login" className="transition-colors truncate">
              Voltar para <span className="text-[#4D6BFE]">Login</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
