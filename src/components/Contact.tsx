const Contact = () => {
  return (
    <div>
      <h1>Contact Me</h1>
      <div>
        <div>
          <h3>Get in touch</h3>
          <form>
            <label htmlFor="name">
              Enter your name*
              <input type="text" />
            </label>
            <label htmlFor="email">
              Enter your email*
              <input type="text" />
            </label>
            <label htmlFor="subject">
              Enter your subject*
              <input type="text" />
            </label>
            <label htmlFor="message">
              Enter your message*
              <input type="text" />
            </label>
            <button>Send</button>
          </form>
        </div>
        <div>
          <div>Phone</div>
          <div>Email</div>
          <div>Address</div>
        </div>
      </div>
    </div>
  );
};

export default Contact;
