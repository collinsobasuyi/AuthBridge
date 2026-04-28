import Link from "next/link";
import LoginForm from "@/components/login-form";

export default function LoginPage() {
  return (
    <div className="flex min-h-screen">
      {/* Left branding panel */}
      <div className="relative hidden overflow-hidden lg:flex lg:w-[45%] flex-col justify-between bg-gradient-to-br from-violet-950 via-violet-900 to-violet-800 px-12 py-14">
        <div className="pointer-events-none absolute -right-20 top-1/3 h-72 w-72 rounded-full bg-violet-500/20 blur-3xl" />
        <div className="pointer-events-none absolute -left-10 bottom-1/4 h-48 w-48 rounded-full bg-violet-400/10 blur-2xl" />

        {/* Top: logo */}
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/15 text-sm font-bold text-white backdrop-blur-sm">
            AB
          </div>
          <span className="text-lg font-semibold text-white">AuthBridge</span>
        </div>

        {/* Middle: hero */}
        <div className="relative">
          <p className="mb-4 text-xs font-semibold uppercase tracking-widest text-violet-300">
            Welcome back
          </p>
          <h2 className="text-5xl font-bold leading-tight text-white">
            Good to see<br />you again.
          </h2>
          <p className="mt-5 text-lg leading-relaxed text-violet-200">
            Sign in to manage your account, update your profile, or change your password.
          </p>

          <div className="mt-10 space-y-3">
            {[
              { icon: "✏️", text: "Edit your name from your account page" },
              { icon: "🔑", text: "Change your password at any time" },
              { icon: "🗑️", text: "Delete your account permanently" },
            ].map(({ icon, text }) => (
              <div key={text} className="flex items-center gap-3 text-sm text-violet-100">
                <span>{icon}</span>
                <span>{text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom */}
        <p className="relative text-sm text-violet-400">
          Built by{" "}
          <a
            href="https://collinsobasuyi.com"
            className="text-violet-200 hover:text-white transition"
          >
            Collins Obasuyi
          </a>
        </p>
      </div>

      {/* Right form panel */}
      <div className="flex flex-1 flex-col justify-center bg-white px-6 py-12 sm:px-10 lg:px-16 xl:px-24">
        {/* Mobile logo */}
        <div className="mb-10 flex items-center gap-3 lg:hidden">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-600 text-sm font-bold text-white">
            AB
          </div>
          <span className="text-lg font-semibold text-gray-900">AuthBridge</span>
        </div>

        <div className="mx-auto w-full max-w-md">
          <h1 className="text-4xl font-bold tracking-tight text-gray-900">
            Sign in
          </h1>
          <p className="mt-3 text-base text-gray-500">
            Don&apos;t have an account?{" "}
            <Link
              href="/"
              className="font-semibold text-violet-600 hover:text-violet-700 transition"
            >
              Create one
            </Link>
          </p>

          <div className="mt-10">
            <LoginForm />
          </div>
        </div>
      </div>
    </div>
  );
}
