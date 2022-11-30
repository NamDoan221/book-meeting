export interface IDataItemGetByTypeDictionary extends IDictionaryItem {
  DictionaryTypeCode?: string;
  DictionaryTypeName?: string;
  IdDictionaryType?: string;
}

export interface IDictionaryItem {
  Code?: string;
  Name?: string;
  Id?: string;
  Description?: string;
  Active?: boolean;
  Domain?: string
}