// On selection from the organisations dropdown,
// navigate to that organisation.
$(document).ready(function() {
    var organisations = $('#organisations');
    // var body = $('body');
    window.onbeforeunload = function() {
        // Just before leaving the page, reset the dropdown.
        // E.g., if you navigate to an organisation, then
        // use the browser's back button, you'll find the
        // dropdown has been reset.
        organisations.val('null');
    }
    // Force a reset now, anyway.
    organisations.val('null');
    // On selection of an option, navigate to the corresponding
    // organisation page.
    organisations.change(function() {
        var option = $(this).val();
        if (option !== 'null') {
            window.location = base_url + 'lenses/organisations/' + option;
        }
    });
});
