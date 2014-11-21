/// <reference path="../references.ts" />

module managePortalUi {
    "use strict";

    export interface IOperation {
        MethodName: string;
        HttpMethod: string;
        ResponseBody: any;
        RequestBody: any;
        Url: string;
    }

    export interface IResourceUrlInfo {
        resourceName: string;
        children: any; //once TS gets union types this should be 'string | string[]'
        actions: string[];
        url: string;
        responseBody: any;
    }

    export interface ITreeBranch {
        children: any[];
        data: any;
        expanded?: boolean;
        label: string;
        level?: number;
        resourceName: string;
        resource_icon: string;
        selected?: boolean;
        childUrl?: string;
        value?: string;
    }

    export interface ITreeRow {
        branch: any;
        clear_tree_icon: Function;
        label: string;
        level: number;
        resource_icon: string;
        tree_icon: string;
        visible: boolean;
    }

    export interface ITreeControl {
        expand_all(): boolean;
        collapse_all(): boolean;
        get_first_branch(): ITreeBranch;
        select_first_branch(): ITreeBranch;
        get_selected_branch(): ITreeBranch;
        get_parent_branch(branch: ITreeBranch): ITreeBranch;
        select_branch(branch: ITreeBranch): ITreeBranch;
        get_children(branch: ITreeBranch): ITreeBranch[];
        select_parent_branch(branch: ITreeBranch): ITreeBranch;
        add_branch(parent: ITreeBranch, newBranch: ITreeBranch): ITreeBranch;
        add_root_branch(newBranch: ITreeBranch): ITreeBranch;
        expand_branch(branch: ITreeBranch): ITreeBranch;
        collapse_branch(branch: ITreeBranch): ITreeBranch;
        get_siblings(branch: ITreeBranch): ITreeBranch;
        get_next_sibling(branch: ITreeBranch): ITreeBranch;
        get_prev_sibling(branch: ITreeBranch): ITreeBranch;
        select_next_sibling(branch: ITreeBranch): ITreeBranch;
        select_prev_sibling(branch: ITreeBranch): ITreeBranch;
        get_first_child(branch: ITreeBranch): ITreeBranch;
        get_closest_ancestor_next_sibling(branch: ITreeBranch): ITreeBranch;
        get_next_branch(branch: ITreeBranch): ITreeBranch;
        select_next_branch(branch: ITreeBranch): ITreeBranch;
        last_descendant(branch: ITreeBranch): ITreeBranch;
        get_prev_branch(branch: ITreeBranch): ITreeBranch;
        select_prev_branch(branch: ITreeBranch): ITreeBranch;
    }
} 