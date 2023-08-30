import { useState } from "react";
import ChatBox from "./ChatBox";
import personalInfo from "../data/info.js";

const Home = () => {
  const [showChat, setShowChat] = useState(false);

  const { firstName, lastName, title, bio } = personalInfo;

  return (
    <div className="m-[10%] flex flex-row place-content-start p-10 text-left text-white">
      <div className="flex w-6/12 flex-col items-start">
        <text className="text-xl">Hello, my name is </text>
        <text className="text-9xl font-bold">
          {firstName} {lastName}
        </text>
        <div className="text-4xl"> {title} </div>
        <div className="w-auto p-3 text-xl">{bio}</div>
        <div className="w-8/12 text-center">
          <button className="mt-4 inline-block rounded-xl border-2 border-white px-4 py-2 text-lg font-bold leading-none text-white hover:border-transparent hover:bg-white hover:text-black lg:mt-0">
            Download CV
          </button>
        </div>
      </div>
      <div className=" w-6/12 self-center text-center">
        {showChat ? (
          <ChatBox />
        ) : (
          <button
            onClick={() => setShowChat(true)}
            className="mt-4 inline-block rounded-xl border-2 border-white px-4 py-2 text-lg font-bold leading-none text-white hover:border-transparent hover:bg-white hover:text-black lg:mt-0"
          >
            Let's chat
          </button>
        )}
      </div>
    </div>
  );
};

export default Home;
