import { Link } from "react-router-dom";

const Nav = () => {
  return (
    <nav className="m-5 flex flex-wrap items-center justify-between bg-transparent p-2">
      <Link to="./" className="text-4xl font-bold">
        <a>T</a>
        <a className=" text-gray-500">L</a>
      </Link>
      <Link
        to="./contact"
        className="mt-4 inline-block rounded-lg border-2 border-white px-4 py-2 text-lg leading-none text-white hover:border-transparent hover:bg-white hover:text-black lg:mt-0"
      >
        Contact
      </Link>
    </nav>
  );
};

export default Nav;
