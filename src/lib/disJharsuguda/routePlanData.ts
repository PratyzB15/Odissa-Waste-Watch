export interface RoutePlanData {
  id: number;
  routeId: string;
  routeName: string;
  routeAbbreviation: string;
  startingGp: string;
  intermediateGps: string[];
  finalGp: string;
  destination: string;
  totalDistance: number;
  workers: {
    name: string;
    contact: string;
  }[];
  scheduledOn: string;
  remarks?: string;
}

export const routePlanData: RoutePlanData[] = [
  // Jharsuguda Block
  {
    id: 1,
    routeId: 'JJHAJMBH',
    routeName: 'JMBH-01',
    routeAbbreviation: 'JMBH-01',
    startingGp: 'Jamera',
    intermediateGps: ['Marakura', 'Badmal'],
    finalGp: 'H.Katapali',
    destination: 'Jharsuguda MRF',
    totalDistance: 18,
    workers: [{ name: 'RITIK MAHANANDA', contact: '9692972027' }],
    scheduledOn: 'As and When required by GP'
  },
  {
    id: 2,
    routeId: 'JJHAHSPM',
    routeName: 'HSPM-02',
    routeAbbreviation: 'HSPM-02',
    startingGp: 'Hirma',
    intermediateGps: ['Sripura', 'Patrapali'],
    finalGp: 'Malda',
    destination: 'Jharsuguda MRF',
    totalDistance: 29,
    workers: [{ name: 'BANBASI JAYAPURIA', contact: '9668366769' }],
    scheduledOn: 'As and When required by GP'
  },
  {
    id: 3,
    routeId: 'JJHADTDK',
    routeName: 'DTDK-03',
    routeAbbreviation: 'DTDK-03',
    startingGp: 'Durlaga',
    intermediateGps: ['Talpatia', 'Dalki'],
    finalGp: 'Katikela',
    destination: 'Jharsuguda MRF',
    totalDistance: 16,
    workers: [{ name: 'TULESWARI NETI', contact: '7077332343' }],
    scheduledOn: 'As and When required by GP'
  },
  // Kirmira Block
  {
    id: 4,
    routeId: 'JKIRASBJ',
    routeName: 'ASBJ-01',
    routeAbbreviation: 'ASBJ-01',
    startingGp: 'Arda',
    intermediateGps: ['Sulehi', 'Bhimjore'],
    finalGp: 'Jharmunda',
    destination: 'Jharsuguda MRF',
    totalDistance: 28,
    workers: [{ name: 'PINKU PODHA', contact: '9438072756' }],
    scheduledOn: 'As and When required by GP'
  },
  {
    id: 5,
    routeId: 'JKIRBKNG',
    routeName: 'BKNG-02',
    routeAbbreviation: 'BKNG-02',
    startingGp: 'Bandhapali',
    intermediateGps: ['Kirmira', 'Naxapali'],
    finalGp: 'G-panpali',
    destination: 'Jharsuguda MRF',
    totalDistance: 29,
    workers: [{ name: 'SANDHYARANI PODHA', contact: '8926186447' }],
    scheduledOn: 'As and When required by GP'
  },
  // Kolabira Block
  {
    id: 6,
    routeId: 'JKOLJPKSS',
    routeName: 'JPKSS-01',
    routeAbbreviation: 'JPKSS-01',
    startingGp: 'Jhirlapali',
    intermediateGps: ['Kulihamal', 'Pokharasale', 'Samasingha'],
    finalGp: 'Sodamal',
    destination: 'Jharsuguda MRF',
    totalDistance: 29,
    workers: [{ name: 'SAMBHU SAHU', contact: '8260915040' }],
    scheduledOn: 'As and When required by GP'
  },
  {
    id: 7,
    routeId: 'JKOLKRKP',
    routeName: 'KRKP-02',
    routeAbbreviation: 'KRKP-02',
    startingGp: 'Kolabira',
    intermediateGps: ['Raghunathpali', 'Keldamal'],
    finalGp: 'Parmanpur',
    destination: 'Jharsuguda MRF',
    totalDistance: 27,
    workers: [{ name: 'TIKESWARI BAG', contact: '7077024189' }],
    scheduledOn: 'As and When required by GP'
  },
  // Laikera Block
  {
    id: 8,
    routeId: 'JLAIBLSK',
    routeName: 'BLSK-01',
    routeAbbreviation: 'BLSK-01',
    startingGp: 'Bhatlaida',
    intermediateGps: ['Laikera', 'Sarangalai'],
    finalGp: 'Kuleimura',
    destination: 'Jharsuguda MRF',
    totalDistance: 55,
    workers: [{ name: 'BAPI ROHIDAS', contact: '8658994308' }],
    scheduledOn: 'As and When required by GP'
  },
  {
    id: 9,
    routeId: 'JLAIBJTP',
    routeName: 'BJTP-02',
    routeAbbreviation: 'BJTP-02',
    startingGp: 'Babuchipidhi',
    intermediateGps: ['Jamal', 'Tileimal'],
    finalGp: 'Pakelpada',
    destination: 'Jharsuguda MRF',
    totalDistance: 60,
    workers: [{ name: 'GUNTHU ROHIDAS', contact: '7846859956' }],
    scheduledOn: 'As and When required by GP'
  },
  {
    id: 10,
    routeId: 'JLAISKN',
    routeName: 'SKN-03',
    routeAbbreviation: 'SKN-03',
    startingGp: 'Sahaspur',
    intermediateGps: ['Khuntamal'],
    finalGp: 'Niktimal',
    destination: 'Jharsuguda MRF',
    totalDistance: 65,
    workers: [{ name: 'KANTI KISAN', contact: '7978165353' }],
    scheduledOn: 'As and When required by GP'
  },
  // Brajarajnagar circuits
  {
    id: 11,
    routeId: 'JJHAGRLKC',
    routeName: 'GRLKC-01',
    routeAbbreviation: 'GRLKC-01',
    startingGp: 'Gourmal',
    intermediateGps: ['Rajpur', 'Lohising', 'Kudopali'],
    finalGp: 'Chandinimal',
    destination: 'Brajarajnagar MRF',
    totalDistance: 20,
    workers: [{ name: 'URBASI BHOI', contact: '6370721186' }],
    scheduledOn: 'As and When required by GP'
  },
  // Lakhanpur Block
  {
    id: 12,
    routeId: 'JLAKBPKLB',
    routeName: 'BPKLB-01',
    routeAbbreviation: 'BPKLB-01',
    startingGp: 'Banjari',
    intermediateGps: ['Pipilimal', 'Kudaloi', 'Lakhnpur'],
    finalGp: 'Baghamunda',
    destination: 'Brajarajnagar MRF',
    totalDistance: 26,
    workers: [{ name: 'BAPI ROHIDAS', contact: '8658994308' }],
    scheduledOn: 'As and When required by GP'
  },
  // Belpahar circuits
  {
    id: 13,
    routeId: 'JLAKTRKDP',
    routeName: 'TRKDP-01',
    routeAbbreviation: 'TRKDP-01',
    startingGp: 'Tilia',
    intermediateGps: ['Rampela', 'Kumarbandh', 'Dalagaon'],
    finalGp: 'Pipilikani',
    destination: 'Belpahar MRF',
    totalDistance: 40,
    workers: [{ name: 'PUSPANJALI MEHER', contact: '9777850200' }],
    scheduledOn: 'As and When required by GP'
  },
  {
    id: 14,
    routeId: 'JLAKKBTSR',
    routeName: 'KBTSR-02',
    routeAbbreviation: 'KBTSR-02',
    startingGp: 'Kushorlai',
    intermediateGps: ['Bandhabahal', 'Telenpali', 'Sarandamal'],
    finalGp: 'Remenda',
    destination: 'Belpahar MRF',
    totalDistance: 23,
    workers: [{ name: 'AMBIKA KHADIA', contact: '7077521457' }],
    scheduledOn: 'As and When required by GP'
  },
  {
    id: 15,
    routeId: 'JLAKSPBKS',
    routeName: 'SPBKS-03',
    routeAbbreviation: 'SPBKS-03',
    startingGp: 'Sunari',
    intermediateGps: ['Pandri', 'Bhournkhol', 'Kadamdihi'],
    finalGp: 'Samarbaga',
    destination: 'Belpahar MRF',
    totalDistance: 35,
    workers: [{ name: 'MAMINA KHAMARI', contact: '9938530914' }],
    scheduledOn: 'As and When required by GP'
  },
  {
    id: 16,
    routeId: 'JLAKJKMPP',
    routeName: 'JKMPP-04',
    routeAbbreviation: 'JKMPP-04',
    startingGp: 'Jamgaon',
    intermediateGps: ['Katarba', 'Machhida', 'Palsda'],
    finalGp: 'Panchagoan',
    destination: 'Belpahar MRF',
    totalDistance: 40,
    workers: [{ name: 'PADMINI BHOI', contact: '8658290672' }],
    scheduledOn: 'As and When required by GP'
  },
  {
    id: 17,
    routeId: 'JLAKVABK',
    routeName: 'VABK-05',
    routeAbbreviation: 'VABK-05',
    startingGp: 'Vikampali',
    intermediateGps: ['Attabira', 'Badimal'],
    finalGp: 'Kanaktora',
    destination: 'Belpahar MRF',
    totalDistance: 55,
    workers: [{ name: 'KARISHMA PADHAN', contact: '8093442844' }],
    scheduledOn: 'As and When required by GP'
  },
  {
    id: 18,
    routeId: 'JLAKPCRK',
    routeName: 'PCRK-06',
    routeAbbreviation: 'PCRK-06',
    startingGp: 'Pithinda',
    intermediateGps: ['Charpali', 'Remta'],
    finalGp: 'Kundheikela',
    destination: 'Belpahar MRF',
    totalDistance: 75,
    workers: [{ name: 'MANJULATA SETH', contact: '9668796787' }],
    scheduledOn: 'As and When required by GP'
  }
];
