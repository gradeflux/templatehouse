export interface Template {
  id: string;
  title: string;
  slug: string;
  description: string;
  category: CategoryKey;
  format: string;
  downloadUrl: string;
  previewImage: string;
  downloads: number;
  tags: string[];
  createdAt: string;
}

export type CategoryKey =
  | "notion"
  | "ppt"
  | "resume"
  | "excel"
  | "report"
  | "project"
  | "marketing"
  | "education";

export interface CategoryInfo {
  key: CategoryKey;
  label: string;
  description: string;
}

export const CATEGORIES: CategoryInfo[] = [
  { key: "notion", label: "Notion", description: "노션 템플릿 모음" },
  { key: "ppt", label: "PPT", description: "프레젠테이션 템플릿" },
  { key: "resume", label: "이력서", description: "이력서 및 자기소개서" },
  { key: "excel", label: "Excel", description: "엑셀 스프레드시트" },
  { key: "report", label: "업무보고서", description: "각종 업무 보고서 양식" },
  { key: "project", label: "프로젝트관리", description: "프로젝트 관리 도구" },
  { key: "marketing", label: "마케팅", description: "마케팅 및 소셜미디어 템플릿" },
  { key: "education", label: "교육", description: "교육 및 학습 자료 템플릿" },
];

export const CATEGORY_MAP: Record<CategoryKey, string> = {
  notion: "Notion",
  ppt: "PPT",
  resume: "이력서",
  excel: "Excel",
  report: "업무보고서",
  project: "프로젝트관리",
  marketing: "마케팅",
  education: "교육",
};
