export type Exercise = {
  id: string;
  name: string;
  category: string;
  bodyPart: string;
  description?: string;
  createdAt?: Date;
  source: 'library' | 'user';
};
