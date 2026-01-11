
export type HearingMedium = 'Presencial' | 'Virtual';

export interface LegalCase {
  id: string;
  dateTime: string;
  nurej: string;
  caseNumber: string;
  city: string;
  characteristics: string;
  parties: string;
  crime: string;
  hearingType: string;
  courtRoom: string;
  lawyer: string;
  medium: HearingMedium;
  observations: string;
  createdAt: string;
}

export type ExportType = 'xlsx' | 'docx' | 'pdf';
