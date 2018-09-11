foam.CLASS({
  package: 'net.nanopay.model',
  name: 'Currency',

  documentation: 'Currency information.',

  ids: [
    'alphabeticCode'
  ],

  properties: [
    {
      class: 'String',
      name: 'name',
      documentation: 'Name of currency.',
      required: true
    },
    {
      class: 'String',
      name: 'alphabeticCode',
      documentation: 'Alphabetic code of currency.',
      required: true
    },
    {
      class: 'Long',
      name: 'numericCode',
      documentation: 'Numeric code of currency.',
      required: true
    },
    {
      class: 'Int',
      name: 'precision',
      documentation: 'The number of digits that come after the decimal point.',
      required: true
    },
    {
      class: 'Reference',
      of: 'foam.nanos.auth.Country',
      documentation: 'Reference to affiliated country.',
      name: 'country'
    },
    {
      class: 'String',
      name: 'delimiter',
      documentation: 'The character used to delimit groups of 3 digits.'
    },
    {
      class: 'String',
      name: 'decimalCharacter',
      documentation: 'The character used as a decimal.'
    },
    {
      class: 'String',
      name: 'symbol',
      documentation: 'The symbol used for the currency. Eg: $ for CAD.'
    },
    {
      class: 'String',
      name: 'leftOrRight',
      documentation: `The side of the digits that the symbol should be displayed on.`,
      validateObj: function(value) {
        if ( value !== 'left' && value !== 'right' ) return `Property 'leftOrRight' must be set to either "left" or "right".`;
      }
    },
    {
      class: 'String',
      name: 'flagImage',
      documentation: 'Flag image used in relation to currency.'
    }
  ],

  methods: [
    {
      name: 'format',
      code: function(amount) {
        /**
         * Given a number, display it as a currency using the appropriate
         * precision, decimal character, delimiter, symbol, and placement
         * thereof.
         */
        amount = amount.toString();
        while ( amount.length < this.precision ) amount = '0' + amount;
        var beforeDecimal = amount.substring(0, amount.length - this.precision);
        var formatted = '';
        if ( this.leftOrRight === 'left' ) formatted += this.symbol;
        formatted += beforeDecimal.replace(/\B(?=(\d{3})+(?!\d))/g, this.delimiter) || '0';
        if ( this.precision > 0 ) {
          formatted += this.decimalCharacter;
          formatted += amount.substring(amount.length - this.precision);
        }
        if ( this.leftOrRight === 'right' ) formatted += this.symbol;
        return formatted;
      }
    }
  ]
});
