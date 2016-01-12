interface ITreeBranch {
    currentResourceGroupProviders?: any;
    providersFilter?: any[];
    uid?: number;
    label: string;
    value?: string;
    children?: ITreeBranch[];
    resourceDefinition: IResourceDefinition;
    is_leaf?: boolean;
    expanded?: boolean;
    elementUrl?: string;
    is_instruction?: boolean;
    sortValue: string;
}

interface ITreeBranchDataOverrides {
    childDefinitionUrlSuffix: string; // used to determine whether this applies for a given childDefinition
    getLabel: (d: any, csmName: string) => string;
    getSortKey: (d: any, label: string) => string;
    sortOrder: number; // 1 => ascending, -1 => descending
}