import { STRUCTURE_TYPES, getStructureTypeCategories as getCategories } from '../constants/structureTypes';

export function getStructureTypes() {
  return STRUCTURE_TYPES;
}

export function getStructureTypeCategories() {
  return Promise.resolve(getCategories());
}
