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
            Cell.utils.each( this.usage, function ( cell, index ) {
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
        this.trigger( 'change', this.value(), this );

    };

    Cell.prototype.value = function () {

        return this._value;

    };

    Cell.prototype.calculate = function () {

        var newValue;

        if ( this.formula ) {
            newValue = this.formula.apply( this, this.getUsageValues() );
            if ( this.value() !== newValue ) {
                this.set( newValue );
                this.updateDeps();
            }
        }

    };

    Cell.prototype.getUsageValues = function () {

        var result = [];

        Cell.utils.each( this.usage, function ( cell, index ) {
            result[ index ] = cell.value();
        }, this );

        return result;

    };

    Cell.prototype.updateDeps = function () {

        Cell.utils.each( this.deps, function ( cell ) {
            cell.calculate();
        }, this );

    };

    Cell.prototype.getDepIndexById = function ( from, id ) {

        var result = false;

        Cell.utils.each( from, function ( cell, index ) {
            if ( cell._id === id ) {
                result = index;
            }
        }, this );

        return result;

    };

    Cell.prototype.delete = function () {

        Cell.utils.each( this.usage, function ( cell ) {
            var index = this.getDepIndexById( cell.deps, this._id );
            if ( index !== false ) {
                cell.deps.splice( index, 1 );
            }
        }, this );

        this.trigger( 'delete' );

    };

    Cell.prototype.on = function ( event, callback, context ) {

        if ( !this.handlers[ event ] ) { this.handlers[ event ] = []; }
        this.handlers[ event ].push({ fn: callback, context: context });

    };

    Cell.prototype.off = function ( event, callback, context ) {

        // cell.off() removes all handlers for all events
        if ( arguments.length === 0 ) {
            Cell.utils.each( this.handlers, function ( handlers, index ) {
                handlers.splice( 0, handlers.length );
            }, this );
        }

        // cell.off( 'change' ) removes all handlers for change event
        if ( event != null && this.handlers[ event ] && !callback && !context ) {
            this.handlers[ event ].splice( 0, this.handlers[ event ].length );
        } else if ( event != null && this.handlers[ event ] ) {
            Cell.utils.each( this.handlers[ event ], function ( handler, index, handlers ) {
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
            Cell.utils.each( this.handlers, function ( handlers, eventName ) {
                // cell.off( null, fn ) removes handlers for all events by callback
                // cell.off( null, fn, ctx ) removes handlers for all events by callback and context
                // cell.off( null, null, ctx ) removes handlers for all events by context
                this.off( eventName, callback, context );
            }, this );
        }

    };

    Cell.prototype.trigger = function ( event ) {

        var args = arguments;

        Cell.utils.each( this.handlers[ event ], function ( handler ) {
            handler.fn.apply( handler.context || this, Array.prototype.slice.call( args, 1 ) );
        }, this );

    };

    Cell.utils = {

        each: function ( arr, fn, ctx ) {

            var isArr = this.isArray( arr ),
                i     = 0,
                key   = '',
                len   = isArr ? arr.length : false;

            if ( !arr ) { return false; }

            if ( isArr ) {
                for ( i; i < len; i++ ) {
                    fn.call( ctx || Cell, arr[ i ], i, arr );
                }
            } else {
                for ( key in arr ) {
                    if ( this.hasOwnProperty( arr, key ) ) {
                        fn.call( ctx || Cell, arr[ key ], key, arr );
                    }
                }
            }

        },

        hasOwnProperty: function ( obj, key ) {

            return Object.prototype.hasOwnProperty.call( obj, key );

        },

        isArray: function ( data ) {

            return Object.prototype.toString.call( data ) == '[object Array]';

        },

        extend: function ( to, from ) {

            this.each( from, function ( value, key ) {

                to[ key ] = value;

            });

            return to;

        }

    };

    Cell.extend = function ( props ) {

        var child = function () { return Cell.apply( this, arguments ); };

        Cell.utils.extend( child, Cell );

        var Surrogate = function () { this.constructor = child; };
        Surrogate.prototype = Cell.prototype;
        child.prototype = new Surrogate();

        Cell.utils.extend( child.prototype, props );

        return child;

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