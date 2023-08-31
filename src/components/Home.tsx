import { useState } from "react";
import ChatBox from "./ChatBox";
import personalInfo from "../../data/info.js";
import { FiLinkedin, FiGithub } from "react-icons/fi";
import { RxDividerVertical } from "react-icons/rx";

const Home = () => {
  const [showChat, setShowChat] = useState(false);

  const { firstName, lastName, title, bio, githubLink, linkedinLink } =
    personalInfo;

  return (
    <>
      <div className="m-[10%] flex flex-row p-10 text-left text-white">
        <div className="flex w-6/12 flex-col items-start">
          <div className="text-xl">Hello, my name is </div>
          <div className="text-9xl font-bold">
            {firstName} {lastName}
          </div>
          <div className="text-4xl font-bold text-lime-400"> {title} </div>
          <div className="w-auto p-3 text-xl">{bio}</div>
          <div className="w-8/12 text-center">
            <button>Download CV</button>
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
          <FiLinkedin size={30} />
        </a>
        <a className="text-lime-400">
          <RxDividerVertical size={30} />
        </a>
        <a href={githubLink} target="_blank">
          <FiGithub size={30} />
        </a>
      </footer>
    </>
  );
};

export default Home;
