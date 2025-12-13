import { lazy, type LazyExoticComponent, type ComponentType } from "react";

export interface Tool {
  slug: string;
  name: string;
  description: string;
  icon: string;
  component: LazyExoticComponent<ComponentType>;
}

export const toolsRegistry: Tool[] = [
  {
    slug: "string-case-converter",
    name: "String Case Converter",
    description: "Convert text between uppercase, lowercase, camelCase, snake_case, and more",
    icon: "Type",
    component: lazy(() => import("../tools/StringCaseConverter")),
  },
];
