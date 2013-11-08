;(function ( $, window, cell, undefined ) {

    var tagsWithValue = [ 'INPUT', 'OPTION', 'TEXTAREA' ];

    $.fn.cell = function () {

        var $element    = this,
            cellObject  = $.data( $element.get( 0 ), 'cell' );

        if ( cellObject && cellObject instanceof cell.ctor && !arguments.length ) {
            return cellObject;
        } else {
            cellObject = $.data( $element.get( 0 ), 'cell', cell.apply( $element, arguments ) );
        }

        cellObject.formula && cellObject.on( 'change', function ( value, cell ) {
            if ( tagsWithValue.indexOf( $element.get( 0 ).tagName ) === -1 ) {
                this.text( value );
            } else {
                this.val( value );
            }
        }, $element );

        cellObject.on( 'delete', function () {
            $.data( $element.get( 0 ), 'cell', false );
        }, $element );

        $element.on( 'keyup keydown', function () {
            setTimeout( function () {
                cellObject.set( tagsWithValue.indexOf( $element.get( 0 ).tagName ) === -1 ? $element.text() : $element.val() );
            }, 0 );
        });

        return cellObject;

    };

})( jQuery, window, cell );