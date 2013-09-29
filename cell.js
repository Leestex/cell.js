;(function ( window, undefined ) {

    var lastId = 0;

    var Cell = function Cell ( options ) {

        this._id = lastId++;
        this._value = undefined;
        this.deps = [];
        this.usage = [];
        this.handlers = {};

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

    Cell.prototype.on = function ( event, callback, context ) {

        if ( !this.handlers[ event ] ) { this.handlers[ event ] = []; }
        this.handlers[ event ].push({ fn: callback, context: context });

    };

    Cell.prototype.off = function ( event, callback, context ) {

        // cell.off() removes all handlers for all events
        if ( arguments.length === 0 ) {
            this.utils.each( this.handlers, function ( handlers, index ) {
                handlers.splice( 0, handlers.length );
            }, this );
        }

        // cell.off( 'change' ) removes all handlers for change event
        if ( event != null && this.handlers[ event ] && !callback && !context ) {
            this.handlers[ event ].splice( 0, this.handlers[ event ].length );
        } else if ( event != null && this.handlers[ event ] ) {
            this.utils.each( this.handlers[ event ], function ( handler, index, handlers ) {
                // cell.off( 'change', fn ) removes handlers for change event by callback
                if ( callback != null && context == null && handler.fn === callback ) {
                    handlers.splice( index, 1 );
                }
                // cell.off( 'change', fn, ctx ) removes handlers for change event by callback and context
                if ( callback != null && context != null && handler.fn === callback && handler.context === context ) {
                    handlers.splice( index, 1 );
                }
                // cell.off( 'change', null, ctx ) removes handlers for change event by context
                if ( callback == null && context != null && handler.context === context ) {
                    handlers.splice( index, 1 );
                }
            }, this );
        } else if ( event == null ) {
            this.utils.each( this.handlers, function ( handlers, eventName ) {
                // cell.off( null, fn ) removes handlers for all events by callback
                // cell.off( null, fn, ctx ) removes handlers for all events by callback and context
                // cell.off( null, null, ctx ) removes handlers for all events by context
                this.off( eventName, callback, context );
            }, this );
        }

    };

    Cell.prototype.trigger = function ( event ) {

        this.utils.each( this.handlers[ event ], function ( handler ) {
            handlers.fn.call( handler.context || this );
        }, this );

    };

    Cell.prototype.utils = {

        each: function ( arr, fn, ctx ) {

            var isArr = Object.prototype.toString.call( arr ) == '[object Array]',
                i     = 0,
                key   = '',
                len   = arr.length;

            if ( !arr ) { return false; }

            if ( isArr ) {
                for ( i; i < len; i++ ) {
                    fn.call( ctx || Cell, arr[ i ], i, arr );
                }
            } else {
                for ( key in arr ) {
                    if ( Object.prototype.hasOwnProperty.call( arr, key ) ) {
                        fn.call( ctx || Cell, arr[ key ], key, arr );
                    }
                }
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