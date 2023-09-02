const ContactForm = () => {
  return (
    <form className="w-6/12">
      <h2>Contact me</h2>
      <div className="-mx-3 mb-6 flex flex-wrap">
        <div className="group w-full px-3">
          <label htmlFor="full-name">Full name</label>
          <input type="text" id="full-name" placeholder="John/Jane Doe" />
        </div>
      </div>
      <div className="-mx-3 mb-6 flex flex-wrap">
        <div className="group w-full px-3">
          <label htmlFor="email">Email</label>
          <input type="text" id="email" placeholder="name@domain.com" />
        </div>
      </div>
      <div className="-mx-3 mb-6 flex flex-wrap">
        <div className="group w-full px-3">
          <label htmlFor="subject">Subject</label>
          <input
            type="text"
            id="subject"
            placeholder="Your Exciting Announcement"
          />
        </div>
      </div>

      <div className="group">
        <label htmlFor="message">Message</label>
        <textarea
          id="message"
          rows={4}
          className="block w-full max-w-2xl rounded-lg border border-gray-200 bg-gray-200 p-3 text-sm text-gray-700 focus:border-2 focus:border-lime-500 focus:outline-none"
          placeholder="Write your thoughts here..."
        ></textarea>
      </div>

      <button className=" w-1/3">Send</button>
    </form>
  );
};

export default ContactForm;
