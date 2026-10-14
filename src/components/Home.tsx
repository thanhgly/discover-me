import { useState } from "react";
import ChatBox from "./ChatBox";
import personalInfo from "../../data/info";
import { FiLinkedin, FiGithub } from "react-icons/fi";
import { RxDividerVertical } from "react-icons/rx";

const Home = () => {
  const [showChat, setShowChat] = useState(false);

  const { firstName, lastName, title, bio, githubLink, linkedinLink, cvLink } =
    personalInfo;

  return (
    <>
      <div className="m-[10%] flex flex-row place-content-center p-10 text-left text-white">
        <div className="flex w-6/12 flex-col">
          <div className="text-3xl">Hello, my name is </div>
          <div className="text-9xl font-bold">
            {firstName} {lastName}
          </div>
          <div className="py-5 text-4xl font-bold text-lime-400"> {title} </div>
          <div className="w-full max-w-2xl py-5 text-3xl">{bio}</div>
          <div className="w-8/12 text-center">
            <a className="btn" href={cvLink} target="_blank">
              Download CV
            </a>
          </div>
        </div>
        <div className=" w-6/12 self-center text-center">
          {showChat ? (
            <ChatBox />
          ) : (
            <button onClick={() => setShowChat(true)}>Let's chat</button>
          )}
        </div>
      </div>
      <footer>
        <a href={linkedinLink} target="_blank">
          <FiLinkedin size={40} />
        </a>
        <a className="text-lime-400">
          <RxDividerVertical size={40} />
        </a>
        <a href={githubLink} target="_blank">
          <FiGithub size={40} />
        </a>
      </footer>
    </>
  );
};

export default Home;
