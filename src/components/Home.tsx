import { Link } from "react-router-dom";
import { FiArrowRight, FiDownload, FiMapPin } from "react-icons/fi";
import ChatBox from "./ChatBox";
import { Experience, Projects, Skills } from "./Resume";
import { profile as personalInfo } from "../lib/profile";

const Home = () => {
  const {
    firstName,
    lastName,
    title,
    bio,
    location,
    cvLink,
    experience,
    projects,
    skills,
  } = personalInfo;

  return (
    <>
      <section className="grid items-center gap-10 py-10 lg:grid-cols-[1fr_minmax(0,28rem)] lg:gap-16 lg:py-20">
        <div>
          {location && (
            <p className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-medium text-zinc-300">
              <FiMapPin className="text-accent" /> {location}
            </p>
          )}
          <p className="text-lg text-zinc-400">Hi, I'm</p>
          <h1 className="mt-1 text-5xl font-extrabold tracking-tight text-balance sm:text-6xl lg:text-7xl">
            {firstName} {lastName}
          </h1>
          <p className="mt-4 text-xl font-semibold text-accent sm:text-2xl">
            {title}
          </p>
          <p className="mt-6 max-w-xl text-lg leading-relaxed text-pretty text-zinc-300">
            {bio}
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link to="/contact" className="btn btn-primary">
              Get in touch <FiArrowRight />
            </Link>
            {cvLink && (
              <a
                className="btn btn-ghost"
                href={cvLink}
                target="_blank"
                rel="noreferrer"
              >
                <FiDownload /> Download CV
              </a>
            )}
          </div>
        </div>
        <ChatBox />
      </section>
      {experience?.length ? <Experience jobs={experience} /> : null}
      {projects?.length ? <Projects projects={projects} /> : null}
      {skills?.length ? <Skills groups={skills} /> : null}
    </>
  );
};

export default Home;
