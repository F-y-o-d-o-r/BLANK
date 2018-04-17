
$(document).ready(function () {
    //console.log("header.js");
    $('body').on('click', '.plusIcon', function () {
        $('.plus').toggleClass('plus-to-minus')
    })
});