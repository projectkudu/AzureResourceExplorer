import {ObjectUtils} from "../common/ObjectUtils";

export class DocumentationGenerator {

    static getDocumentationFlatArray(editorData: any, doc: any) {
        const docArray: any[] = [];
        if (doc) {
            doc = (doc.properties ? doc.properties : (doc.value ? doc.value[0].properties : {}));
        }

        if (editorData && doc) {
            editorData = (editorData.properties ? editorData.properties : ((editorData.value && editorData.value.length > 0) ? editorData.value[0].properties : {}));
            const set: any = {};
            for (var prop in editorData) {
                if (editorData.hasOwnProperty(prop) && doc[prop]) {
                    docArray.push({
                        name: prop,
                        doc: doc[prop]
                    });
                    set[prop] = 1;
                }
            }

            for (var prop in doc) {
                if (doc.hasOwnProperty(prop) && !set[prop]) {
                    docArray.push({
                        name: prop,
                        doc: doc[prop]
                    });
                }
            }
        } else {
            docArray.push({ name: "message", doc: "No documentation available" });
        }

        return ObjectUtils.flattenArray(docArray);
    }
}