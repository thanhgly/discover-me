import { Link } from "react-router-dom";

const Nav = () => {
  return (
    <nav className="m-5 flex flex-wrap items-center justify-between bg-transparent p-2">
      <Link to="./" className="text-4xl font-bold">
        <a>T</a>
        <a className=" text-lime-400">L</a>
      </Link>
      <Link to="./contact" className="btn">
        Contact
      </Link>
    </nav>
  );
};

export default Nav;
