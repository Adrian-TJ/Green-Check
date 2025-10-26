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
            "PyME mexicana dedicada a la producción artesanal responsable, con enfoque en eficiencia de recursos, transparencia y equidad laboral.",
          address: "Av. Reforma 120, CDMX, México",
          phone: "+52 55 1234 5678",
          email: "contacto@ecopyme.mx",

          // 🔹 RECURSOS AMBIENTALES (bimestral)
          resources: {
            createMany: {
              data: (() => {
                const data = [];
                const start = new Date("2024-01-01");
                const periods = 12; // 2 años (bimestral)

                let agua = 1300; // m³
                let luz = 850; // kWh
                let gas = 600; // m³
                let transporte = 500; // L gasolina

                const gasFactors = [
                  0.97, 0.95, 0.98, 1.02, 0.96, 1.0, 0.99, 0.97, 1.03, 0.98,
                  0.96, 0.99,
                ];
                const transporteFactors = [
                  0.99, 0.97, 0.95, 0.94, 0.93, 0.91, 0.9, 0.88, 0.87, 0.85,
                  0.84, 0.83,
                ];

                for (let i = 0; i < periods; i++) {
                  const date = new Date(start);
                  date.setMonth(i * 2);

                  data.push(
                    {
                      name: "Consumo de agua",
                      type: resourceType.AGUA,
                      consumption: agua,
                      date,
                    },
                    {
                      name: "Consumo de luz",
                      type: resourceType.LUZ,
                      consumption: luz,
                      date,
                    },
                    {
                      name: "Consumo de gas",
                      type: resourceType.GAS,
                      consumption: gas,
                      date,
                    },
                    {
                      name: "Consumo de transporte",
                      type: resourceType.TRANSPORTE,
                      consumption: transporte,
                      date,
                    }
                  );

                  agua *= 0.97; // Reducción 3% por ahorro
                  luz *= 0.98; // Reducción 2%
                  gas *= gasFactors[i];
                  transporte *= transporteFactors[i];
                }

                return data.map((r) => ({
                  ...r,
                  consumption: parseFloat(r.consumption.toFixed(2)),
                }));
              })(),
            },
          },

          // 🔹 GOBERNANZA
          governance: {
            createMany: {
              data: (() => {
                const data = [];
                const start = new Date("2024-01-01");
                const periods = 12;
                let hasEthics = false;
                let hasAntiCorruption = false;

                for (let i = 0; i < periods; i++) {
                  const date = new Date(start);
                  date.setMonth(i * 2);

                  if (i >= 2) hasEthics = true;
                  if (i >= 4) hasAntiCorruption = true;

                  data.push({
                    codigo_etica_url: hasEthics
                      ? `https://ecopyme.mx/docs/codigo_etica_v${i - 1}.pdf`
                      : null,
                    anti_corrupcion_url: hasAntiCorruption
                      ? `https://ecopyme.mx/docs/anti_corrupcion_v${i - 3}.pdf`
                      : null,
                    risk_file_url: `https://ecopyme.mx/docs/riesgos_v${
                      i + 1
                    }.pdf`,
                    date,
                  });
                }
                return data;
              })(),
            },
          },

          // 🔹 SOCIAL
          social: {
            createMany: {
              data: (() => {
                const data = [];
                const start = new Date("2024-01-01");
                const periods = 12;

                const men = 15;
                let women = 6;
                const menLead = 4;
                let womenLead = 1;
                let training = 22;
                let satisfaction = 0.74;
                let insured = 12;
                const uninsured = 4;

                for (let i = 0; i < periods; i++) {
                  const date = new Date(start);
                  date.setMonth(i * 2);

                  data.push({
                    men,
                    women,
                    men_in_leadership: menLead,
                    women_in_leadership: womenLead,
                    training_hours: Math.round(training),
                    satisfaction_rate: parseFloat(satisfaction.toFixed(2)),
                    community_programs: i >= 2,
                    insured_employees: insured,
                    uninsured_employees: uninsured,
                    date,
                  });

                  // 📈 Tendencias
                  if (i % 3 === 0 && i > 0) women += 1;
                  if (i % 4 === 0 && i > 0) womenLead += 1;
                  training *= 1.04;
                  satisfaction = Math.min(satisfaction + 0.012, 0.92);
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
    "✅ PyME mexicana con evolución bimestral (2024–2025) creada:",
    user?.pyme?.name
  );
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error(e);
    prisma.$disconnect();
  });
