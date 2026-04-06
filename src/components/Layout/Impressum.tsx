import Footer from "./Footer";
import Header from "./Header";

export default function Impressum() {
  const lastUpdatedDate = "April 6, 2026";

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow bg-background py-10 sm:py-14">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
          <div className="text-center mb-8">
            <h1 className="text-3xl sm:text-4xl font-extrabold text-foreground">
              Impressum
            </h1>
            <p className="mt-3 text-muted-foreground">
              Legal information for Holiday Hacker.
            </p>
          </div>

          <div className="surface-card-elevated p-6 sm:p-8 space-y-6">
            <p className="text-sm text-muted-foreground">
              <strong>Last Updated:</strong> {lastUpdatedDate}
            </p>

            <section className="space-y-2">
              <h2 className="text-xl font-bold text-foreground">
                Information according to Section 5 TMG
              </h2>
              <p className="text-foreground">Michiel Van de Vyver</p>
              <p className="text-muted-foreground">
                Registered address available on request.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-xl font-bold text-foreground">Contact</h2>
              <p className="text-foreground">
                Email:{" "}
                <a
                  href="mailto:contact@holidayoptimizer.com"
                  className="underline text-primary hover:text-primary/80"
                >
                  contact@holidayoptimizer.com
                </a>
              </p>
              <p className="text-foreground">
                Website:{" "}
                <a
                  href="https://holidayoptimizer.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline text-primary hover:text-primary/80"
                >
                  https://holidayoptimizer.com
                </a>
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-xl font-bold text-foreground">
                Responsible for content
              </h2>
              <p className="text-muted-foreground">
                Michiel Van de Vyver, operator of Holiday Hacker.
              </p>
            </section>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
