import { PrismaClient, resourceType } from "@prisma/client";
import { hash } from "bcrypt";

const prisma = new PrismaClient();

async function main() {
  const hashedPassword = await hash("securepassword123", 10);

  const user = await prisma.user.create({
    data: {
      first_name: "María",
      last_name: "González",
      email: "maria.gonzalez@ecopyme.mx",
      password: hashedPassword,
      pyme: {
        create: {
          name: "EcoPyme Sostenible",
          description:
            "PyME mexicana dedicada a la producción artesanal responsable, con enfoque en eficiencia de recursos y equidad laboral.",
          address: "Av. Reforma 120, CDMX, México",
          phone: "+52 55 1234 5678",
          email: "contacto@ecopyme.mx",

          // 🔹 RECURSOS AMBIENTALES (bimestral, tendencias variadas realistas)
          resources: {
            createMany: {
              data: (() => {
                const data = [];
                const start = new Date("2024-01-01");
                const months = 12; // 2 años = 12 bimestres
                let agua = 1200; // Agua: -5% por periodo (buena conservación)
                let luz = 850;   // Luz: -2.5% por periodo (eficiencia moderada)
                let gas = 620;   // Gas: variable (algunos incrementos, otros decrementos)
                let transporte = 450; // Transporte: variable (eficiencia en logística)

                // Factores de variación para gas (más realista)
                const gasFactors = [0.97, 0.95, 0.98, 1.02, 0.96, 1.01, 0.99, 0.97, 1.03, 0.98, 0.96, 0.99];
                // Factores de variación para transporte
                const transporteFactors = [0.98, 0.96, 0.94, 0.95, 0.93, 0.92, 0.94, 0.91, 0.90, 0.89, 0.88, 0.87];

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
                    },
                    {
                      name: "Consumo de transporte",
                      type: resourceType.TRANSPORTE,
                      consumption: parseFloat(transporte.toFixed(2)),
                      date,
                    }
                  );

                  agua *= 0.95; // reduce 5% por periodo
                  luz *= 0.975; // reduce 2.5% por periodo
                  gas *= gasFactors[i]; // variación realista
                  transporte *= transporteFactors[i]; // mejora gradual en eficiencia
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
