import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // Admin user
  const hashedPassword = await bcrypt.hash('johndoe123', 10);
  await prisma.user.upsert({
    where: { email: 'john@doe.com' },
    update: {},
    create: {
      email: 'john@doe.com',
      name: 'Administrador',
      password: hashedPassword,
      role: 'admin',
    },
  });

  // Sample equipment from Excel analysis
  const equipmentData = [
    { nombre: 'ALMACEN01', direccionIp: '10.0.0.42', direccionMac: '68:51:34:C9:D0:E8', fabricante: null, tipoEquipo: 'computadora', estado: 'activo' },
    { nombre: 'CONTABILIDAD', direccionIp: '10.0.0.15', direccionMac: 'A4:F1:E8:55:11:66', fabricante: 'Apple, Inc.', tipoEquipo: 'telefono', estado: 'activo' },
    { nombre: 'CAJA01', direccionIp: '10.0.0.90', direccionMac: '00:0B:78:92:59:A0', fabricante: 'Verifone', tipoEquipo: 'otro', estado: 'activo' },
    { nombre: 'SERVICIOS', direccionIp: '10.0.0.100', direccionMac: 'A4:99:47:51:94:D6', fabricante: 'Hewlett Packard', tipoEquipo: 'computadora', estado: 'activo' },
    { nombre: 'Contabilidad_Ale', direccionIp: '10.0.0.3', direccionMac: 'F0:27:65:F5:FF:1F', fabricante: 'Murata Manufacturing Co.', tipoEquipo: 'telefono', estado: 'activo' },
    { nombre: 'DESKTOP-TGAU97J', direccionIp: '10.0.0.4', direccionMac: '1C:99:4C:39:0D:C4', fabricante: 'Dell Inc.', tipoEquipo: 'computadora', estado: 'activo' },
    { nombre: 'EPSONE633D0', direccionIp: '10.0.0.50', direccionMac: '00:34:DA:00:56:32', fabricante: 'PEGATRON CORPORATION', tipoEquipo: 'impresora', estado: 'activo' },
    { nombre: 'LIZ', direccionIp: '10.0.0.60', direccionMac: '04:DB:56:00:3A:91', fabricante: 'HUAWEI TECHNOLOGIES', tipoEquipo: 'telefono', estado: 'activo' },
    { nombre: 'CAM-ENTRADA', direccionIp: '10.0.0.224', direccionMac: 'BC:16:65:F7:D8:C6', fabricante: 'Hangzhou Hikvision Digital Technology', tipoEquipo: 'camara', estado: 'activo' },
    { nombre: 'Niccole', direccionIp: '10.0.0.70', direccionMac: 'A4:F1:E8:55:22:77', fabricante: 'Apple, Inc.', tipoEquipo: 'telefono', estado: 'activo' },
    { nombre: 'ROUTER-PRINCIPAL', direccionIp: '10.0.0.1', direccionMac: 'D4:6E:0E:12:34:56', fabricante: 'Ubiquiti Networks Inc.', tipoEquipo: 'repetidor', estado: 'activo' },
    { nombre: 'CAM-ALMACEN', direccionIp: '10.0.0.225', direccionMac: 'BC:16:65:F7:D8:C7', fabricante: 'Hangzhou Hikvision Digital Technology', tipoEquipo: 'camara', estado: 'activo' },
  ];

  for (const eq of equipmentData) {
    await prisma.equipment.upsert({
      where: { direccionIp: eq.direccionIp },
      update: {},
      create: eq,
    });
  }

  // Licenses (13 categories)
  const licensesData = [
    { nombre: 'ICG', proveedor: 'ICG Systems', costoAnual: 2400, fechaInicio: new Date('2026-01-01'), fechaVencimiento: new Date('2026-12-31') },
    { nombre: 'Bookifi App Profesionales', proveedor: 'Bookifi', costoAnual: 1200, fechaInicio: new Date('2026-01-01'), fechaVencimiento: new Date('2026-12-31') },
    { nombre: 'App Reverse Adm Pro Bookifi', proveedor: 'Bookifi', costoAnual: 960, fechaInicio: new Date('2026-03-01'), fechaVencimiento: new Date('2027-02-28') },
    { nombre: 'Office 365', proveedor: 'Microsoft', costoAnual: 1800, fechaInicio: new Date('2026-01-15'), fechaVencimiento: new Date('2027-01-14') },
    { nombre: 'Antivirus', proveedor: 'Norton/McAfee', costoAnual: 480, fechaInicio: new Date('2026-04-01'), fechaVencimiento: new Date('2027-03-31') },
    { nombre: 'Windows Remote', proveedor: 'Microsoft', costoAnual: 600, fechaInicio: new Date('2026-01-01'), fechaVencimiento: new Date('2026-12-31') },
    { nombre: 'Servidor Nube', proveedor: 'AWS/Azure', costoAnual: 3600, fechaInicio: new Date('2026-01-01'), fechaVencimiento: new Date('2026-12-31') },
    { nombre: 'Facturación Electrónica', proveedor: 'DGII/Proveedor Local', costoAnual: 720, fechaInicio: new Date('2026-06-01'), fechaVencimiento: new Date('2027-05-31') },
    { nombre: 'Licencias Software Nómina', proveedor: 'Proveedor Nómina', costoAnual: 1440, fechaInicio: new Date('2026-01-01'), fechaVencimiento: new Date('2026-12-31') },
    { nombre: 'Publicidad Instagram', proveedor: 'Meta', costoAnual: 2400, fechaInicio: new Date('2026-01-01'), fechaVencimiento: new Date('2026-12-31') },
    { nombre: 'Soporte y Asistencia Ponchador', proveedor: 'Proveedor Ponchador', costoAnual: 360, fechaInicio: new Date('2026-01-01'), fechaVencimiento: new Date('2026-12-31') },
    { nombre: 'Pago de Dominio Anual', proveedor: 'GoDaddy/Namecheap', costoAnual: 120, fechaInicio: new Date('2026-02-01'), fechaVencimiento: new Date('2027-01-31') },
    { nombre: 'Licencias por Dominio', proveedor: 'Proveedor Dominio', costoAnual: 240, fechaInicio: new Date('2026-02-01'), fechaVencimiento: new Date('2027-01-31') },
  ];

  for (const lic of licensesData) {
    const existing = await prisma.license.findFirst({ where: { nombre: lic.nombre } });
    if (!existing) {
      await prisma.license.create({ data: { ...lic, estado: 'activa' } });
    }
  }

  // Monthly consumptions (3)
  const consumptionsData = [
    { nombre: 'Uso de Mensajería WhatsApp', costoMensual: 50, proveedor: 'Meta/WhatsApp Business', responsable: 'Marketing' },
    { nombre: 'Licencias de Spotify', costoMensual: 30, proveedor: 'Spotify', responsable: 'Operaciones' },
    { nombre: 'Licencias de Power BI', costoMensual: 120, proveedor: 'Microsoft', responsable: 'Gerencia' },
  ];

  for (const cons of consumptionsData) {
    const existing = await prisma.monthlyConsumption.findFirst({ where: { nombre: cons.nombre } });
    if (!existing) {
      await prisma.monthlyConsumption.create({ data: { ...cons, estado: 'activo' } });
    }
  }

  // Third party supports (3)
  const supportsData = [
    { nombre: 'Orlando / Software ICG', contacto: 'Orlando', servicios: 'Soporte de software ICG, configuración y mantenimiento del sistema de punto de venta', costoMensual: 500, costoAnual: 6000, estado: 'activo' },
    { nombre: 'Javis / Hardware', contacto: 'Javis', servicios: 'Soporte de hardware, reparación de equipos, mantenimiento preventivo y correctivo', costoMensual: 400, costoAnual: 4800, estado: 'activo' },
    { nombre: 'Empresa de Cámaras', contacto: 'Empresa de Cámaras', servicios: 'Instalación, mantenimiento y monitoreo de cámaras de seguridad', costoMensual: 300, costoAnual: 3600, estado: 'activo' },
  ];

  for (const sup of supportsData) {
    const existing = await prisma.thirdPartySupport.findFirst({ where: { nombre: sup.nombre } });
    if (!existing) {
      await prisma.thirdPartySupport.create({ data: sup });
    }
  }

  // Projects (4)
  const projectsData = [
    { nombre: 'Data Lake', descripcion: 'Implementación de un data lake centralizado para análisis de datos del negocio', estado: 'en_progreso', responsable: 'TI', presupuesto: 15000, avance: 30, fechaInicio: new Date('2026-01-15') },
    { nombre: 'Resolución Puntos ICG', descripcion: 'Resolución de problemas pendientes en el sistema ICG de punto de venta', estado: 'en_progreso', responsable: 'Orlando', presupuesto: 5000, avance: 60, fechaInicio: new Date('2026-02-01') },
    { nombre: 'Migración a Nueva Plataforma', descripcion: 'Migración de sistemas actuales a nueva plataforma tecnológica', estado: 'planificacion', responsable: 'TI', presupuesto: 25000, avance: 15, fechaInicio: new Date('2026-03-01') },
    { nombre: 'Nueva Plataforma Nómina', descripcion: 'Implementación de nueva plataforma para gestión de nómina y RRHH', estado: 'en_progreso', responsable: 'RRHH/TI', presupuesto: 10000, avance: 45, fechaInicio: new Date('2026-02-15') },
  ];

  for (const proj of projectsData) {
    const existing = await prisma.project.findFirst({ where: { nombre: proj.nombre } });
    if (!existing) {
      await prisma.project.create({ data: proj });
    }
  }

  console.log('Seeding complete!');
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
