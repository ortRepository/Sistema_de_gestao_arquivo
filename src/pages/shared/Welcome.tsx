import { useNavigate } from "react-router-dom";
import {
  CheckCircle,
  MapPin,
  ArrowRight,
  Newspaper,
  CalendarCheck,
} from "lucide-react";
import video from "../../assets/videos/Semrush Trends.mp4";
import Videogif from "../../assets/videos/video.gif";
import { useEffect } from "react";

export function WelcomeScreen() {
  const navigate = useNavigate();

  useEffect(() => {
    const hasSeenWelcome = localStorage.getItem("hasSeenWelcome");
    if (hasSeenWelcome === "true") {
      navigate("/user/map", { replace: true });
    } else {
      // Permite que o usuário veja a tela de welcome por alguns segundos
      const timer = setTimeout(() => {
        localStorage.setItem("hasSeenWelcome", "true");
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [navigate]);

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-8 relative overflow-hidden">
      {/* Elementos decorativos animados */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Bolhas flutuantes */}
        {[...Array(15)].map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full bg-[#FF9E01]/10 animate-orbita"
            style={{
              width: `${Math.random() * 40 + 20}px`,
              height: `${Math.random() * 40 + 20}px`,
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              animation: `
                orbita ${20 + i * 2}s linear infinite,
                pulse ${3 + i}s ease-in-out infinite
              `,
            }}
          />
        ))}

        {/* Ondas animadas */}
        <div className="absolute -bottom-20 left-0 right-0 opacity-20">
          <svg
            viewBox="0 24 150 28"
            className="w-full h-32"
            preserveAspectRatio="none"
          >
            <defs>
              <path
                id="wave"
                d="M-160 44c30 0 58-18 88-18s 58 18 88 18 58-18 88-18 58 18 88 18 v44h-352z"
              />
            </defs>
            <g className="animate-waves">
              <use href="#wave" x="0" y="0" fill="#FF9E01" fillOpacity="0.3" />
              <use
                href="#wave"
                x="50"
                y="3"
                fill="#FF9E01"
                fillOpacity="0.35"
              />
              <use
                href="#wave"
                x="100"
                y="5"
                fill="#FF9E01"
                fillOpacity="0.4"
              />
            </g>
          </svg>
        </div>
      </div>

      <div className="max-w-6xl w-full flex flex-col md:flex-row items-center gap-12 z-10">
        {/* Vídeo/GIF */}
        <div className="flex-1 animate-fade-in relative overflow-hidden rounded-2xl shadow-xl">
          <video
            autoPlay
            loop
            muted
            playsInline
            className="w-full h-auto object-cover"
          >
            <source src={video} type="video/mp4" />
            <img
              src={Videogif}
              alt="Interação comunitária"
              className="w-full h-full object-cover"
            />
          </video>
          <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent" />
        </div>

        {/* Conteúdo */}
        <div className="flex-1 space-y-8 animate-slide-up">
          <div className="text-left">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4">
              Bem-vindo ao <span className="text-[#FF9E01]">Linka</span>
            </h1>
            <p className="text-xl text-gray-600 mb-8">
              Juntos construímos uma comunidade de serviços públicos mais
              acessível e humano
            </p>
          </div>

          {/* Benefícios */}
          <div className="space-y-6">
            {[
              {
                icon: <CheckCircle className="w-8 h-8 text-[#FF9E01]" />,
                title: "Cadastro Concluído",
                text: "Sua conta está pronta para uso imediato",
                action: () => navigate("/user/map"),
              },
              {
                icon: <Newspaper className="w-8 h-8 text-[#FF9E01]" />,
                title: "Blog Institucional",
                text: "Acompanhe novidades das instituições",
                action: () => navigate("/user/news"),
              },
              {
                icon: <MapPin className="w-8 h-8 text-[#FF9E01]" />,
                title: "Serviços Locais",
                text: "Encontre serviços próximos de você",
                action: () => navigate("/user/map"),
              },
            ].map((item, index) => (
              <div
                key={index}
                onClick={item.action}
                className="flex items-start gap-4 group hover:scale-[1.02] transition-transform cursor-pointer"
              >
                <div className="p-2 bg-[#FF9E01]/10 rounded-lg group-hover:bg-[#FF9E01]/20 transition-colors">
                  {item.icon}
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-800">
                    {item.title}
                    {index === 1 && (
                      <span className="ml-2 bg-[#FF9E01] text-center text-white text-sm px-2 py-1 rounded-full">
                        Novos posts!
                      </span>
                    )}
                  </h3>
                  <p className="text-gray-600 mt-1">{item.text}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Botão de Ação */}
          <button
            onClick={() => navigate("/user/map")}
            className="bg-[#FF9E01] text-white px-8 py-4 rounded-xl text-lg font-semibold
            hover:bg-[#FF8E01] transform hover:scale-105 transition-all
            flex items-center gap-2 shadow-md hover:shadow-lg relative
            before:absolute before:inset-0 before:rounded-xl before:border-2
            before:border-[#FF9E01]/30 before:animate-pulse-scale cursor-pointer"
          >
            <ArrowRight className="w-5 h-5" />
            Explorar Plataforma
          </button>

          {/* Destaque do Blog */}
          {/* Destaque de Agendamento */}
          <div
            className="mt-6 p-4 bg-[#FF9E01]/10 rounded-xl cursor-pointer hover:bg-[#FF9E01]/20 transition-colors group"
            onClick={() => navigate("/schedule")}
          >
            <div className="flex flex-col gap-4">
              {/* Cabeçalho */}
              <div className="flex items-center gap-3">
                <CalendarCheck className="text-[#FF9E01] w-6 h-6 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold text-gray-800">
                    Agendamento Rápido
                  </h3>
                  <p className="text-sm text-gray-600">
                    Serviços disponíveis nas instituições próximas
                  </p>
                </div>
              </div>

              {/* Divisor */}
              <div className="border-t border-[#FF9E01]/20" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
