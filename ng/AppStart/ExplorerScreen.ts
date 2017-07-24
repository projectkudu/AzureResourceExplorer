export class ExplorerScreen {
    static showReadOnlyConfirmation(event: Event) {
        if (event) {
            const clickedButton = $(event.currentTarget);
            const readonlyConfirmation = $("#readonly-confirm-box");
            // I don't know why the top doesn't center the value for the small buttons but does for the large ones
            // add an 8px offset if the button outer height < 40
            const offset = (clickedButton.outerHeight() < 40 ? 8 : 0);
            readonlyConfirmation.css({ top: (clickedButton.offset().top - clickedButton.outerHeight(true) - offset) + 'px', left: (clickedButton.offset().left + clickedButton.outerWidth()) + 'px' });
            $("#dark-blocker").show();
            readonlyConfirmation.show();
        }
    }

    static showDeleteConfirmation(event: Event, deleteClickHandler: any) {
        const deleteButton = $(event.currentTarget);
        const deleteConfirmation = $("#delete-confirm-box");
        deleteConfirmation.css({ top: (deleteButton.offset().top - (((deleteButton.outerHeight() + 10) / 2))) + 'px', left: (deleteButton.offset().left + deleteButton.outerWidth()) + 'px' });
        $("#yes-delete-confirm").off("click").click(deleteClickHandler);
        $("#dark-blocker").show();
        deleteConfirmation.show();
    }

    static fadeInAndFadeOutSuccess() {
        setTimeout(() => {
            $(".success-marker").fadeIn(1500);
            setTimeout(() => {
                $(".success-marker").fadeOut(1500);
            }, 1200);
        }, 500);
    }

    static fadeInAndFadeOutError() {
        setTimeout(() => {
            $(".failure-marker").fadeIn(1500);
            setTimeout(() => {
                $(".failure-marker").fadeOut(1500);
            }, 1200);
        }, 500);
    }
}