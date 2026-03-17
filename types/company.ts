export interface AresSidlo {
  kodKraje?: number;
  nazevKraje?: string;
  kodOkresu?: number;
  nazevOkresu?: string;
  kodObce?: number;
  nazevObce?: string;
  nazevUlice?: string;
  cisloDomovni?: number;
  cisloOrientacni?: number;
  psc?: number | string;
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

// Numeric kodKraje values from ARES (discovered empirically)
export const REGIONS: Record<string, string> = {
  '': 'Celá ČR',
  '19': 'Praha',
  '27': 'Středočeský kraj',
  '35': 'Jihočeský kraj',
  '43': 'Plzeňský kraj',
  '51': 'Karlovarský kraj',
  '60': 'Ústecký kraj',
  '78': 'Liberecký kraj',
  '86': 'Královéhradecký kraj',
  '94': 'Pardubický kraj',
  '108': 'Kraj Vysočina',
  '116': 'Jihomoravský kraj',
  '124': 'Olomoucký kraj',
  '141': 'Zlínský kraj',
  '132': 'Moravskoslezský kraj',
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
