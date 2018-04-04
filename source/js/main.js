/*//= animate.js*/

// Если на проекте jQuery
// $( document ).ready(function() {
//   // code
// });

// Изоляция без jQuery
// (function(){
//   // code
// }());

// На проекте нет jQuery, но хочется $( document ).ready...
// function ready(fn) {
//   if (document.attachEvent ? document.readyState === "complete" : document.readyState !== "loading"){
//     fn();
//   } else {
//     document.addEventListener('DOMContentLoaded', fn);
//   }
// }
//
// ready(function(){
//   // code
// });

//check
$(document).ready(function () {
    //console.log("main.js");
});


var x = (function () {
    $(document).ready(function () {
        $('body').on('click', '#button', x.func1);
    });
    return {
        func1: function () {
            alert('test');
        },
        y: 10,
        z: true,
    }
})();

//подключаем из своих блоков скрипіт
//= ../blocks/index/index.js
//подключаем блоки стандартные, которые нужны
//= ../standart_blocks/burger/burger.js