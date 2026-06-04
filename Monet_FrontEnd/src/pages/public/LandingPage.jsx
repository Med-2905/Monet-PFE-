import { useRef, useState } from "react";
import emailjs from "@emailjs/browser";
import { Users, Calendar, Stethoscope } from "lucide-react";
import { Link } from "react-router-dom";

import ThemeToggle from "../../components/ui/ThemeToggle.jsx";
import landingImg from "../../assets/landing.png";

export default function LandingPage() {
  const formRef = useRef(null);

  const [isSending, setIsSending] = useState(false);
  const [message, setMessage] = useState("");

  const [contactForm, setContactForm] = useState({
    from_name: "",
    phone: "",
    user_email: "",
    reason: "",
  });

  function scrollToSection(id) {
    document.getElementById(id)?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  }

  function handleContactChange(e) {
    const { name, value } = e.target;

    setContactForm((current) => ({
      ...current,
      [name]: value,
    }));

    setMessage("");
  }

  async function sendEmail(e) {
    e.preventDefault();
    setMessage("");

    const serviceId = import.meta.env.VITE_EMAILJS_SERVICE_ID;
    const templateId = import.meta.env.VITE_EMAILJS_TEMPLATE_ID;
    const publicKey = import.meta.env.VITE_EMAILJS_PUBLIC_KEY;

    if (!serviceId || !templateId || !publicKey) {
      setMessage("EmailJS configuration is missing.");
      return;
    }

    if (
      !contactForm.from_name.trim() ||
      !contactForm.phone.trim() ||
      !contactForm.user_email.trim() ||
      !contactForm.reason.trim()
    ) {
      setMessage("Please fill all contact fields.");
      return;
    }

    try {
      setIsSending(true);

      const formData = new FormData(formRef.current);

      console.log("EmailJS form data:", {
        from_name: formData.get("from_name"),
        name: formData.get("name"),
        user_email: formData.get("user_email"),
        email: formData.get("email"),
        reply_to: formData.get("reply_to"),
        phone: formData.get("phone"),
        reason: formData.get("reason"),
      });

      await emailjs.sendForm(serviceId, templateId, formRef.current, {
        publicKey,
      });

      setMessage("Message sent successfully.");

      setContactForm({
        from_name: "",
        phone: "",
        user_email: "",
        reason: "",
      });

      formRef.current.reset();
    } catch (error) {
      console.error("EmailJS error:", error);
      setMessage("Failed to send message. Try again.");
    } finally {
      setIsSending(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 transition-colors duration-300 dark:bg-slate-950 dark:text-white">
      <header className="sticky top-0 z-50 flex min-h-20 items-center justify-between border-b border-slate-200 bg-white/90 px-6 backdrop-blur-md transition-colors duration-300 dark:border-slate-800 dark:bg-slate-950/90 md:px-20">
        <button
          type="button"
          onClick={() => scrollToSection("home")}
          className="text-2xl font-extrabold text-blue-600 dark:text-blue-300"
        >
          Monet
        </button>

        <nav className="flex items-center gap-2 md:gap-4">
          <button
            type="button"
            onClick={() => scrollToSection("services")}
            className="rounded-full px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-blue-50 hover:text-blue-600 dark:text-slate-200 dark:hover:bg-slate-800 dark:hover:text-blue-300"
          >
            Services
          </button>

          <button
            type="button"
            onClick={() => scrollToSection("about")}
            className="rounded-full px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-blue-50 hover:text-blue-600 dark:text-slate-200 dark:hover:bg-slate-800 dark:hover:text-blue-300"
          >
            About
          </button>

          <button
            type="button"
            onClick={() => scrollToSection("contact")}
            className="rounded-full bg-blue-600 px-5 py-2 text-sm font-semibold text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-700"
          >
            Contact
          </button>

          <Link
            to="/login"
            className="rounded-full border border-slate-300 bg-white px-5 py-2 text-sm font-bold text-slate-800 transition hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-900 dark:text-white dark:hover:bg-slate-800"
          >
            Login
          </Link>

          <Link
            to="/register"
            className="rounded-full bg-blue-600 px-5 py-2 text-sm font-bold text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-700"
          >
            Register
          </Link>

          <ThemeToggle />
        </nav>
      </header>

      <main>
        <section
          id="home"
          className="grid min-h-[calc(100vh-80px)] scroll-mt-24 items-center gap-12 px-6 py-20 md:grid-cols-2 md:px-20"
        >
          <div className="text-center md:text-left">
            <p className="mb-4 text-sm font-bold uppercase tracking-widest text-blue-600">
              Telemedicine Platform
            </p>

            <h1 className="mb-6 text-5xl font-extrabold leading-tight text-slate-950 dark:text-white md:text-7xl">
              Monet Services
            </h1>

            <p className="mx-auto mb-8 max-w-xl text-lg leading-8 text-slate-600 dark:text-slate-300 md:mx-0">
              Monet helps patients connect with doctors faster and gives doctors
              simple tools to manage appointments and follow patient progress.
            </p>

            <div className="flex flex-wrap justify-center gap-4 md:justify-start">
              <button
                type="button"
                onClick={() => scrollToSection("services")}
                className="rounded-2xl bg-blue-600 px-7 py-4 font-bold text-white shadow-xl shadow-blue-600/25 transition hover:-translate-y-1 hover:bg-blue-700"
              >
                Explore Services
              </button>

              <button
                type="button"
                onClick={() => scrollToSection("contact")}
                className="rounded-2xl border border-blue-200 bg-white px-7 py-4 font-bold text-blue-600 transition hover:bg-blue-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800 dark:hover:text-blue-300"
              >
                Contact Us
              </button>
            </div>
          </div>

          <div className="flex justify-center">
            <div className="relative h-[320px] w-full max-w-[480px] overflow-hidden rounded-[2rem] border border-blue-100 bg-white shadow-2xl shadow-slate-300 dark:border-slate-700 dark:bg-slate-900 dark:shadow-slate-900 md:h-[420px]">
              <img
                src={landingImg}
                alt="Monet telemedicine platform"
                className="h-full w-full object-cover"
              />
            </div>
          </div>
        </section>

        <section
          id="services"
          className="scroll-mt-24 bg-white px-6 py-24 dark:bg-slate-950 md:px-20"
        >
          <div className="mx-auto mb-14 max-w-3xl text-center">
            <p className="mb-4 text-sm font-bold uppercase tracking-widest text-blue-600">
              Services
            </p>

            <h2 className="mb-5 text-4xl font-extrabold text-slate-950 dark:text-white md:text-5xl">
              Our Services
            </h2>

            <p className="text-lg leading-8 text-slate-600 dark:text-slate-300">
              Our services target doctors by making it easier for them to track
              their patients, manage appointments, and organize medical follow-up.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-8 transition hover:-translate-y-2 hover:shadow-2xl hover:shadow-slate-200 dark:border-slate-700 dark:bg-slate-900 dark:hover:shadow-slate-800">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900/30">
                <Users className="text-blue-600 dark:text-blue-400" size={24} />
              </div>
              <h3 className="mb-4 text-2xl font-bold text-slate-950 dark:text-white">
                Patient Tracking
              </h3>
              <p className="leading-7 text-slate-600 dark:text-slate-300">
                Doctors can follow patient records, appointment history, and
                consultation details in one place.
              </p>
            </div>

            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-8 transition hover:-translate-y-2 hover:shadow-2xl hover:shadow-slate-200 dark:border-slate-700 dark:bg-slate-900 dark:hover:shadow-slate-800">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900/30">
                <Calendar className="text-blue-600 dark:text-blue-400" size={24} />
              </div>
              <h3 className="mb-4 text-2xl font-bold text-slate-950 dark:text-white">
                Appointment Management
              </h3>
              <p className="leading-7 text-slate-600 dark:text-slate-300">
                Doctors can accept, refuse, or manage appointments with less
                manual work.
              </p>
            </div>

            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-8 transition hover:-translate-y-2 hover:shadow-2xl hover:shadow-slate-200 dark:border-slate-700 dark:bg-slate-900 dark:hover:shadow-slate-800">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900/30">
                <Stethoscope
                  className="text-blue-600 dark:text-blue-400"
                  size={24}
                />
              </div>
              <h3 className="mb-4 text-2xl font-bold text-slate-950 dark:text-white">
                Medical Follow-up
              </h3>
              <p className="leading-7 text-slate-600 dark:text-slate-300">
                Monet helps organize prescriptions, patient notes, and
                consultation information.
              </p>
            </div>
          </div>
        </section>

        <section
          id="about"
          className="scroll-mt-24 bg-blue-50 px-6 py-24 dark:bg-slate-950 md:px-20"
        >
          <div className="mx-auto max-w-5xl rounded-[2rem] border border-blue-100 bg-white p-8 shadow-2xl shadow-blue-100 dark:border-slate-700 dark:bg-slate-900 dark:shadow-none md:p-14">
            <p className="mb-4 text-sm font-bold uppercase tracking-widest text-blue-600">
              About Monet
            </p>

            <h2 className="mb-5 text-4xl font-extrabold text-slate-950 dark:text-white md:text-5xl">
              Modern Telemedicine Made Simple
            </h2>

            <p className="text-lg leading-8 text-slate-600 dark:text-slate-300">
              Monet is a modern telemedicine platform that makes your life easier
              by helping you connect with your doctor and manage healthcare
              interactions more efficiently.
            </p>
          </div>
        </section>

        <section
          id="contact"
          className="scroll-mt-24 bg-slate-50 px-6 py-24 dark:bg-slate-950 md:px-20"
        >
          <div className="mx-auto mb-12 max-w-3xl text-center">
            <p className="mb-4 text-sm font-bold uppercase tracking-widest text-blue-600">
              Contact
            </p>

            <h2 className="mb-5 text-4xl font-extrabold text-slate-950 dark:text-white md:text-5xl">
              Contact Us
            </h2>

            <p className="text-lg leading-8 text-slate-600 dark:text-slate-300">
              Fill the form below and your message will be sent directly by
              email.
            </p>
          </div>

          <form
            ref={formRef}
            onSubmit={sendEmail}
            className="mx-auto max-w-3xl rounded-[2rem] border border-slate-200 bg-white p-8 shadow-2xl shadow-slate-200 dark:border-slate-700 dark:bg-slate-900 dark:shadow-slate-900 md:p-10"
          >
            <input type="hidden" name="reply_to" value={contactForm.user_email} />
            <input type="hidden" name="email" value={contactForm.user_email} />
            <input type="hidden" name="name" value={contactForm.from_name} />

            <div className="mb-5">
              <label className="mb-2 block font-bold text-slate-800 dark:text-slate-200">
                Full Name
              </label>
              <input
                type="text"
                name="from_name"
                value={contactForm.from_name}
                onChange={handleContactChange}
                placeholder="Enter your full name"
                required
                className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-4 text-slate-900 outline-none transition focus:border-blue-600 focus:ring-4 focus:ring-blue-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:focus:border-blue-500 dark:focus:ring-blue-500/20"
              />
            </div>

            <div className="mb-5">
              <label className="mb-2 block font-bold text-slate-800 dark:text-slate-200">
                Phone Number
              </label>
              <input
                type="tel"
                name="phone"
                value={contactForm.phone}
                onChange={handleContactChange}
                placeholder="Enter your phone number"
                required
                className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-4 text-slate-900 outline-none transition focus:border-blue-600 focus:ring-4 focus:ring-blue-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:focus:border-blue-500 dark:focus:ring-blue-500/20"
              />
            </div>

            <div className="mb-5">
              <label className="mb-2 block font-bold text-slate-800 dark:text-slate-200">
                Email
              </label>
              <input
                type="email"
                name="user_email"
                value={contactForm.user_email}
                onChange={handleContactChange}
                placeholder="Enter your email"
                required
                className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-4 text-slate-900 outline-none transition focus:border-blue-600 focus:ring-4 focus:ring-blue-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:focus:border-blue-500 dark:focus:ring-blue-500/20"
              />
            </div>

            <div className="mb-6">
              <label className="mb-2 block font-bold text-slate-800 dark:text-slate-200">
                Reason of Contact
              </label>
              <textarea
                name="reason"
                value={contactForm.reason}
                onChange={handleContactChange}
                placeholder="Write your reason of contact"
                rows="5"
                required
                className="w-full resize-none rounded-2xl border border-slate-300 bg-white px-4 py-4 text-slate-900 outline-none transition focus:border-blue-600 focus:ring-4 focus:ring-blue-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:focus:border-blue-500 dark:focus:ring-blue-500/20"
              />
            </div>

            <button
              type="submit"
              disabled={isSending}
              className="w-full rounded-2xl bg-blue-600 px-7 py-4 font-bold text-white shadow-xl shadow-blue-600/25 transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSending ? "Sending..." : "Send Message"}
            </button>

            {message && (
              <p className="mt-5 text-center font-bold text-blue-600 dark:text-blue-400">
                {message}
              </p>
            )}
          </form>
        </section>
      </main>

      <footer className="flex flex-col items-center justify-between gap-6 bg-slate-950 px-6 py-10 text-center text-white md:flex-row md:px-20 md:text-left">
        <div>
          <h3 className="text-2xl font-extrabold">Monet</h3>
          <p className="mt-2 text-slate-300">
            Modern telemedicine platform for doctors and patients.
          </p>
        </div>

        <div className="flex gap-6">
          <a
            href="https://github.com/Me-0529"
            target="_blank"
            rel="noreferrer"
            className="font-bold transition hover:text-blue-300"
          >
            GitHub
          </a>

          <a
            href="https://www.linkedin.com/in/Mohamed-Amine-El-Jaoui"
            target="_blank"
            rel="noreferrer"
            className="font-bold transition hover:text-blue-300"
          >
            LinkedIn
          </a>
        </div>
      </footer>
    </div>
  );
}