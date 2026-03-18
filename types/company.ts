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

// Maps region key → list of financniUrad sub-codes (from ARES ciselnik).
// ARES search API does not support kodKraje directly; financniUrad is the
// only reliable region filter. Codes fetched from /ciselniky-nazevniky/vyhledat
// grouped by kodNadrizeny (regional FU: 451=Praha, 452=Stredocesky, etc.)
export const REGION_FU_CODES: Record<string, string[]> = {
  '19':  ['001','002','003','004','005','006','007','008','009','010','011','012'],
  '27':  ['021','022','026','027','030','031','034','038','039','043','044','048','053','055','057','059','060','063','069'],
  '35':  ['077','082','086','097','101','105','110'],
  '43':  ['118','133','138','140','145','150','160'],
  '51':  ['123','128','155'],
  '60':  ['178','179','182','183','196','198','201','203','206','210','214'],
  '78':  ['172','187','192','258','260'],
  '86':  ['228','238','243','253','268'],
  '94':  ['233','248','263','273','274','275'],
  '108': ['091','223','314','330','351','353'],
  '116': ['283','284','288','289','290','291','293','298','299','309','310','311','341','346'],
  '124': ['325','379','381','393','394','398','399','400'],
  '132': ['358','359','362','364','367','370','374','376','384','388','389','390'],
  '141': ['303','305','320','336','338','403','404','405'],
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
