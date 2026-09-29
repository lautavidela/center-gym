import type { Metadata } from "next";
import LegalPageLayout from "@/components/legal-page";

export const metadata: Metadata = {
  title: "Términos y Condiciones",
  description:
    "Términos y Condiciones del uso del sistema MTGym para gimnasios y sus socios.",
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

export default function TerminosPage() {
  return (
    <LegalPageLayout title="Términos y Condiciones" updated="29 de septiembre de 2026">
      <Section title="1. El servicio">
        <p>
          MTGym es un sistema de gestión para gimnasios: alta y seguimiento de
          socios, planes y clases, cobro de cuotas, asistencias, ingresos y
          consulta pública de membresías. Al usar MTGym en representación de un
          gimnasio, aceptás estos Términos y Condiciones.
        </p>
      </Section>

      <Section title="2. Uso del sistema">
        <p>
          El gimnasio es responsable de cargar datos reales y actualizados de sus
          socios (nombre, DNI, email y teléfono) y de usarlos solo para la
          gestión de la membresía. Está prohibido ingresar información falsa,
          usarla fuera del ámbito del gimnasio o compartir las credenciales de
          administración con terceros.
        </p>
      </Section>

      <Section title="3. Cuotas y vencimientos">
        <p>
          Cada socio registra una membresía con plan y precio. El sistema calcula
          los vencimientos y renueva automáticamente la cuota por un mes adicional
          cuando se registra un pago. MTGym no cobra ni gestiona pagos en nombre
          de los gimnasios; el cobro se acuerda entre el gimnasio y su socio.
        </p>
      </Section>

      <Section title="4. PIN del socio">
        <p>
          Cuando un socio consulta su cuota por DNI y crea un PIN, este se guarda
          de forma segura (hash) y sirve para identificar al titular en la
          consulta pública. El socio puede cambiarlo o recuperarlo desde la misma
          consulta mediante un código enviado por email.
        </p>
      </Section>

      <Section title="5. Disponibilidad y cambios">
        <p>
          MTGym se ofrece “tal cual”, con el objetivo de mantenerse disponible la
          mayor parte del tiempo, pero no garantiza disponibilidad ininterrumpida.
          Podemos modificar funciones, el precio o los presentes Términos cuando
          sea necesario; los cambios se publicarán en esta página.
        </p>
      </Section>

      <Section title="6. Responsabilidad">
        <p>
          MTGym es una herramienta de registro y consulta. Las decisiones sobre
          cobros, suspensiones y atención de los socios son responsabilidad
          exclusiva de cada gimnasio. MTGym no se responsabiliza por pérdidas
          derivadas del mal uso del sistema o de datos cargados de forma
          incorrecta.
        </p>
      </Section>

      <Section title="7. Contacto">
        <p>
          Para consultas sobre estos Términos escribinos a{" "}
          <span className="font-medium text-zinc-900">
            contactomtgym@gmail.com
          </span>
          .
        </p>
      </Section>
    </LegalPageLayout>
  );
}