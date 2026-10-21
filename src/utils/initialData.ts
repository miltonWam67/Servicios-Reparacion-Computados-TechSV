import { Client, Technician, SparePart, ServiceOrder, Payment } from '../types';

export const INITIAL_CLIENTS: Client[] = [
  {
    id: 'cli-1',
    name: 'Bufete Jurídico Morales & Asoc.',
    documentId: 'J-30948271-9',
    phone: '+52 55 4123 8890',
    email: 'administracion@moralesjuridico.com',
    address: 'Av. Insurgentes Sur 1450, Piso 6, Ciudad de México',
    company: 'Bufete Jurídico Morales',
    notes: 'Cliente corporativo frecuente. Requiere factura y comprobante detallado.',
    createdAt: '2025-01-10T09:30:00.000Z'
  },
  {
    id: 'cli-2',
    name: 'Dra. Carmen Valencia',
    documentId: 'V-18764210',
    phone: '+52 55 9876 5432',
    email: 'carmen.valencia.med@gmail.com',
    address: 'Calle Durango 88, Col. Roma Norte',
    company: 'Consultorio Médico Dra. Valencia',
    notes: 'Impresora de recetas y laptop de historias clínicas.',
    createdAt: '2025-01-14T11:15:00.000Z'
  },
  {
    id: 'cli-3',
    name: 'Distribuidora Logística Nexo S.A.',
    documentId: 'J-40112998-2',
    phone: '+52 55 3344 5566',
    email: 'sistemas@logisticanexo.com',
    address: 'Parque Industrial Tlalnepantla, Bodega 12',
    company: 'Logística Nexo S.A.',
    notes: 'Mantenimiento preventivo mensual de impresoras térmicas de etiquetas y laptops de almacén.',
    createdAt: '2025-01-20T14:00:00.000Z'
  },
  {
    id: 'cli-4',
    name: 'Ing. Rodrigo Salazar',
    documentId: 'V-22441982',
    phone: '+52 55 7711 2233',
    email: 'rodrigo.salazar.dev@outlook.com',
    address: 'Calle Sonora 45, Condesa',
    company: 'Freelance Software Architect',
    notes: 'Usa su workstation para renderizado 3D y compilación.',
    createdAt: '2025-02-01T10:00:00.000Z'
  },
  {
    id: 'cli-5',
    name: 'Colegio Bilingüe San Patricio',
    documentId: 'J-50221345-0',
    phone: '+52 55 8899 0011',
    email: 'soporte@sanpatricioschool.edu',
    address: 'Av. Universidad 720, Coyoacán',
    company: 'Colegio San Patricio',
    notes: 'Laboratorio de cómputo con 25 PCs y 3 impresoras departamentales.',
    createdAt: '2025-02-15T08:30:00.000Z'
  }
];

export const INITIAL_TECHNICIANS: Technician[] = [
  {
    id: 'tec-1',
    name: 'Ing. Carlos Méndez',
    specialty: 'computadoras',
    phone: '+52 55 1122 3344',
    email: 'carlos.mendez@techfix.com',
    status: 'disponible',
    commissionRate: 35,
    avatarBg: 'bg-blue-600'
  },
  {
    id: 'tec-2',
    name: 'Lic. Laura Morales',
    specialty: 'impresoras',
    phone: '+52 55 5566 7788',
    email: 'laura.morales@techfix.com',
    status: 'ocupado',
    commissionRate: 35,
    avatarBg: 'bg-emerald-600'
  },
  {
    id: 'tec-3',
    name: 'Téc. Roberto Castillo',
    specialty: 'mixto',
    phone: '+52 55 9988 7766',
    email: 'roberto.castillo@techfix.com',
    status: 'disponible',
    commissionRate: 30,
    avatarBg: 'bg-purple-600'
  },
  {
    id: 'tec-4',
    name: 'Téc. Andrés Vega',
    specialty: 'impresoras',
    phone: '+52 55 4433 2211',
    email: 'andres.vega@techfix.com',
    status: 'disponible',
    commissionRate: 30,
    avatarBg: 'bg-amber-600'
  }
];

export const INITIAL_SPARE_PARTS: SparePart[] = [
  // Repuestos Computadoras
  {
    id: 'rep-1',
    sku: 'SSD-NV2-1TB',
    name: 'Unidad SSD Kingston NV2 1TB PCIe 4.0 M.2 NVMe',
    category: 'computadoras',
    subcategory: 'Almacenamiento SSD',
    compatibleWith: 'Laptops y Desktops con slot M.2 NVMe (HP, Dell, Lenovo, Asus)',
    stock: 12,
    minStock: 4,
    costPrice: 42.00,
    sellingPrice: 68.00,
    location: 'Estante A-1'
  },
  {
    id: 'rep-2',
    sku: 'RAM-DDR4-16G-SODIMM',
    name: 'Memoria RAM Kingston Fury 16GB DDR4 3200MHz SODIMM',
    category: 'computadoras',
    subcategory: 'Memorias RAM',
    compatibleWith: 'Laptops Dell Latitude, HP Pavilion, Lenovo ThinkPad',
    stock: 8,
    minStock: 3,
    costPrice: 28.00,
    sellingPrice: 45.00,
    location: 'Estante A-2'
  },
  {
    id: 'rep-3',
    sku: 'PASTA-ARCTIC-MX4',
    name: 'Pasta Térmica Arctic MX-4 Jeringa 4g de Alto Rendimiento',
    category: 'computadoras',
    subcategory: 'Refrigeración y Mantenimiento',
    compatibleWith: 'CPUs y GPUs de Laptops y Torres Desktop',
    stock: 15,
    minStock: 5,
    costPrice: 6.50,
    sellingPrice: 14.00,
    location: 'Cajón B-1'
  },
  {
    id: 'rep-4',
    sku: 'PSU-EVGA-600W',
    name: 'Fuente de Poder EVGA 600W 80 Plus Bronze Certificada',
    category: 'computadoras',
    subcategory: 'Fuentes de Poder',
    compatibleWith: 'Equipos de escritorio estándar ATX',
    stock: 4,
    minStock: 2,
    costPrice: 38.00,
    sellingPrice: 62.00,
    location: 'Estante C-3'
  },
  {
    id: 'rep-5',
    sku: 'SCREEN-156-30P',
    name: 'Pantalla LED 15.6" Slim 30 Pines FHD IPS Sin Brackets',
    category: 'computadoras',
    subcategory: 'Pantallas Laptops',
    compatibleWith: 'Dell Inspiron 3501, Lenovo IdeaPad 3, HP 15-dw',
    stock: 2,
    minStock: 3, // ALERTA BAJO STOCK
    costPrice: 52.00,
    sellingPrice: 95.00,
    location: 'Estante A-4'
  },
  {
    id: 'rep-6',
    sku: 'KBD-LENOVO-E14',
    name: 'Teclado Original Español Lenovo ThinkPad E14 Gen 2/3/4',
    category: 'computadoras',
    subcategory: 'Teclados Laptop',
    compatibleWith: 'Lenovo ThinkPad E14 series',
    stock: 3,
    minStock: 2,
    costPrice: 22.00,
    sellingPrice: 48.00,
    location: 'Cajón B-3'
  },
  {
    id: 'rep-7',
    sku: 'CARG-UNIV-65W-TYPEC',
    name: 'Cargador Original USB-C 65W PD Inteligente para Laptop',
    category: 'computadoras',
    subcategory: 'Cargadores y Baterías',
    compatibleWith: 'Lenovo, HP, Dell, MacBook Air, Asus con carga USB-C',
    stock: 7,
    minStock: 3,
    costPrice: 16.00,
    sellingPrice: 35.00,
    location: 'Estante A-3'
  },

  // Repuestos Impresoras
  {
    id: 'rep-8',
    sku: 'ROLLER-HP-M402',
    name: 'Kit Rodillo de Arrastre y Separador (Pickup Roller) HP LaserJet',
    category: 'impresoras',
    subcategory: 'Rodillos y Gomas',
    compatibleWith: 'HP LaserJet Pro M402, M404, M426, M428 MFP',
    stock: 9,
    minStock: 4,
    costPrice: 7.00,
    sellingPrice: 18.00,
    location: 'Estante D-1'
  },
  {
    id: 'rep-9',
    sku: 'FUSER-HP-M428',
    name: 'Unidad de Fusor Original HP RM2-5399 110V',
    category: 'impresoras',
    subcategory: 'Fusores y Mantenimiento',
    compatibleWith: 'HP LaserJet Pro M402dn, M404dw, M426fdw, M428fdw',
    stock: 1,
    minStock: 2, // ALERTA BAJO STOCK
    costPrice: 85.00,
    sellingPrice: 145.00,
    location: 'Estante D-4'
  },
  {
    id: 'rep-10',
    sku: 'PAD-EPSON-L3150',
    name: 'Almohadillas de Desecho con Caja y Chip para Epson EcoTank',
    category: 'impresoras',
    subcategory: 'Kits Almohadillas',
    compatibleWith: 'Epson EcoTank L3110, L3150, L3210, L3250, L5190',
    stock: 14,
    minStock: 5,
    costPrice: 5.50,
    sellingPrice: 16.00,
    location: 'Estante D-2'
  },
  {
    id: 'rep-11',
    sku: 'PRINTHEAD-CANON-BH1',
    name: 'Cabezal de Impresión Canon BH-1 Negro Original',
    category: 'impresoras',
    subcategory: 'Cabezales',
    compatibleWith: 'Canon Pixma Serie G1100, G2100, G3100, G4100, G3110',
    stock: 2,
    minStock: 3, // ALERTA BAJO STOCK
    costPrice: 32.00,
    sellingPrice: 58.00,
    location: 'Cajón B-4'
  },
  {
    id: 'rep-12',
    sku: 'TONER-HP-58A',
    name: 'Cartucho de Toner HP 58A (CF258A) Negro de Alto Rendimiento',
    category: 'impresoras',
    subcategory: 'Toners y Cartuchos',
    compatibleWith: 'HP LaserJet Pro M404, M428 Series',
    stock: 6,
    minStock: 3,
    costPrice: 45.00,
    sellingPrice: 75.00,
    location: 'Estante E-1'
  },
  {
    id: 'rep-13',
    sku: 'INK-EPSON-504-BK',
    name: 'Botella de Tinta Epson T504 Negra Original 127ml',
    category: 'impresoras',
    subcategory: 'Tintas Continuas',
    compatibleWith: 'Epson L4150, L4160, L6161, L6171, L6191',
    stock: 11,
    minStock: 4,
    costPrice: 9.00,
    sellingPrice: 19.50,
    location: 'Estante E-2'
  },
  {
    id: 'rep-14',
    sku: 'TH-EPSON-TM20',
    name: 'Cabezal Térmico para Impresora de Tickets Epson TM-T20 / TM-T88',
    category: 'impresoras',
    subcategory: 'Repuestos Punto de Venta',
    compatibleWith: 'Epson TM-T20II, TM-T20III, TM-T88V',
    stock: 3,
    minStock: 2,
    costPrice: 24.00,
    sellingPrice: 52.00,
    location: 'Estante D-3'
  }
];

export const INITIAL_ORDERS: ServiceOrder[] = [
  {
    id: 'OS-2025-0101',
    clientId: 'cli-1',
    technicianId: 'tec-1',
    deviceType: 'computadora',
    deviceCategory: 'laptop',
    brand: 'Dell',
    model: 'Latitude 5420 Business',
    serialNumber: 'DL5420-8910B',
    passwordOrPin: 'abogado2024',
    accessoriesIncluded: ['Cargador original 65W USB-C', 'Funda acolchada negra'],
    physicalConditionNotes: 'Equipo en muy buen estado, bisagras firmes, desgaste leve en barra espaciadora.',
    reportedFault: 'El equipo se congela al abrir múltiples archivos PDF y tarda más de 5 minutos en arrancar el sistema operativo. Se calienta intensamente.',
    technicalDiagnosis: 'Disco mecánico original con sectores defectuosos y pasta térmica cristalizada en procesador Intel Core i5. Ventilador obstruido por polvo denso.',
    repairDetails: 'Mantenimiento térmico completo con pasta Arctic MX-4, limpieza de disipador. Migración y clonación a SSD Kingston NVMe 1TB. Optimización de arranque en Windows 11 Pro.',
    status: 'lista_entrega',
    priority: 'alta',
    createdAt: '2025-02-24T10:15:00.000Z',
    estimatedCompletionDate: '2025-02-26T18:00:00.000Z',
    completedAt: '2025-02-26T15:30:00.000Z',
    laborCost: 45.00,
    usedParts: [
      {
        partId: 'rep-1',
        sku: 'SSD-NV2-1TB',
        name: 'Unidad SSD Kingston NV2 1TB PCIe 4.0 M.2 NVMe',
        quantity: 1,
        unitPrice: 68.00,
        totalPrice: 68.00
      },
      {
        partId: 'rep-3',
        sku: 'PASTA-ARCTIC-MX4',
        name: 'Pasta Térmica Arctic MX-4 Jeringa 4g de Alto Rendimiento',
        quantity: 1,
        unitPrice: 14.00,
        totalPrice: 14.00
      }
    ],
    discount: 0,
    taxRate: 0.16,
    totalAmount: 147.32, // (45 + 82) * 1.16 = 147.32
    amountPaid: 147.32,
    paymentStatus: 'pagado',
    logs: [
      {
        id: 'log-1',
        timestamp: '2025-02-24T10:15:00.000Z',
        author: 'Recepción',
        status: 'recibida',
        note: 'Equipo ingresado por Lic. Roberto Morales. Informa sobrecalentamiento y lentitud extrema.'
      },
      {
        id: 'log-2',
        timestamp: '2025-02-24T14:20:00.000Z',
        author: 'Ing. Carlos Méndez',
        status: 'en_diagnostico',
        note: 'Se confirma temperatura pico de 94°C en CPU y disco con 18% de salud en CrystalDiskInfo.'
      },
      {
        id: 'log-3',
        timestamp: '2025-02-25T11:00:00.000Z',
        author: 'Ing. Carlos Méndez',
        status: 'en_reparacion',
        note: 'Cliente aprobó presupuesto telefónicamente. Se procede a instalación de NVMe 1TB y mantenimiento térmico.'
      },
      {
        id: 'log-4',
        timestamp: '2025-02-26T15:30:00.000Z',
        author: 'Ing. Carlos Méndez',
        status: 'lista_entrega',
        note: 'Pruebas de estrés superadas a 62°C estables. Arranque en 9 segundos. Equipo listo para retiro.'
      }
    ]
  },
  {
    id: 'OS-2025-0102',
    clientId: 'cli-2',
    technicianId: 'tec-2',
    deviceType: 'impresora',
    deviceCategory: 'impresora_laser',
    brand: 'HP',
    model: 'LaserJet Pro MFP M428fdw',
    serialNumber: 'HP428-VBN9021',
    accessoriesIncluded: ['Cable de poder', 'Bandeja de papel 2'],
    physicalConditionNotes: 'Tapa del escáner en buen estado, restos de tóner derramado en bandeja interna.',
    reportedFault: 'Atasca el papel en cada impresión justamente al ingresar al área de fusión. Arruga las hojas y emite un crujido metálico.',
    technicalDiagnosis: 'Rodillo de arrastre desgastado y película de la unidad fusora rasgada por objeto extraño (grapa). Requiere cambio de rodillos y kit fusor.',
    repairDetails: 'Sustitución de pickup rollers, instalación de nueva unidad fusora HP RM2-5399, limpieza profunda de sensor óptico y prueba de 50 copias sin fallas.',
    status: 'en_reparacion',
    priority: 'urgente',
    createdAt: '2025-02-26T09:00:00.000Z',
    estimatedCompletionDate: '2025-02-28T16:00:00.000Z',
    laborCost: 55.00,
    usedParts: [
      {
        partId: 'rep-8',
        sku: 'ROLLER-HP-M402',
        name: 'Kit Rodillo de Arrastre y Separador HP LaserJet',
        quantity: 1,
        unitPrice: 18.00,
        totalPrice: 18.00
      },
      {
        partId: 'rep-9',
        sku: 'FUSER-HP-M428',
        name: 'Unidad de Fusor Original HP RM2-5399 110V',
        quantity: 1,
        unitPrice: 145.00,
        totalPrice: 145.00
      }
    ],
    discount: 10.00,
    taxRate: 0.16,
    totalAmount: 241.28, // (55 + 163 - 10) * 1.16 = 208 * 1.16 = 241.28
    amountPaid: 100.00,
    paymentStatus: 'parcial',
    logs: [
      {
        id: 'log-5',
        timestamp: '2025-02-26T09:00:00.000Z',
        author: 'Recepción',
        status: 'recibida',
        note: 'Ingreso urgente para consultorio médico.'
      },
      {
        id: 'log-6',
        timestamp: '2025-02-26T12:00:00.000Z',
        author: 'Lic. Laura Morales',
        status: 'en_reparacion',
        note: 'Se desmontó fusor dañado con grapa incrustada. Se montan piezas nuevas.'
      }
    ]
  },
  {
    id: 'OS-2025-0103',
    clientId: 'cli-3',
    technicianId: 'tec-4',
    deviceType: 'impresora',
    deviceCategory: 'impresora_termica',
    brand: 'Epson',
    model: 'TM-T20III Pos Receipt Printer',
    serialNumber: 'EP20-998811A',
    accessoriesIncluded: ['Transformador de 24V', 'Cable USB', 'Rollo de prueba'],
    physicalConditionNotes: 'Equipo de uso rudo en almacén, marcas de cinta adhesiva.',
    reportedFault: 'Imprime las líneas con texto borroso a la derecha y no corta el papel automáticamente.',
    technicalDiagnosis: 'Cuchilla de guillotina trabada con pelusa de papel térmico y cabezal con desgaste parcial en matriz térmica.',
    repairDetails: '',
    status: 'esperando_repuesto',
    priority: 'media',
    createdAt: '2025-02-25T16:00:00.000Z',
    estimatedCompletionDate: '2025-03-02T12:00:00.000Z',
    laborCost: 35.00,
    usedParts: [
      {
        partId: 'rep-14',
        sku: 'TH-EPSON-TM20',
        name: 'Cabezal Térmico para Impresora de Tickets Epson TM-T20',
        quantity: 1,
        unitPrice: 52.00,
        totalPrice: 52.00
      }
    ],
    discount: 0,
    taxRate: 0.16,
    totalAmount: 100.92, // (35 + 52) * 1.16 = 100.92
    amountPaid: 0,
    paymentStatus: 'pendiente',
    logs: [
      {
        id: 'log-7',
        timestamp: '2025-02-25T16:00:00.000Z',
        author: 'Recepción',
        status: 'recibida',
        note: 'Ingresado por transportista de Logística Nexo.'
      },
      {
        id: 'log-8',
        timestamp: '2025-02-26T10:30:00.000Z',
        author: 'Téc. Andrés Vega',
        status: 'esperando_repuesto',
        note: 'Se limpió cuchilla. Se solicitó cabezal térmico de repuesto para reemplazo definitivo.'
      }
    ]
  },
  {
    id: 'OS-2025-0104',
    clientId: 'cli-4',
    technicianId: 'tec-1',
    deviceType: 'computadora',
    deviceCategory: 'desktop',
    brand: 'Custom PC Workstation',
    model: 'Ryzen 9 5900X / RTX 3080',
    serialNumber: 'CUST-WS-2023',
    accessoriesIncluded: ['Cable de alimentación reforzado'],
    physicalConditionNotes: 'Gabinete Fractal Design con panel de cristal templado intacto.',
    reportedFault: 'La máquina se apaga súbitamente cuando se inicia un render en Blender o Unreal Engine. Olor a quemado leve por la parte trasera.',
    technicalDiagnosis: 'Fuente de poder anterior de 500W genérica colapsó por sobrecarga en riel de 12V. Placa madre y GPU afortunadamente intactas.',
    repairDetails: 'Sustitución e instalación de Fuente EVGA 600W 80 Plus Bronze con ordenamiento de cableado mallado y prueba con FurMark + Cinebench durante 2 horas.',
    status: 'entregada',
    priority: 'alta',
    createdAt: '2025-02-18T11:00:00.000Z',
    estimatedCompletionDate: '2025-02-20T17:00:00.000Z',
    completedAt: '2025-02-20T14:30:00.000Z',
    deliveredAt: '2025-02-21T10:00:00.000Z',
    laborCost: 40.00,
    usedParts: [
      {
        partId: 'rep-4',
        sku: 'PSU-EVGA-600W',
        name: 'Fuente de Poder EVGA 600W 80 Plus Bronze Certificada',
        quantity: 1,
        unitPrice: 62.00,
        totalPrice: 62.00
      }
    ],
    discount: 5.00,
    taxRate: 0.16,
    totalAmount: 112.52, // (40 + 62 - 5) * 1.16 = 97 * 1.16 = 112.52
    amountPaid: 112.52,
    paymentStatus: 'pagado',
    logs: [
      {
        id: 'log-9',
        timestamp: '2025-02-18T11:00:00.000Z',
        author: 'Recepción',
        status: 'recibida',
        note: 'Ingreso de workstation.'
      },
      {
        id: 'log-10',
        timestamp: '2025-02-20T14:30:00.000Z',
        author: 'Ing. Carlos Méndez',
        status: 'lista_entrega',
        note: 'Banco de pruebas superado al 100% de carga continua.'
      },
      {
        id: 'log-11',
        timestamp: '2025-02-21T10:00:00.000Z',
        author: 'Recepción',
        status: 'entregada',
        note: 'Entregado a Ing. Rodrigo Salazar con comprobante y garantía de 90 días.'
      }
    ]
  },
  {
    id: 'OS-2025-0105',
    clientId: 'cli-5',
    technicianId: 'tec-3',
    deviceType: 'computadora',
    deviceCategory: 'laptop',
    brand: 'Lenovo',
    model: 'ThinkPad E14 Gen 2',
    serialNumber: 'PF2K8900',
    passwordOrPin: 'sanpatricio2025',
    accessoriesIncluded: ['Cargador USB-C Lenovo 65W'],
    physicalConditionNotes: 'Marcas de uso escolar en bordes. Bisagras y pantalla perfectas.',
    reportedFault: 'Teclas "Enter", "Espacio" y fila de números no responden tras derrame accidental de agua. Equipo enciende normalmente.',
    technicalDiagnosis: 'Cortocircuito en membrana interna del teclado. Placa madre libre de sulfato gracias al sellado de seguridad ThinkPad.',
    repairDetails: 'Desarmado completo y sustitución de teclado original español Lenovo ThinkPad E14. Pruebas de todas las teclas y función Fn.',
    status: 'pruebas_calidad',
    priority: 'media',
    createdAt: '2025-02-25T12:00:00.000Z',
    estimatedCompletionDate: '2025-02-27T17:00:00.000Z',
    laborCost: 35.00,
    usedParts: [
      {
        partId: 'rep-6',
        sku: 'KBD-LENOVO-E14',
        name: 'Teclado Original Español Lenovo ThinkPad E14',
        quantity: 1,
        unitPrice: 48.00,
        totalPrice: 48.00
      }
    ],
    discount: 0,
    taxRate: 0.16,
    totalAmount: 96.28, // (35 + 48) * 1.16 = 96.28
    amountPaid: 50.00,
    paymentStatus: 'parcial',
    logs: [
      {
        id: 'log-12',
        timestamp: '2025-02-25T12:00:00.000Z',
        author: 'Recepción',
        status: 'recibida',
        note: 'Ingresada por coordinador de sistemas del colegio.'
      },
      {
        id: 'log-13',
        timestamp: '2025-02-26T17:00:00.000Z',
        author: 'Téc. Roberto Castillo',
        status: 'pruebas_calidad',
        note: 'Teclado instalado. Ejecutando software de diagnóstico de entradas.'
      }
    ]
  },
  {
    id: 'OS-2025-0106',
    clientId: 'cli-5',
    technicianId: 'tec-2',
    deviceType: 'impresora',
    deviceCategory: 'impresora_tinta',
    brand: 'Epson',
    model: 'EcoTank L3250 WiFi',
    serialNumber: 'X4K900124',
    accessoriesIncluded: ['Cable de poder', 'Bandejas completas'],
    physicalConditionNotes: 'Buen estado estético general.',
    reportedFault: 'Luces de tinta y papel parpadean alternadamente en rojo. La computadora indica "Almohadillas de tinta de la impresora al final de su vida útil".',
    technicalDiagnosis: 'Contador de impresiones al 100% (bloqueo de seguridad de fábrica por desborde de tinta) y almohadillas saturadas.',
    repairDetails: '',
    status: 'en_diagnostico',
    priority: 'media',
    createdAt: '2025-02-27T08:30:00.000Z',
    estimatedCompletionDate: '2025-02-28T14:00:00.000Z',
    laborCost: 30.00,
    usedParts: [
      {
        partId: 'rep-10',
        sku: 'PAD-EPSON-L3150',
        name: 'Almohadillas de Desecho con Caja y Chip para Epson EcoTank',
        quantity: 1,
        unitPrice: 16.00,
        totalPrice: 16.00
      }
    ],
    discount: 0,
    taxRate: 0.16,
    totalAmount: 53.36, // (30 + 16) * 1.16 = 53.36
    amountPaid: 0,
    paymentStatus: 'pendiente',
    logs: [
      {
        id: 'log-14',
        timestamp: '2025-02-27T08:30:00.000Z',
        author: 'Recepción',
        status: 'recibida',
        note: 'Ingresada con error de fin de vida de almohadillas.'
      },
      {
        id: 'log-15',
        timestamp: '2025-02-27T10:00:00.000Z',
        author: 'Lic. Laura Morales',
        status: 'en_diagnostico',
        note: 'Confirmado contador a 100%. Se procederá al reset digital y reemplazo físico.'
      }
    ]
  }
];

export const INITIAL_PAYMENTS: Payment[] = [
  {
    id: 'pay-1',
    receiptNumber: 'REC-2025-001',
    serviceOrderId: 'OS-2025-0101',
    clientId: 'cli-1',
    date: '2025-02-26T16:00:00.000Z',
    amount: 147.32,
    method: 'transferencia',
    referenceNumber: 'SPEI-78190284',
    notes: 'Liquidación total por servicio Dell Latitude 5420'
  },
  {
    id: 'pay-2',
    receiptNumber: 'REC-2025-002',
    serviceOrderId: 'OS-2025-0102',
    clientId: 'cli-2',
    date: '2025-02-26T12:30:00.000Z',
    amount: 100.00,
    method: 'tarjeta',
    referenceNumber: 'AUTH-554109',
    notes: 'Abono inicial 50% para compra de fusor HP M428'
  },
  {
    id: 'pay-3',
    receiptNumber: 'REC-2025-003',
    serviceOrderId: 'OS-2025-0104',
    clientId: 'cli-4',
    date: '2025-02-21T10:05:00.000Z',
    amount: 112.52,
    method: 'efectivo',
    referenceNumber: 'CAJA-02-881',
    notes: 'Pago total en efectivo contra entrega de workstation'
  },
  {
    id: 'pay-4',
    receiptNumber: 'REC-2025-004',
    serviceOrderId: 'OS-2025-0105',
    clientId: 'cli-5',
    date: '2025-02-25T12:15:00.000Z',
    amount: 50.00,
    method: 'transferencia',
    referenceNumber: 'BBVA-90112837',
    notes: 'Abono anticipado de reparación de teclado ThinkPad'
  }
];
