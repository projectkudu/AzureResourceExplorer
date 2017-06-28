interface ITreeControl {
    expand_all();
    collapse_all();
    get_first_branch(): TreeBranch;
    select_first_branch(): TreeBranch;
    get_selected_branch(): TreeBranch;
    get_parent_branch(b: TreeBranch): TreeBranch;
    select_branch(b: TreeBranch): TreeBranch;
    get_children(b: TreeBranch): TreeBranch[];
    select_parent_branch(b: TreeBranch): TreeBranch;
    add_branch(parent: TreeBranch, new_branch: TreeBranch): TreeBranch;
    get_roots(): TreeBranch[];
    add_root_branch(new_branch: TreeBranch): TreeBranch;
    expand_branch(b: TreeBranch): TreeBranch;
    collapse_branch(b: TreeBranch): TreeBranch;
    get_siblings(b: TreeBranch): TreeBranch[];
    get_next_sibling(b: TreeBranch): TreeBranch;
    get_prev_sibling(b: TreeBranch): TreeBranch;
    select_next_sibling(b: TreeBranch): TreeBranch;
    select_prev_sibling(b: TreeBranch): TreeBranch;
    get_first_child(b: TreeBranch): TreeBranch;
    get_closest_ancestor_next_sibling(b: TreeBranch): TreeBranch;
    get_next_branch(b: TreeBranch): TreeBranch;
    select_next_branch(b: TreeBranch): TreeBranch;
    last_descendant(b: TreeBranch): TreeBranch;
    get_prev_branch(b: TreeBranch): TreeBranch;
    select_prev_branch(b: TreeBranch): TreeBranch;
    get_first_non_instruction_child(b: TreeBranch): TreeBranch;
}