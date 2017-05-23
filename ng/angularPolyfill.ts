interface Element {
    documentOffsetTop(): number;
}

if (!Element.prototype.documentOffsetTop) {
    Element.prototype.documentOffsetTop = function () {
        return this.offsetTop + (this.offsetParent ? this.offsetParent.documentOffsetTop() : 0);
    };
}


