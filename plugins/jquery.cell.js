;(function ( $, window, cell, undefined ) {

    $.fn.cell = function ( options ) {
        return new cell.ctor( arguments );
    };

})( jQuery, window, cell );