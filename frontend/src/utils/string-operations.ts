// 頭文字を大文字にする
export const capitalize = (str: string) => {
  return str.charAt(0).toUpperCase() + str.slice(1);
};

// 頭文字を小文字にする
export const uncapitalize = (str: string) => {
  return str.charAt(0).toLowerCase() + str.slice(1);
};
