export interface AresSidlo {
  kodKraje?: string;
  nazevKraje?: string;
  kodOkresu?: string;
  nazevOkresu?: string;
  kodObce?: string;
  nazevObce?: string;
  nazevUlice?: string;
  cisloDomovni?: string;
  cisloOrientacni?: string;
  psc?: string;
  textovaAdresa?: string;
}

export interface AresCompany {
  ico: string;
  obchodniJmeno: string;
  sidlo: AresSidlo;
  pravniForma?: string;
  financniUrad?: string;
  datumVzniku?: string;
  datumZaniku?: string;
  datumAktualizace?: string;
  icoId?: string;
  adresaDorucovaci?: AresSidlo;
  kategorizaceEkonomickychCinnosti?: Array<{
    kodNace?: string;
    nazevNace?: string;
  }>;
  subRegistrSzr?: string;
  dicFu?: string;
  czNace?: string[];
}

export interface AresSearchResult {
  pocetCelkem: number;
  ekonomickeSubjekty: AresCompany[];
}

export interface AresCompanyDetail extends AresCompany {
  statistickeUdaje?: {
    kodKategoriePodniku?: string;
    kodPravniFormy?: string;
    pocetPracovniku?: string;
  };
  czNace?: string[];
  subRegistrSzr?: string;
}

export interface AresPerson {
  jmeno?: string;
  prijmeni?: string;
  titulPred?: string;
  titulZa?: string;
  adresa?: {
    textovaAdresa?: string;
    nazevObce?: string;
  };
  funkce?: string;
  datumVzniku?: string;
}

export interface AresStatutarniOrgan {
  nazev?: string;
  clenove?: AresPerson[];
}

export interface AresRegistrace {
  ico: string;
  obchodniJmeno: string;
  sidlo: AresSidlo;
  pravniForma?: string;
  datumVzniku?: string;
  datumZaniku?: string;
  statutarniOrgany?: AresStatutarniOrgan[];
  spolecnici?: AresPerson[];
  czNace?: string[];
  statistickeUdaje?: {
    kodKategoriePodniku?: string;
    pocetPracovniku?: string;
  };
}

export type CompanySize = 'all' | 'micro' | 'small' | 'medium' | 'large';

export interface SearchParams {
  query: string;
  region: string;
  size: CompanySize;
  page: number;
}

export const REGIONS: Record<string, string> = {
  '': 'Celá ČR',
  'CZ010': 'Praha',
  'CZ020': 'Středočeský kraj',
  'CZ031': 'Jihočeský kraj',
  'CZ032': 'Plzeňský kraj',
  'CZ041': 'Karlovarský kraj',
  'CZ042': 'Ústecký kraj',
  'CZ051': 'Liberecký kraj',
  'CZ052': 'Královéhradecký kraj',
  'CZ053': 'Pardubický kraj',
  'CZ063': 'Kraj Vysočina',
  'CZ064': 'Jihomoravský kraj',
  'CZ071': 'Olomoucký kraj',
  'CZ072': 'Zlínský kraj',
  'CZ080': 'Moravskoslezský kraj',
};

export const LEGAL_FORMS: Record<string, string> = {
  '101': 'Fyzická osoba podnikající',
  '112': 'Společnost s ručením omezeným',
  '121': 'Akciová společnost',
  '141': 'Obecně prospěšná společnost',
  '161': 'Státní podnik',
  '205': 'Spolek',
  '301': 'Příspěvková organizace',
};

export const COMPANY_SIZES: Record<string, { label: string; pocet: string }> = {
  all: { label: 'Všechny velikosti', pocet: '' },
  micro: { label: 'Mikropodnik (1–9 zam.)', pocet: 'VS_1_9' },
  small: { label: 'Malý podnik (10–49 zam.)', pocet: 'VS_10_49' },
  medium: { label: 'Střední podnik (50–249 zam.)', pocet: 'VS_50_249' },
  large: { label: 'Velký podnik (250+ zam.)', pocet: 'VS_250_' },
};
