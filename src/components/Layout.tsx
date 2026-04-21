import { Link, NavLink, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
// supabase import removed
// user type removed
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { LogOut, Ticket, Menu, X, Globe, Moon, Sun } from "lucide-react";
import { Chatbot } from "@/components/Chatbot";

const navItems = [
  { to: "/", label: "Home" },
  { to: "/museums", label: "Museums" },
  { to: "/shows", label: "Shows" },
  { to: "/exhibitions", label: "Exhibitions" },
  { to: "/custom", label: "Custom" },
];

export const Layout = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<any>(null);
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  const [lang, setLang] = useState("en");
  const [theme, setTheme] = useState<"light" | "dark">("light");

  useEffect(() => {
    // Theme initialization
    const storedTheme = localStorage.getItem("theme");
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const initialTheme = storedTheme || (prefersDark ? "dark" : "light");
    setTheme(initialTheme as "light" | "dark");
    if (initialTheme === "dark") {
      document.documentElement.classList.add("dark");
    }

    const token = localStorage.getItem("token");
    const storedUser = localStorage.getItem("user");
    if (token && storedUser) {
      setUser(JSON.parse(storedUser));
    }

    // Read language from Google Translate cookie
    const match = document.cookie.match(/googtrans=\/en\/([a-z]{2})/);
    if (match) setLang(match[1]);

    // Initialize Google Translate invisibly
    if (!document.getElementById("google-translate-script")) {
      const addScript = document.createElement("script");
      addScript.id = "google-translate-script";
      addScript.src = "//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit";
      addScript.async = true;
      document.body.appendChild(addScript);

      (window as any).googleTranslateElementInit = () => {
        new (window as any).google.translate.TranslateElement({
          pageLanguage: "en",
          includedLanguages: "en,hi,es",
          autoDisplay: false
        }, "google_translate_element");
      };
    }
  }, []);

  const handleLangChange = (newLang: string) => {
    setLang(newLang);
    document.cookie = `googtrans=/en/${newLang}; path=/;`;
    window.location.reload();
  };

  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
    localStorage.setItem("theme", newTheme);
    if (newTheme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  };

  const signOut = async () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
    navigate("/");
    window.location.reload();
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <header className="sticky top-0 z-40 backdrop-blur-md bg-background/80 border-b border-border">
        <div className="container-narrow flex h-16 items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-sm bg-primary flex items-center justify-center">
              <span className="text-primary-foreground font-display font-bold text-sm">M</span>
            </div>
            <span className="font-display text-xl font-semibold tracking-tight">Museia</span>
          </Link>

          <nav className="hidden md:flex items-center gap-1">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === "/"}
                className={({ isActive }) =>
                  `px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                    isActive ? "text-foreground" : "text-muted-foreground hover:text-foreground"
                  }`
                }
              >
                {item.label}
              </NavLink>
            ))}
            <div className="ml-4 flex items-center gap-2">
              <Globe className="w-4 h-4 text-muted-foreground" />
              <Select value={lang} onValueChange={handleLangChange}>
                <SelectTrigger className="w-[110px] h-8 bg-transparent border-none shadow-none text-sm font-medium focus:ring-0 px-0">
                  <SelectValue placeholder="Language" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="en">English</SelectItem>
                  <SelectItem value="hi">Hindi</SelectItem>
                  <SelectItem value="es">Español</SelectItem>
                </SelectContent>
              </Select>
              <div id="google_translate_element" className="hidden"></div>
            </div>
            
            <Button variant="ghost" size="icon" className="w-8 h-8 ml-2" onClick={toggleTheme} aria-label="Toggle theme">
              {theme === "light" ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
            </Button>
          </nav>

          <div className="hidden md:flex items-center gap-2">
            {user ? (
              <>
                <Button variant="ghost" size="sm" onClick={() => navigate("/dashboard")}>
                  <Ticket className="w-4 h-4 mr-2" />
                  My Tickets
                </Button>
                <Button variant="outline" size="sm" onClick={signOut}>
                  <LogOut className="w-4 h-4" />
                </Button>
              </>
            ) : (
              <>
                <Button variant="ghost" size="sm" onClick={() => navigate("/auth")}>Sign in</Button>
                <Button size="sm" onClick={() => navigate("/auth")}>Get started</Button>
              </>
            )}
          </div>

          <button className="md:hidden p-2" onClick={() => setOpen(!open)} aria-label="Menu">
            {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {open && (
          <div className="md:hidden border-t border-border bg-background">
            <div className="container-narrow py-3 flex flex-col gap-1">
              {navItems.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.to === "/"}
                  onClick={() => setOpen(false)}
                  className={({ isActive }) =>
                    `px-3 py-2 text-sm font-medium rounded-md ${isActive ? "bg-secondary" : ""}`
                  }
                >
                  {item.label}
                </NavLink>
              ))}
              <div className="border-t border-border mt-2 pt-2 flex gap-2">
                {user ? (
                  <>
                    <Button variant="outline" size="sm" className="flex-1" onClick={() => { setOpen(false); navigate("/dashboard"); }}>
                      My Tickets
                    </Button>
                    <Button variant="outline" size="sm" onClick={signOut}>
                      <LogOut className="w-4 h-4" />
                    </Button>
                  </>
                ) : (
                  <Button size="sm" className="flex-1" onClick={() => { setOpen(false); navigate("/auth"); }}>Sign in</Button>
                )}
              </div>
              <div className="border-t border-border mt-2 pt-2 flex justify-end">
                <Button variant="outline" size="sm" onClick={toggleTheme} className="flex items-center gap-2">
                  {theme === "light" ? <><Moon className="w-4 h-4" /> Dark Mode</> : <><Sun className="w-4 h-4" /> Light Mode</>}
                </Button>
              </div>
            </div>
          </div>
        )}
      </header>

      <main className="flex-1">{children}</main>

      <footer className="border-t border-border py-12 mt-16">
        <div className="container-narrow grid md:grid-cols-3 gap-8">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-sm bg-primary flex items-center justify-center">
                <span className="text-primary-foreground font-display font-bold text-sm">M</span>
              </div>
              <span className="font-display text-xl font-semibold">Museia</span>
            </div>
            <p className="text-sm text-muted-foreground">
              An AI-powered museum ticketing platform — book entries, shows and exhibitions in seconds.
            </p>
          </div>
          <div>
            <h4 className="font-medium mb-3 text-sm">Explore</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link to="/museums" className="hover:text-foreground">Museums</Link></li>
              <li><Link to="/shows" className="hover:text-foreground">Shows</Link></li>
              <li><Link to="/exhibitions" className="hover:text-foreground">Exhibitions</Link></li>
              <li><Link to="/custom" className="hover:text-foreground">Custom suggestions</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-medium mb-3 text-sm">About</h4>
            <p className="text-sm text-muted-foreground">
              Built as a smart, multilingual chatbot-based ticketing system to reduce queues, errors and wait times.
            </p>
          </div>
        </div>
        <div className="container-narrow mt-8 pt-6 border-t border-border text-xs text-muted-foreground text-center">
          © {new Date().getFullYear()} Museia. All rights reserved.
        </div>
      </footer>

      <Chatbot />
    </div>
  );
};
