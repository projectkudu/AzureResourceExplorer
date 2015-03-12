

interface ITreeControl {
    expand_all();
    collapse_all();
    get_first_branch(): ITreeBranch;
    select_first_branch(): ITreeBranch;
    get_selected_branch(): ITreeBranch;
    get_parent_branch(b: ITreeBranch): ITreeBranch;
    select_branch(b: ITreeBranch): ITreeBranch;
    get_children(b: ITreeBranch): ITreeBranch[];
    select_parent_branch(b: ITreeBranch): ITreeBranch;
    add_branch(parent: ITreeBranch, new_branch: ITreeBranch): ITreeBranch;
    get_roots(): ITreeBranch[];
    add_root_branch(new_branch: ITreeBranch): ITreeBranch;
    expand_branch(b: ITreeBranch): ITreeBranch;
    collapse_branch(b: ITreeBranch): ITreeBranch;
    get_siblings(b: ITreeBranch): ITreeBranch[];
    get_next_sibling(b: ITreeBranch): ITreeBranch;
    get_prev_sibling(b: ITreeBranch): ITreeBranch;
    select_next_sibling(b: ITreeBranch): ITreeBranch;
    select_prev_sibling(b: ITreeBranch): ITreeBranch;
    get_first_child(b: ITreeBranch): ITreeBranch;
    get_closest_ancestor_next_sibling(b: ITreeBranch): ITreeBranch;
    get_next_branch(b: ITreeBranch): ITreeBranch;
    select_next_branch(b: ITreeBranch): ITreeBranch;
    last_descendant(b: ITreeBranch): ITreeBranch;
    get_prev_branch(b: ITreeBranch): ITreeBranch;
    select_prev_branch(b: ITreeBranch): ITreeBranch;
    get_first_non_instruction_child(b: ITreeBranch): ITreeBranch;
}