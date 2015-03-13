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
}