import { Switch, Route, Router as WouterRouter, Link, useLocation } from "wouter";
import Home from "./pages/Home";
import Calendar from "./pages/Calendar";
import Records from "./pages/Records";
import Detail from "./pages/Detail";
import Form from "./pages/Form";
import Keywords from "./pages/Keywords";

function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center text-gray-400">
      <div className="text-center">
        <p className="text-4xl mb-2">🔍</p>
        <p className="text-sm">페이지를 찾을 수 없습니다.</p>
      </div>
    </div>
  );
}

function NavBar() {
  const [location] = useLocation();

  const links = [
    { href: "/", label: "홈", icon: "🏠" },
    { href: "/calendar", label: "달력", icon: "📅" },
    { href: "/records", label: "기록", icon: "📋" },
    { href: "/keywords", label: "키워드", icon: "🔑" },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 flex justify-around py-2 z-50">
      {links.map(({ href, label, icon }) => {
        const active = href === "/" ? location === "/" : location.startsWith(href);
        return (
          <Link
            key={href}
            href={href}
            className={`flex flex-col items-center gap-0.5 px-4 py-1 rounded-lg transition-colors ${active ? "text-black" : "text-gray-400"}`}
          >
            <span className="text-xl">{icon}</span>
            <span className="text-[10px] font-medium">{label}</span>
          </Link>
        );
      })}
    </nav>
  );
}

function Router() {
  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/calendar" component={Calendar} />
        <Route path="/records" component={Records} />
        <Route path="/detail/:id" component={Detail} />
        <Route path="/form" component={Form} />
        <Route path="/form/:id" component={Form} />
        <Route path="/keywords" component={Keywords} />
        <Route component={NotFound} />
      </Switch>
      <NavBar />
    </div>
  );
}

function App() {
  return (
    <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
      <Router />
    </WouterRouter>
  );
}

export default App;
