export const authPageStyles = `
body {
  background-color: #0f172a;
  overflow-x: hidden;
}

#particles-js {
  position: fixed;
  width: 100%;
  height: 100%;
  top: 0;
  left: 0;
  z-index: 0;
}

.wave {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 200%;
  height: 100px;
  background: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1440 320'%3E%3Cpath fill='%230ea5e9' fill-opacity='0.1' d='M0,192L48,197.3C96,203,192,213,288,229.3C384,245,480,267,576,250.7C672,235,768,181,864,181.3C960,181,1056,235,1152,234.7C1248,235,1344,181,1392,154.7L1440,128L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z'%3E%3C/path%3E%3C/svg%3E") repeat-x;
  animation: wave 8s linear infinite;
}

@keyframes wave {
  0% {
    transform: translateX(0);
  }
  100% {
    transform: translateX(-50%);
  }
}
`;

export function AuthBackground() {
  return (
    <>
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-3xl animate-pulse-slow"></div>
        <div
          className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-secondary/20 rounded-full blur-3xl animate-pulse-slow"
          style={{ animationDelay: '2s' }}
        ></div>
        <div
          className="absolute top-1/2 left-1/2 w-64 h-64 bg-accent/10 rounded-full blur-3xl animate-pulse-slow"
          style={{ animationDelay: '4s' }}
        ></div>
      </div>
      <div id="particles-js"></div>
      <div className="wave"></div>
    </>
  );
}

export function AuthBrand({ heading, description }) {
  return (
    <div className="text-center mb-8">
      <div className="flex items-center justify-center space-x-3 mb-4 group">
        <div className="w-12 h-12 rounded-full bg-gradient-water flex items-center justify-center animate-float group-hover:animate-glow">
          <i className="fa fa-tint text-white text-2xl"></i>
        </div>
        <div>
          <h1 className="text-3xl font-bold text-white">海河六域</h1>
          <p className="text-xs text-gray-400">流域水质时空演变与知识图谱智能治理系统</p>
        </div>
      </div>
      <h2 className="text-2xl font-bold text-white">{heading}</h2>
      <p className="text-gray-400 mt-2">{description}</p>
    </div>
  );
}
