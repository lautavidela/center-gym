import type { Metadata } from "next";
import LegalPageLayout from "@/components/legal-page";

export const metadata: Metadata = {
  title: "Política de Cookies",
  description:
    "Política de Cookies de MTGym: qué cookies usamos y cómo gestionarlas.",
};

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 className="text-xl font-bold tracking-tight">{title}</h2>
      <div className="mt-2 space-y-3 text-sm leading-relaxed text-zinc-600">
        {children}
      </div>
    </section>
  );
}

export default function CookiesPage() {
  return (
    <LegalPageLayout title="Política de Cookies" updated="29 de septiembre de 2026">
      <Section title="1. Qué son las cookies">
        <p>
          Las cookies son pequeños archivos que el navegador guarda en tu
          dispositivo al visitar un sitio. Se usan para recordar preferencias,
          mantener una sesión iniciada o medir el uso de la página.
        </p>
      </Section>

      <Section title="2. Qué cookies usa MTGym">
        <p>
          Usamos una cookie de sesión necesaria para que el panel de
          administración recuerde que iniciaste sesión mientras navegás el
          sistema. Sin ella no podrías mantenerte logueado entre páginas. No
          usamos cookies de publicidad ni de seguimiento de terceros.
        </p>
      </Section>

      <Section title="3. Datos que guardamos en tu dispositivo">
        <p>
          Además de la cookie de sesión, el sitio puede guardar preferencias
          locales (como indicadores de gravedad o estados elegidos) para que la
          experiencia sea más cómoda. Estos datos nunca salen de tu navegador ni
          se comparten con terceros.
        </p>
      </Section>

      <Section title="4. Cómo gestionar las cookies">
        <p>
          Podés borrar o bloquear las cookies desde la configuración de tu
          navegador. Tené en cuenta que, si bloqueás la cookie de sesión, el
          panel de administración no funcionará correctamente porque no podrás
          mantenerte logueado.
        </p>
      </Section>
    </LegalPageLayout>
  );
}