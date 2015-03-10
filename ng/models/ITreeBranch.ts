interface ITreeBranch {
    currentResourceGroupProviders: any[];
    providersFilter: any[];
    uid: number;
    label: string;
    value: string;
    children: ITreeBranch[];
    resourceDefinition: any;
}