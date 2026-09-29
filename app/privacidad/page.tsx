import type { Metadata } from "next";
import LegalPageLayout from "@/components/legal-page";

export const metadata: Metadata = {
  title: "Política de Privacidad",
  description:
    "Política de Privacidad de MTGym: qué datos guardamos, para qué y los derechos que tenés sobre ellos.",
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

export default function PrivacidadPage() {
  return (
    <LegalPageLayout title="Política de Privacidad" updated="29 de septiembre de 2026">
      <Section title="1. Qué datos recopilamos">
        <p>
          Por cada gimnasio guardamos sus datos de administración y la lista de
          sus socios. De cada socio registramos: nombre, DNI, email, teléfono,
          la membresía y plan elegido, el historial de cuotas y pagos, las
          asistencias y, si el socio lo configura, un PIN para consultar su
          cuota.
        </p>
      </Section>

      <Section title="2. Para qué usamos los datos">
        <p>
          Usamos los datos únicamente para gestionar la membresía: registrar
          pagos y vencimientos, generar asistencias e ingresos del gimnasio y
          permitir que el socio consulte su estado por DNI. El email se usa solo
          para enviar los códigos de verificación al crear o recuperar un PIN.
        </p>
      </Section>

      <Section title="3. Cómo los protegemos">
        <p>
          El PIN del socio se guarda encriptado con un hash unidireccional, de
          modo que ni siquiera nosotros podemos leerlo. Los códigos de
          verificación son temporales, vencen a los pocos minutos y se borran
          tras su uso. Los accesos de administración están protegidos por
          contraseña y sesiones seguras.
        </p>
      </Section>

      <Section title="4. Con quién compartimos los datos">
        <p>
          Los datos de un gimnasio solo son visibles para ese gimnasio y para su
          propietario. MTGym no vende ni cede los datos a terceros. El socio que
          consulta por DNI solo ve su propia cuota y sus pagos; puede ver la
          cuota de los gimnasios donde está registrado con ese DNI.
        </p>
      </Section>

      <Section title="5. Conservación y baja">
        <p>
          Los datos se conservan mientras el gimnasio use MTGym. Al darse de baja,
          el gimnasio puede solicitar la eliminación completa de sus datos. Si
          sos socio y querés saber qué datos tenemos tuyos, consultá al
          administrador de tu gimnasio.
        </p>
      </Section>

      <Section title="6. Tus derechos">
        <p>
          Tenés derecho a acceder, corregir y solicitar la eliminación de tus
          datos personales. Para ejercerlos escribinos a{" "}
          <span className="font-medium text-zinc-900">
            contactomtgym@gmail.com
          </span>{" "}
          y te respondemos a la brevedad.
        </p>
      </Section>
    </LegalPageLayout>
  );
}