import { Link, NavLink } from "react-router-dom";
import { profile as personalInfo } from "../lib/profile";

const linkClass = ({ isActive }: { isActive: boolean }) =>
  `rounded-full px-4 py-2 text-sm font-medium transition ${
    isActive ? "bg-white/10 text-white" : "text-zinc-400 hover:text-white"
  }`;

const Nav = () => {
  const { firstName, lastName } = personalInfo;

  return (
    <header className="sticky top-0 z-10 border-b border-white/5 bg-zinc-950/70 backdrop-blur-xl">
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
        <Link
          to="/"
          className="text-xl font-extrabold tracking-tight"
          aria-label="Home"
        >
          {firstName[0]}
          <span className="text-accent">{lastName[0]}</span>
        </Link>
        <div className="flex gap-1">
          <NavLink to="/" end className={linkClass}>
            Home
          </NavLink>
          <NavLink to="/contact" className={linkClass}>
            Contact
          </NavLink>
        </div>
      </nav>
    </header>
  );
};

export default Nav;
