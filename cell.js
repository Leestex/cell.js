;(function ( window, undefined ) {

    var lastId = 0;

    var Cell = function Cell ( options ) {

        this._id = lastId++;
        this._value = undefined;
        this.deps = [];
        this.usage = [];

        if ( typeof options[ 0 ] === 'function' ) {
            this.formula = options[ 0 ];
            this.usage = options.slice( 1 );
            this.utils.each( this.usage, function ( cell, index ) {
                cell.deps.push( this );
            }, this );
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

        this.utils.each( this.usage, function ( cell, index ) {
            result[ index ] = cell.value();
        }, this );

        return result;

    };

    Cell.prototype.updateDeps = function () {

        this.utils.each( this.deps, function ( cell ) {
            cell.calculate();
        }, this );

    };

    Cell.prototype.getDepIndexById = function ( from, id ) {

        var result = false;

        this.utils.each( from, function ( cell, index ) {
            if ( cell._id === id ) {
                result = index;
            }
        }, this );

        return result;

    };

    Cell.prototype.delete = function () {

        this.utils.each( this.usage, function ( cell ) {
            var index = this.getDepIndexById( cell.deps, this._id );
            if ( index !== false ) {
                cell.deps.splice( index, 1 );
            }
        }, this );

    };

    Cell.prototype.utils = {

        each: function ( arr, fn, ctx ) {

            var i = 0,
                len = arr.length;

            if ( !arr || !arr.length ) { return false; }

            for ( i; i < len; i++ ) {
                fn.call( ctx || Cell, arr[ i ], i, arr );
            }

        }

    };

    var cell = function () {
        return new Cell( Array.prototype.slice.call( arguments, 0 ) );
    };

    cell.ctor = Cell;

    if ( typeof module === 'object' && module && typeof module.exports === 'object' ) {
        module.exports = cell;
    } else if ( typeof define === 'function' && define.amd ) {
        define( 'cell', [], function () { return cell; } );
    } else if ( window ) {
        window.cell = cell;
    }

})( window );