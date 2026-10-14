import { FiGithub, FiLinkedin } from "react-icons/fi";
import { profile as personalInfo } from "../lib/profile";

const Footer = () => {
  const { firstName, lastName, githubLink, linkedinLink } = personalInfo;

  return (
    <footer className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-8 text-sm text-zinc-500 sm:px-6">
      <span>
        © {new Date().getFullYear()} {firstName} {lastName}
      </span>
      <div className="flex gap-4">
        {linkedinLink && (
          <a
            href={linkedinLink}
            target="_blank"
            rel="noreferrer"
            aria-label="LinkedIn"
            className="transition hover:text-white"
          >
            <FiLinkedin size={20} />
          </a>
        )}
        {githubLink && (
          <a
            href={githubLink}
            target="_blank"
            rel="noreferrer"
            aria-label="GitHub"
            className="transition hover:text-white"
          >
            <FiGithub size={20} />
          </a>
        )}
      </div>
    </footer>
  );
};

export default Footer;
