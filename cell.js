;(function ( window, undefined ) {

    var lastId = 0;

    var Cell = function Cell ( options ) {

        this._id = lastId++;
        this._value = undefined;
        this.deps = [];
        this.usage = [];

        if ( typeof options[ 0 ] == 'function' ) {
            this.formula = options[ 0 ];
            this.usage = options.slice( 1 );
            for ( var i = 0; i < this.usage.length; i++ ) {
                this.usage[ i ].deps.push( this );
            }
        } else {
            this._value = options[ 0 ];
        }

        this.calculate();

    };

    Cell.prototype.set = function ( val ) {

        this._value = val;
        this.updateDeps();

    };

    Cell.prototype.value = function () {

        return this._value;

    };

    Cell.prototype.calculate = function () {

        if ( this.formula ) {
            this._value = this.formula.apply( this, this.getUsageValues() );
            this.updateDeps();
        }

    };

    Cell.prototype.getUsageValues = function () {

        var result = [];

        if ( this.usage && this.usage.length ) {
            for ( var i = 0; i < this.usage.length; i++ ) {
                result[ i ] = this.usage[ i ].value();
            }
        }

        return result;

    };

    Cell.prototype.updateDeps = function () {

        for ( var i = 0; i < this.deps.length; i++ ) {
            this.deps[ i ].calculate();
        }

    };

    Cell.prototype.getDepIndexById = function ( from, id ) {

        for ( var i = 0; i < from.length; i++ ) {
            if ( from[ i ]._id == id ) {
                return i;
            }
        }

        return false;

    };

    Cell.prototype.delete = function () {

        var index;

        for ( var i = 0; i < this.usage.length; i++ ) {
            index = this.getDepIndexById( this.usage[ i ].deps, this._id );
            if ( index !== false ) {
                this.usage[ i ].deps.splice( index, 1 );
            }
        }

    };

    var cell = function () {
        return new Cell( Array.prototype.slice.call( arguments, 0 ) );
    };

    window.cell = cell;

})( window );