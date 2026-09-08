export interface App {
  id: number;
  name: string;
  logo_filename: string;
  url: string;
  short_description: string;
  category: string;
  main_functionality: string;
  tags: string[];
  what_is: string;
  purpose: string;
  use_cases: string;
  main_advantages: string;
  long_description: string;
  release_date: string;
  developer: string;
  main_model: string;
  pricing_plans: string;
  license: string;
  security_privacy: string;
  integration: string;
  top_provisional?: number; // ✅ Añadir esta propiedad opcional
  rate?: number;            // ✅ Añadir esta propiedad opcional
}
  
export interface News {
  success_type: string;
  title: string;
  description: string;
  url: string;
}

export interface Source {
  source_url: string;
  name?: string;
}
