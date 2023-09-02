import ContactForm from "./ContactForm";
import { MdAlternateEmail, MdPhone } from "react-icons/md";
import personalInfo from "../../data/info";

const Contact = () => {
  const { emails, phone } = personalInfo;

  return (
    <>
      <div className="mx-[15%] my-[5%] flex flex-row p-10 text-left text-white">
        <ContactForm />

        <div className="w-60"></div>

        <div className="w-6/12 text-left">
          <h2 className="mb-[10%] text-4xl font-bold">Get in touch</h2>
          <div className="grid w-8/12 grid-cols-3 gap-y-20">
            <div>
              <div className="h-[100px] w-[100px] text-lime-400">
                <MdAlternateEmail size={100} />
              </div>
            </div>
            <ul className="col-span-2 grid text-2xl">
              {emails.map((email) => (
                <li>{email}</li>
              ))}
            </ul>
            <div className="h-[100px] w-[100px] text-lime-400">
              <MdPhone size={100} />
            </div>
            <ul className="col-span-2 grid  text-2xl">
              {phone.map((number) => (
                <p>{number}</p>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </>
  );
};

export default Contact;
