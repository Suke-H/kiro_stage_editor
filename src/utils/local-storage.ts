const STORAGE_KEY = "kiro-stage-data";

export const saveToLocalStorage = (yamlString: string): void => {
  localStorage.setItem(STORAGE_KEY, yamlString);
};

export const getYamlFromLocalStorage = (): string | null => {
  return localStorage.getItem(STORAGE_KEY);
};
