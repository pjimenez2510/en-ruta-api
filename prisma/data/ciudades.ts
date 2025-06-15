import { Prisma } from '@prisma/client';
import { Decimal } from '@prisma/client/runtime/library';

export const ciudades: Prisma.CiudadCreateInput[] = [
  // PROVINCIA DE PICHINCHA
  {
    nombre: 'Quito',
    provincia: 'Pichincha',
    latitud: new Decimal(-0.180653),
    longitud: new Decimal(-78.467834),
    activo: true,
  },
  {
    nombre: 'Cayambe',
    provincia: 'Pichincha',
    latitud: new Decimal(0.041016),
    longitud: new Decimal(-78.146484),
    activo: true,
  },
  {
    nombre: 'Machachi',
    provincia: 'Pichincha',
    latitud: new Decimal(-0.510417),
    longitud: new Decimal(-78.567708),
    activo: true,
  },
  {
    nombre: 'Tabacundo',
    provincia: 'Pichincha',
    latitud: new Decimal(0.041667),
    longitud: new Decimal(-78.233333),
    activo: true,
  },

  // PROVINCIA DE GUAYAS
  {
    nombre: 'Guayaquil',
    provincia: 'Guayas',
    latitud: new Decimal(-2.170998),
    longitud: new Decimal(-79.922359),
    activo: true,
  },
  {
    nombre: 'Milagro',
    provincia: 'Guayas',
    latitud: new Decimal(-2.134167),
    longitud: new Decimal(-79.594444),
    activo: true,
  },
  {
    nombre: 'Daule',
    provincia: 'Guayas',
    latitud: new Decimal(-1.863889),
    longitud: new Decimal(-79.976944),
    activo: true,
  },
  {
    nombre: 'Durán',
    provincia: 'Guayas',
    latitud: new Decimal(-2.170417),
    longitud: new Decimal(-79.839167),
    activo: true,
  },
  {
    nombre: 'Playas',
    provincia: 'Guayas',
    latitud: new Decimal(-2.628889),
    longitud: new Decimal(-80.388333),
    activo: true,
  },

  // PROVINCIA DE AZUAY
  {
    nombre: 'Cuenca',
    provincia: 'Azuay',
    latitud: new Decimal(-2.9),
    longitud: new Decimal(-79.005),
    activo: true,
  },
  {
    nombre: 'Gualaceo',
    provincia: 'Azuay',
    latitud: new Decimal(-2.892778),
    longitud: new Decimal(-78.779444),
    activo: true,
  },
  {
    nombre: 'Paute',
    provincia: 'Azuay',
    latitud: new Decimal(-2.776944),
    longitud: new Decimal(-78.756944),
    activo: true,
  },

  // PROVINCIA DE MANABÍ
  {
    nombre: 'Portoviejo',
    provincia: 'Manabí',
    latitud: new Decimal(-1.054167),
    longitud: new Decimal(-80.455),
    activo: true,
  },
  {
    nombre: 'Manta',
    provincia: 'Manabí',
    latitud: new Decimal(-0.954722),
    longitud: new Decimal(-80.732222),
    activo: true,
  },
  {
    nombre: 'Chone',
    provincia: 'Manabí',
    latitud: new Decimal(-0.691667),
    longitud: new Decimal(-80.094167),
    activo: true,
  },
  {
    nombre: 'Bahía de Caráquez',
    provincia: 'Manabí',
    latitud: new Decimal(-0.6),
    longitud: new Decimal(-80.424722),
    activo: true,
  },
  {
    nombre: 'Montecristi',
    provincia: 'Manabí',
    latitud: new Decimal(-1.044722),
    longitud: new Decimal(-80.659722),
    activo: true,
  },

  // PROVINCIA DE EL ORO
  {
    nombre: 'Machala',
    provincia: 'El Oro',
    latitud: new Decimal(-3.258333),
    longitud: new Decimal(-79.955556),
    activo: true,
  },
  {
    nombre: 'Pasaje',
    provincia: 'El Oro',
    latitud: new Decimal(-3.326944),
    longitud: new Decimal(-79.808333),
    activo: true,
  },
  {
    nombre: 'Huaquillas',
    provincia: 'El Oro',
    latitud: new Decimal(-3.478056),
    longitud: new Decimal(-80.230556),
    activo: true,
  },
  {
    nombre: 'Santa Rosa',
    provincia: 'El Oro',
    latitud: new Decimal(-3.448889),
    longitud: new Decimal(-79.959722),
    activo: true,
  },

  // PROVINCIA DE TUNGURAHUA
  {
    nombre: 'Ambato',
    provincia: 'Tungurahua',
    latitud: new Decimal(-1.24),
    longitud: new Decimal(-78.63),
    activo: true,
  },
  {
    nombre: 'Baños',
    provincia: 'Tungurahua',
    latitud: new Decimal(-1.396944),
    longitud: new Decimal(-78.422222),
    activo: true,
  },
  {
    nombre: 'Pelileo',
    provincia: 'Tungurahua',
    latitud: new Decimal(-1.331667),
    longitud: new Decimal(-78.545),
    activo: true,
  },

  // PROVINCIA DE CHIMBORAZO
  {
    nombre: 'Riobamba',
    provincia: 'Chimborazo',
    latitud: new Decimal(-1.67),
    longitud: new Decimal(-78.6475),
    activo: true,
  },
  {
    nombre: 'Alausí',
    provincia: 'Chimborazo',
    latitud: new Decimal(-2.200833),
    longitud: new Decimal(-78.843056),
    activo: true,
  },
  {
    nombre: 'Guano',
    provincia: 'Chimborazo',
    latitud: new Decimal(-1.608333),
    longitud: new Decimal(-78.63),
    activo: true,
  },

  // PROVINCIA DE LOJA
  {
    nombre: 'Loja',
    provincia: 'Loja',
    latitud: new Decimal(-3.993056),
    longitud: new Decimal(-79.205),
    activo: true,
  },
  {
    nombre: 'Catamayo',
    provincia: 'Loja',
    latitud: new Decimal(-3.986667),
    longitud: new Decimal(-79.353889),
    activo: true,
  },
  {
    nombre: 'Cariamanga',
    provincia: 'Loja',
    latitud: new Decimal(-4.331944),
    longitud: new Decimal(-79.545833),
    activo: true,
  },

  // PROVINCIA DE IMBABURA
  {
    nombre: 'Ibarra',
    provincia: 'Imbabura',
    latitud: new Decimal(0.35),
    longitud: new Decimal(-78.1225),
    activo: true,
  },
  {
    nombre: 'Otavalo',
    provincia: 'Imbabura',
    latitud: new Decimal(0.234167),
    longitud: new Decimal(-78.261389),
    activo: true,
  },
  {
    nombre: 'Cotacachi',
    provincia: 'Imbabura',
    latitud: new Decimal(0.3),
    longitud: new Decimal(-78.263889),
    activo: true,
  },

  // PROVINCIA DE COTOPAXI
  {
    nombre: 'Latacunga',
    provincia: 'Cotopaxi',
    latitud: new Decimal(-0.9325),
    longitud: new Decimal(-78.615),
    activo: true,
  },
  {
    nombre: 'La Maná',
    provincia: 'Cotopaxi',
    latitud: new Decimal(-0.940833),
    longitud: new Decimal(-79.224444),
    activo: true,
  },
  {
    nombre: 'Saquisilí',
    provincia: 'Cotopaxi',
    latitud: new Decimal(-0.826944),
    longitud: new Decimal(-78.665833),
    activo: true,
  },

  // PROVINCIA DE LOS RÍOS
  {
    nombre: 'Babahoyo',
    provincia: 'Los Ríos',
    latitud: new Decimal(-1.8025),
    longitud: new Decimal(-79.534167),
    activo: true,
  },
  {
    nombre: 'Quevedo',
    provincia: 'Los Ríos',
    latitud: new Decimal(-1.03),
    longitud: new Decimal(-79.463056),
    activo: true,
  },
  {
    nombre: 'Ventanas',
    provincia: 'Los Ríos',
    latitud: new Decimal(-1.44),
    longitud: new Decimal(-79.458333),
    activo: true,
  },
  {
    nombre: 'Mocache',
    provincia: 'Los Ríos',
    latitud: new Decimal(-1.183333),
    longitud: new Decimal(-79.488056),
    activo: true,
  },

  // PROVINCIA DE ESMERALDAS
  {
    nombre: 'Esmeraldas',
    provincia: 'Esmeraldas',
    latitud: new Decimal(0.966667),
    longitud: new Decimal(-79.65),
    activo: true,
  },
  {
    nombre: 'Atacames',
    provincia: 'Esmeraldas',
    latitud: new Decimal(0.869444),
    longitud: new Decimal(-79.846389),
    activo: true,
  },
  {
    nombre: 'Quinindé',
    provincia: 'Esmeraldas',
    latitud: new Decimal(0.325),
    longitud: new Decimal(-79.468056),
    activo: true,
  },

  // PROVINCIA DE CAÑAR
  {
    nombre: 'Azogues',
    provincia: 'Cañar',
    latitud: new Decimal(-2.738889),
    longitud: new Decimal(-78.844722),
    activo: true,
  },
  {
    nombre: 'Cañar',
    provincia: 'Cañar',
    latitud: new Decimal(-2.56),
    longitud: new Decimal(-78.940278),
    activo: true,
  },
  {
    nombre: 'La Troncal',
    provincia: 'Cañar',
    latitud: new Decimal(-2.423056),
    longitud: new Decimal(-79.339167),
    activo: true,
  },

  // PROVINCIA DE BOLÍVAR
  {
    nombre: 'Guaranda',
    provincia: 'Bolívar',
    latitud: new Decimal(-1.593056),
    longitud: new Decimal(-79.0),
    activo: true,
  },
  {
    nombre: 'San Miguel',
    provincia: 'Bolívar',
    latitud: new Decimal(-1.710833),
    longitud: new Decimal(-79.05),
    activo: true,
  },

  // PROVINCIA DE CARCHI
  {
    nombre: 'Tulcán',
    provincia: 'Carchi',
    latitud: new Decimal(0.812222),
    longitud: new Decimal(-77.717778),
    activo: true,
  },
  {
    nombre: 'San Gabriel',
    provincia: 'Carchi',
    latitud: new Decimal(0.588889),
    longitud: new Decimal(-77.831667),
    activo: true,
  },

  // PROVINCIA DE SUCUMBÍOS
  {
    nombre: 'Nueva Loja (Lago Agrio)',
    provincia: 'Sucumbíos',
    latitud: new Decimal(0.093056),
    longitud: new Decimal(-76.195),
    activo: true,
  },
  {
    nombre: 'Shushufindi',
    provincia: 'Sucumbíos',
    latitud: new Decimal(0.175833),
    longitud: new Decimal(-76.641389),
    activo: true,
  },

  // PROVINCIA DE ORELLANA
  {
    nombre: 'Puerto Francisco de Orellana (El Coca)',
    provincia: 'Orellana',
    latitud: new Decimal(-0.462778),
    longitud: new Decimal(-76.987222),
    activo: true,
  },
  {
    nombre: 'Loreto',
    provincia: 'Orellana',
    latitud: new Decimal(-0.704444),
    longitud: new Decimal(-77.283056),
    activo: true,
  },

  // PROVINCIA DE NAPO
  {
    nombre: 'Tena',
    provincia: 'Napo',
    latitud: new Decimal(-0.993056),
    longitud: new Decimal(-77.813056),
    activo: true,
  },
  {
    nombre: 'Archidona',
    provincia: 'Napo',
    latitud: new Decimal(-0.908333),
    longitud: new Decimal(-77.808333),
    activo: true,
  },

  // PROVINCIA DE PASTAZA
  {
    nombre: 'Puyo',
    provincia: 'Pastaza',
    latitud: new Decimal(-1.483333),
    longitud: new Decimal(-78.0),
    activo: true,
  },
  {
    nombre: 'Shell',
    provincia: 'Pastaza',
    latitud: new Decimal(-1.493333),
    longitud: new Decimal(-78.063889),
    activo: true,
  },

  // PROVINCIA DE MORONA SANTIAGO
  {
    nombre: 'Macas',
    provincia: 'Morona Santiago',
    latitud: new Decimal(-2.31),
    longitud: new Decimal(-78.121389),
    activo: true,
  },
  {
    nombre: 'Sucúa',
    provincia: 'Morona Santiago',
    latitud: new Decimal(-2.459722),
    longitud: new Decimal(-78.163889),
    activo: true,
  },

  // PROVINCIA DE ZAMORA CHINCHIPE
  {
    nombre: 'Zamora',
    provincia: 'Zamora Chinchipe',
    latitud: new Decimal(-4.066667),
    longitud: new Decimal(-78.95),
    activo: true,
  },
  {
    nombre: 'Yantzaza',
    provincia: 'Zamora Chinchipe',
    latitud: new Decimal(-3.825),
    longitud: new Decimal(-78.758333),
    activo: true,
  },

  // PROVINCIA DE GALÁPAGOS
  {
    nombre: 'Puerto Baquerizo Moreno',
    provincia: 'Galápagos',
    latitud: new Decimal(-0.9),
    longitud: new Decimal(-89.6),
    activo: true,
  },
  {
    nombre: 'Puerto Ayora',
    provincia: 'Galápagos',
    latitud: new Decimal(-0.742222),
    longitud: new Decimal(-90.312222),
    activo: true,
  },

  // PROVINCIA DE SANTO DOMINGO DE LOS TSÁCHILAS
  {
    nombre: 'Santo Domingo',
    provincia: 'Santo Domingo de los Tsáchilas',
    latitud: new Decimal(-0.2525),
    longitud: new Decimal(-79.175),
    activo: true,
  },

  // PROVINCIA DE SANTA ELENA
  {
    nombre: 'Santa Elena',
    provincia: 'Santa Elena',
    latitud: new Decimal(-2.226944),
    longitud: new Decimal(-80.858333),
    activo: true,
  },
  {
    nombre: 'La Libertad',
    provincia: 'Santa Elena',
    latitud: new Decimal(-2.233333),
    longitud: new Decimal(-80.910556),
    activo: true,
  },
  {
    nombre: 'Salinas',
    provincia: 'Santa Elena',
    latitud: new Decimal(-2.214167),
    longitud: new Decimal(-80.955833),
    activo: true,
  },
];
