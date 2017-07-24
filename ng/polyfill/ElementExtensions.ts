export class ElementExtensions {

    static documentOffsetTop(element: HTMLElement): number {
        return element.offsetTop + (element.offsetParent ? ElementExtensions.documentOffsetTop(element.offsetParent as HTMLElement) : 0);
    }
}