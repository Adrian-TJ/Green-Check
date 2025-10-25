import { PrismaClient, resourceType } from "@prisma/client";
const prisma = new PrismaClient();

async function main() {
  const user = await prisma.user.create({
    data: {
      first_name: "María",
      last_name: "González",
      email: "maria.gonzalez@ecopyme.mx",
      password: "securepassword123",
      pyme: {
        create: {
          name: "EcoPyme Sostenible",
          description:
            "PyME mexicana dedicada a la producción artesanal responsable, con enfoque en eficiencia de recursos y equidad laboral.",
          address: "Av. Reforma 120, CDMX, México",
          phone: "+52 55 1234 5678",
          email: "contacto@ecopyme.mx",

          // 🔹 RECURSOS AMBIENTALES (bimestral, tendencia -3%)
          resources: {
            createMany: {
              data: (() => {
                const data = [];
                const start = new Date("2024-01-01");
                const months = 12; // 2 años = 12 bimestres
                let agua = 1200;
                let luz = 850;
                let gas = 620;
                for (let i = 0; i < months; i++) {
                  const date = new Date(start);
                  date.setMonth(i * 2);

                  data.push(
                    {
                      name: "Consumo de agua",
                      type: resourceType.AGUA,
                      consumption: parseFloat(agua.toFixed(2)),
                      date,
                    },
                    {
                      name: "Consumo de luz",
                      type: resourceType.LUZ,
                      consumption: parseFloat(luz.toFixed(2)),
                      date,
                    },
                    {
                      name: "Consumo de gas",
                      type: resourceType.GAS,
                      consumption: parseFloat(gas.toFixed(2)),
                      date,
                    }
                  );

                  agua *= 0.97; // reduce 3%
                  luz *= 0.97;
                  gas *= 0.97;
                }
                return data;
              })(),
            },
          },

          // 🔹 GOBERNANZA (implementación gradual de prácticas)
          governance: {
            createMany: {
              data: [
                {
                  codigo_etica: false,
                  anti_corrupcion: false,
                  risk_file_url: "https://ecopyme.mx/docs/riesgos_v1.pdf",
                  date: new Date("2024-01-01"),
                },
                {
                  codigo_etica: true,
                  anti_corrupcion: false,
                  risk_file_url: "https://ecopyme.mx/docs/riesgos_v2.pdf",
                  date: new Date("2024-05-01"),
                },
                {
                  codigo_etica: true,
                  anti_corrupcion: true,
                  risk_file_url: "https://ecopyme.mx/docs/riesgos_v3.pdf",
                  date: new Date("2024-09-01"),
                },
                {
                  codigo_etica: true,
                  anti_corrupcion: true,
                  risk_file_url: "https://ecopyme.mx/docs/riesgos_v4.pdf",
                  date: new Date("2025-01-01"),
                },
                {
                  codigo_etica: true,
                  anti_corrupcion: true,
                  risk_file_url: "https://ecopyme.mx/docs/riesgos_v5.pdf",
                  date: new Date("2025-07-01"),
                },
              ],
            },
          },

          // 🔹 SOCIAL (tendencias positivas en equidad, capacitación y satisfacción)
          social: {
            createMany: {
              data: (() => {
                const data = [];
                const start = new Date("2024-01-01");
                const months = 12;
                const men = 15;
                let women = 5;
                const menLead = 5;
                let womenLead = 1;
                let training = 20;
                let satisfaction = 0.72;
                let insured = 10;
                const uninsured = 5;

                for (let i = 0; i < months; i++) {
                  const date = new Date(start);
                  date.setMonth(i * 2);

                  data.push({
                    men,
                    women,
                    men_in_leadership: menLead,
                    women_in_leadership: womenLead,
                    training_hours: Math.round(training),
                    satisfaction_rate: parseFloat(satisfaction.toFixed(2)),
                    community_programs: i >= 2, // a partir de mayo 2024
                    insured_employees: insured,
                    uninsured_employees: uninsured,
                    date,
                  });

                  // 📈 tendencias
                  if (i % 3 === 0 && i > 0) women += 1; // más mujeres contratadas cada 6 meses
                  if (i % 4 === 0 && i > 0) womenLead += 1; // aumento en liderazgo femenino
                  training *= 1.05; // +5 % cada bimestre
                  satisfaction = Math.min(satisfaction + 0.015, 0.92); // mejora gradual
                  insured += 1;
                }

                return data;
              })(),
            },
          },
        },
      },
    },
    include: {
      pyme: true,
    },
  });

  console.log(
    "✅ PyME con evolución bimestral 2024–2025 creada:",
    user?.pyme?.name
  );
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error(e);
    prisma.$disconnect();
  });
