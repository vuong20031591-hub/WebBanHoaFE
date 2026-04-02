import { CategoryDTO } from "../api/types";
import { Category } from "../categories/types";

export function mapCategoryDTOToCategory(dto: CategoryDTO): Category {
  return {
    id: dto.id,
    name: dto.name,
    description: dto.description || undefined,
  };
}

export function mapCategoryDTOsToCategories(dtos: CategoryDTO[]): Category[] {
  return dtos.map(mapCategoryDTOToCategory);
}
