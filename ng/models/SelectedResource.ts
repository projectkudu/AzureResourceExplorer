interface ISelectedResource {
    url: string;
    actionsAndVerbs: Action[];
    createAction: Action;
    getActions: Action[];
    doc: any[];
    putUrl: string;
}