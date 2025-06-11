// import { useState, useEffect } from "react";
// import { Link, useNavigate } from "react-router-dom";
// import { User, Mail, Lock } from "lucide-react";

// import SliderComponent from "@/components/SliderComponent";
// import ComponentInput from "@/components/common/FormInput";
// import ComponentSelect from "@/components/common/ComponentSelect"; // Importado o select
// import ComponetButton from "@/components/common/button";
// import logo from "@/assets/logo/logo_login.svg";
// import { registerSchema } from "@/types/type"; // Seu schema atualizado
// import { clearCache, setCache } from "@/lib/Cache";
// import { useReceiveCode } from "@/hooks/DynamicApiHooks";
// import image from "../../assets/image/Subtração 1.png";
// interface RegisterFormData {
//   name: string;
//   email: string;
//   password: string;
//   confirmPassword: string;
//   dateOfBirth: string;
//   gender: string; // Campo adicionado para gênero
// }

// export default function RegisterScreen() {
//   const [formData, setFormData] = useState<RegisterFormData>({
//     name: "",
//     email: "",
//     password: "",
//     confirmPassword: "",
//     dateOfBirth: "",
//     gender: "", // Inicializado como vazio
//   });
//   const [errors, setErrors] = useState<Partial<RegisterFormData>>({});
//   const navigate = useNavigate();
//   const { mutateAsync: receiveCode } = useReceiveCode();
//   const [isLoading, setIsLoading] = useState(false);
//   // Atualiza erro para inputs de texto
//   useEffect(() => {
//     setErrors((prev) => ({ ...prev, name: "" }));
//   }, [formData.name]);
//   useEffect(() => {
//     setErrors((prev) => ({ ...prev, email: "" }));
//   }, [formData.email]);
//   useEffect(() => {
//     setErrors((prev) => ({ ...prev, password: "" }));
//   }, [formData.password]);
//   useEffect(() => {
//     setErrors((prev) => ({ ...prev, confirmPassword: "" }));
//   }, [formData.confirmPassword]);
//   useEffect(() => {
//     setErrors((prev) => ({ ...prev, dateOfBirth: "" }));
//   }, [formData.dateOfBirth]);
//   useEffect(() => {
//     setErrors((prev) => ({ ...prev, gender: "" }));
//   }, [formData.gender]);

//   // Lida com mudanças nos campos de texto
//   const handleChangeInput = (e: React.ChangeEvent<HTMLInputElement>) => {
//     const { name, value } = e.target;
//     setFormData((prev) => ({ ...prev, [name]: value }));
//   };

//   // Lida com mudanças no select
//   const handleChangeSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
//     const { name, value } = e.target;
//     setFormData((prev) => ({ ...prev, [name]: value }));
//   };

//   useEffect(() => {
//     const clearDataOnRender = async () => {
//       clearCache();
//     };
//     clearDataOnRender();
//   }, []);

//   const handleRegister = async () => {
//     setIsLoading(true);
//     const result = registerSchema.safeParse(formData);

//     if (!result.success) {
//       const formatted = result.error.format();
//       setIsLoading(false);
//       setErrors({
//         name: formatted.name?._errors[0],
//         email: formatted.email?._errors[0],
//         password: formatted.password?._errors[0],
//         confirmPassword: formatted.confirmPassword?._errors[0],
//         dateOfBirth: formatted.dateOfBirth?._errors[0],
//         gender: formatted.gender?._errors[0],
//       });
//     } else {
//       setErrors({});
//       setCache("Change_Email_Register", result.data.email);
//       setCache("FormDados", result.data);
//       const response = await receiveCode({ email: result.data.email });
//       if (response.message === "Verification email sent successfully") {
//         setIsLoading(false);
//         navigate("/confirmation-code");
//       }
//     }
//   };

//   return (
//     <div className="flex min-h-screen">


//       <div className="w-full lg:w-1/2 flex items-center relative justify-center md:px-4">
//         <div className="px-4 md:px-8 w-full">
//           <div className="flex justify-center my-4">
//             {/* <img src={logo} alt="Logo Linka" className="w-20 h-20" /> */}
//             <p className="text-3xl">Logo</p>
//           </div>

//           <div className="mb-8 my-8 px-4">
//             <h2 className="text-2xl mb-2">Crie sua Conta</h2>
//             <p>
//             Gerencie seus orçamentos de forma eficiente e acompanhe os custos da sua 
//             empresa com precisão.
//             </p>
//           </div>

//           <div className="overflow-y-auto h-auto px-4 max-h-75">
//           <form>
//             <div className="mb-4">
//               <ComponentInput
//                 label="Nome Completo"
//                 name="name"
//                 type="text"
//                 placeholder="Digite seu nome completo"
//                 value={formData.name}
//                 onChange={handleChangeInput}
//                 icon={User}
//                 error={errors.name}
//                 required
//               />
//             </div>

//             <div className="mb-4">
//               <ComponentInput
//                 label="E-mail"
//                 name="email"
//                 type="email"
//                 placeholder="seuemail@exemplo.com"
//                 value={formData.email}
//                 onChange={handleChangeInput}
//                 icon={Mail}
//                 error={errors.email}
//                 required
//               />
//             </div>

//             <div className="mb-4">
//               <ComponentInput
//                 label="Senha"
//                 name="password"
//                 type="password"
//                 placeholder="Crie uma senha"
//                 value={formData.password}
//                 onChange={handleChangeInput}
//                 icon={Lock}
//                 error={errors.password}
//                 required
//               />
//             </div>

//             <div className="mb-4">
//               <ComponentInput
//                 label="Confirmar Senha"
//                 name="confirmPassword"
//                 type="password"
//                 placeholder="Repita a senha"
//                 value={formData.confirmPassword}
//                 onChange={handleChangeInput}
//                 icon={Lock}
//                 error={errors.confirmPassword}
//                 required
//               />
//             </div>

//             <div className="mb-4">
//               <ComponentInput
//                 label="Data de Nascimento"
//                 name="dateOfBirth"
//                 type="date"
//                 placeholder="YYYY-MM-DD"
//                 value={formData.dateOfBirth}
//                 onChange={handleChangeInput}
//                 error={errors.dateOfBirth}
//                 required
//               />
//             </div>

//             {/* Select para gênero */}
//             <div className="mb-6">
//               <ComponentSelect
//                 label="Gênero"
//                 name="gender"
//                 value={formData.gender}
//                 onChange={handleChangeSelect}
//                 options={[
//                   { value: "", label: "Selecionar" },
//                   { value: "Masculino", label: "Masculino" },
//                   { value: "Feminino", label: "Feminino" },
//                   { value: "Outro", label: "Outro" },
//                 ]}
//                 error={errors.gender}
//                 required
//               />
//             </div>
//             </form>

//           </div>

//           <div className="px-4">
//             <ComponetButton
//               variant="primary"
//               className="w-full"
//               onClick={handleRegister}
//               loading={isLoading} 
//             >
//               Cadastrar
//             </ComponetButton>

//             <div className="my-6 flex justify-start">
//               <Link to="/login" className="transition-colors truncate">
//                 Voltar para o <span className="text-[#E1B927]">login</span>
//               </Link>
//             </div>
//           </div>
//         </div>
//       </div>
//       <SliderComponent img={image} />
//     </div>
//   );
// }
