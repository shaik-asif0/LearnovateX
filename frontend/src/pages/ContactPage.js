import React from "react";

const ContactPage = () => {
  return (
    <div className="max-w-3xl mx-auto p-8">
      <h1 className="text-3xl font-bold mb-4">Contact Us</h1>
      <p className="text-zinc-400 mb-6">
        For support or inquiries, email us at{" "}
        <a
          href="mailto:support@learnovatex.com"
          className="text-[var(--accent-color)] underline"
        >
          support@learnovatex.com
        </a>
        .
      </p>
      <p className="text-zinc-400">
        You can also reach out via the support chat widget (bottom-right).
      </p>
    </div>
  );
};

export default ContactPage;
