import RegistrationForm from "@/components/registration-form";

export default function Home() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-16">
      <div className="w-full max-w-md">
        <div className="rounded-3xl border border-gray-200 bg-white p-8 shadow-sm sm:p-10">
          <div className="mb-8 text-center">
            <div className="mb-4 flex justify-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-violet-600 text-lg font-bold text-white shadow-sm">
                AB
              </div>
            </div>
            <h1 className="text-3xl font-bold text-gray-900">Create an account</h1>
            <p className="mt-2 text-sm text-gray-500">
              AuthBridge · Next.js · FastAPI · PostgreSQL
            </p>
          </div>
          <RegistrationForm />
        </div>
        <p className="mt-6 text-center text-sm text-gray-400">
          Built by{" "}
          <a
            href="https://collinsobasuyi.com"
            className="text-violet-600 hover:underline"
          >
            Collins Obasuyi
          </a>
        </p>
      </div>
    </main>
  );
}
