
import { Sparkles, ArrowUpRight } from "lucide-react";

function AuthLayout({ children, variant = "login" }) {
  return (
    <div className="auth-shell">
      <div className="auth-decoration decoration-one" />
      <div className="auth-decoration decoration-two" />

      <header className="auth-brand">
        <div className="brand-mark">
          <Sparkles size={23} />
        </div>

        <span>Elevate<span className="brand-highlight">AI</span></span>
      </header>

      <main className="auth-main">
        <section className="auth-promo">
          <div className="promo-tag">
            <Sparkles size={14} />
            AI-POWERED CAREER INTELLIGENCE
          </div>

          <h1>
            {variant === "signup"
              ? "Your future starts with one step."
              : "Your potential has no limits."}
          </h1>

          <p>
            Discover hidden skills, explore career opportunities
            and build a professional identity that stands out.
          </p>

          <div className="promo-bottom">
            <div className="promo-line" />
            <span>Discover. Develop. Elevate.</span>
          </div>

          <div className="promo-orbit">
            <div className="orbit-ring ring-one" />
            <div className="orbit-ring ring-two" />
            <div className="orbit-center">
              <Sparkles size={34} />
            </div>
            <div className="orbit-label">
              <ArrowUpRight size={17} />
              Your next chapter
            </div>
          </div>
        </section>

        <section className="auth-form-section">
          {children}
        </section>
      </main>

      <footer className="auth-legal">
        <span>© 2026 Elevate AI</span>
        <span>Built for your next chapter.</span>
      </footer>
    </div>
  );
}

export default AuthLayout;
