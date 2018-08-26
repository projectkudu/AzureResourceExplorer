interface ITreeBranchDataOverrides {
    childDefinitionUrlSuffix: string; // used to determine whether this applies for a given childDefinition
    getLabel: (d: any, csmName: string) => string;
    getSortKey: (d: any, label: string) => string;
    getIconNameOverride: (d: any) => string;
    sortOrder: number; // 1 => ascending, -1 => descending
}