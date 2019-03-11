foam.CLASS({
  package: 'net.nanopay.sme.onboarding.ui',
  name: 'UserTransactionEstimateForm',
  extends: 'net.nanopay.ui.wizard.WizardSubView',

  documentation: `Third step in the business registration wizard.
      Responsible for capturing transaction business information.`,

    css: `
    ^ {
      width: 488px;
    }
    ^ .foam-u2-tag-Select {
      width: 100%;
      height: 35px;
      margin-bottom: 10px;
    }
    ^ .label {
      margin-left: 0px;
      margin-top: 5px;
    }
    ^ .foam-u2-TextField {
      width: 100%;
      height: 35px;
      margin-bottom: 10px;
      padding-left: 5px;
    }
    ^ .foam-u2-view-RadioView {
      display: inline-block;
      margin-right: 5px;
      float: right;
    }
    ^ .foam.u2.CheckBox {
      display: inline-block;
    }
    ^ .inline {
      margin: 15px 0px;
    }
    ^ .info-label {
      width: 400px;
    }
    ^ .info-width {
      width: 250px;
    }
    ^ .small-width-input {
      width: 100px;
      display: inline-block;
      float: right;
    }
    ^ .property-revenueEstimate {
      width: 225px;
      margin-bottom: 30px;
      height: 35px;
      top: 15px;
      right: 125px;
    }
    ^ .info-container {
      line-height: 1.5;
    }
    ^ .net-nanopay-sme-ui-InfoMessageContainer {
      margin: 15px 0px;
    }
    ^ .flag-image {
      width: 20px;
      margin-right: 10px;
      margin-top: 30px;
    }
    ^ .transfer-container {
      position: relative;
      top: 25px;
    }
    ^ .foam-u2-DateView {
      width: 229px;
      height: 35px;
    }
  `,

  properties: [
    {
      class: 'String',
      name: 'revenueEstimate',
      view: {
        class: 'foam.u2.tag.Input',
        placeholder: '$/year',
        onKey: true
      },
      factory: function() {
        if ( this.viewData.user.suggestedUserTransactionInfo.annualRevenue ) {
          return this.viewData.user.suggestedUserTransactionInfo.annualRevenue;
        }
      },
      preSet: function(o, n) {
        if ( n === '' ) return n;
        var reg = /^\d+$/;
        return reg.test(n) ? n : o;
      },
      postSet: function(o, n) {
        this.viewData.user.suggestedUserTransactionInfo.annualRevenue = n;
      }
    },
    {
      name: 'internationalPayments',
      documentation: 'Radio button determining business partaking in international payments.',
      view: {
        class: 'foam.u2.view.RadioView',
        choices: [
          'No',
          'Yes'
        ]
      },
      factory: function() {
        return this.viewData.user.suggestedUserTransactionInfo.internationalPayments ? 'Yes' : 'No';
      },
      postSet: function(o, n) {
        this.viewData.user.suggestedUserTransactionInfo.internationalPayments = n == 'Yes';
      }
    },
    {
      class: 'String',
      name: 'purposeField',
      view: {
        class: 'foam.u2.TextField',
        placeholder: 'Transaction Purpose',
        onKey: true,
        maxLength: 150
      },
      factory: function() {
        if ( this.viewData.user.suggestedUserTransactionInfo.transactionPurpose ) {
          return this.viewData.user.suggestedUserTransactionInfo.transactionPurpose;
        }
      },
      postSet: function(o, n) {
        this.viewData.user.suggestedUserTransactionInfo.transactionPurpose = n.trim();
      }
    },
    {
      class: 'String',
      name: 'annualField',
      factory: function() {
        if ( this.viewData.user.suggestedUserTransactionInfo.annualTransactionAmount ) {
          return this.viewData.user.suggestedUserTransactionInfo.annualTransactionAmount;
        }
      },
      adapt: function(oldValue, newValue) {
        if ( typeof newValue === 'string' ) {
          return newValue.replace(/\D/g, '');
        }
        return newValue;
      },
      postSet: function(o, n) {
        if ( n ) this.viewData.user.suggestedUserTransactionInfo.annualTransactionAmount = n.trim();
      }
    },
    {
      class: 'String',
      name: 'estimatedField',
      factory: function() {
        if ( this.viewData.user.suggestedUserTransactionInfo.annualVolume ) {
          return this.viewData.user.suggestedUserTransactionInfo.annualVolume;
        }
      },
      adapt: function(oldValue, newValue) {
        if ( typeof newValue === 'string' ) {
          return newValue.replace(/\D/g, '');
        }
        return newValue;
      },
      postSet: function(o, n) {
        this.viewData.user.suggestedUserTransactionInfo.annualVolume = n;
      }
    },
    {
      class: 'Date',
      name: 'firstTradeDateField',
      factory: function() {
        if ( this.viewData.user.suggestedUserTransactionInfo.firstTradeDate ) {
          return this.viewData.user.suggestedUserTransactionInfo.firstTradeDate;
        }
      },
      postSet: function(o, n) {
        this.viewData.user.suggestedUserTransactionInfo.firstTradeDate = n;
      }
    },
    {
      class: 'String',
      name: 'annualFieldDomestic',
      factory: function() {
        if ( this.viewData.user.suggestedUserTransactionInfo.annualDomesticTransactionAmount ) {
          return this.viewData.user.suggestedUserTransactionInfo.annualDomesticTransactionAmount;
        }
      },
      adapt: function(oldValue, newValue) {
        if ( typeof newValue === 'string' ) {
          return newValue.replace(/\D/g, '');
        }
        return newValue;
      },
      postSet: function(o, n) {
        if ( n ) this.viewData.user.suggestedUserTransactionInfo.annualDomesticTransactionAmount = n.trim();
      }
    },
    {
      class: 'String',
      name: 'estimatedFieldDomestic',
      factory: function() {
        if ( this.viewData.user.suggestedUserTransactionInfo.annualDomesticVolume ) {
          return this.viewData.user.suggestedUserTransactionInfo.annualDomesticVolume;
        }
      },
      adapt: function(oldValue, newValue) {
        if ( typeof newValue === 'string' ) {
          return newValue.replace(/\D/g, '');
        }
        return newValue;
      },
      postSet: function(o, n) {
        this.viewData.user.suggestedUserTransactionInfo.annualDomesticVolume = n;
      }
    },
    {
      class: 'Date',
      name: 'firstTradeDateFieldDomestic',
      factory: function() {
        if ( this.viewData.user.suggestedUserTransactionInfo.firstTradeDateDomestic ) {
          return this.viewData.user.suggestedUserTransactionInfo.firstTradeDateDomestic;
        }
      },
      postSet: function(o, n) {
        this.viewData.user.suggestedUserTransactionInfo.firstTradeDateDomestic = n;
      }
    },
    {
      class: 'Boolean',
      name: 'isUSABasedCompany',
      expression: function(viewData) {
        return foam.util.equals(viewData.user.businessAddress.countryId, 'US');
      }
    },
    {
      class: 'String',
      name: 'flag',
      documentation: `This is set from baseCurrency property.`
    },
    {
      class: 'String',
      name: 'currencyTypeLabel',
      documentation: `This is set from baseCurrency property. Toggles message text.`
    },
    {
      class: 'String',
      name: 'estimatedLabel',
      documentation: `This is set from baseCurrency property. Toggles message text.`
    },
    {
      class: 'String',
      name: 'annualLabel',
      documentation: `This is set from baseCurrency property. Toggles message text.`
    }
  ],

  constants: [
    { name: 'US_FLAG', value: 'images/flags/us.png' },
    { name: 'CAD_FLAG', value: 'images/flags/cad.png' }
  ],

  messages: [
    { name: 'TITLE', message: 'Details about your transactions' },
    { name: 'REVENUE_ESTIMATE_LABEL_CA', message: 'Annual Gross Sales in CAD' },
    { name: 'REVENUE_ESTIMATE_LABEL_US', message: 'Annual Gross Sales in USD' },
    { name: 'PURPOSE_LABEL', message: 'Please provide us with the purpose of your transactions.' },
    { name: 'INTERNATIONAL_PAYMENTS_LABEL', message: 'Are you sending or receiving international payments?' },
    { name: 'ANTICIPATED_TRADE_LABEL', message: 'Anticipated First Payment Date' },
    { name: 'SECOND_TITLE', message: 'International transfers' },
    { name: 'THIRD_TITLE', message: 'Domestic transfers' },
    { name: 'CURRENCY_TYPE', message: 'U.S. Dollars' },
    { name: 'ANNUAL_LABEL', message: 'Annual Number of Transactions' },
    { name: 'CA_DOLLAR_LABEL', message: 'Canadian Dollar' },
    { name: 'CA_VOLUME_LABEL', message: 'Estimated Annual Volume in CAD' },
    { name: 'US_DOLLAR_LABEL', message: 'U.S. Dollar' },
    { name: 'US_VOLUME_LABEL', message: 'Estimated Annual Volume in USD' },
    {
      name: 'INFO_BOX',
      message: `The base currency will be your default currency for sending
          and receiving payments. You can also change this during any transaction.`
    }

  ],

  methods: [
    function initE() {
      this.hasBackOption = true;
      this.internationalPayments$.sub(this.clearFields);
      this.setBaseCurrency();
      var domesticFlag = this.isUSABasedCompany ? this.US_FLAG : this.CAD_FLAG;

      this.addClass(this.myClass())
      .start()
        .start().addClass('medium-header')
          .add(this.TITLE)
        .end()
        .tag({ class: 'net.nanopay.sme.ui.InfoMessageContainer', message: this.INFO_BOX })
        .start().addClass('label-input')
          .start().addClass('label').add(this.PURPOSE_LABEL).end()
          .start(this.PURPOSE_FIELD).end()
        .end()
        .start().addClass('label-input')
          .start().addClass('inline').addClass('info-width').add(this.annualLabel$).end()
          .start().add(this.REVENUE_ESTIMATE).end()
        .end()
        .start()
          .start().addClass('medium-header').add(this.THIRD_TITLE).end()
          .start().addClass('label-input')
            .start({ class: 'foam.u2.tag.Image', data: domesticFlag }).addClass('flag-image').end()
            .start().addClass('inline').addClass('bold-label').add(this.isUSABasedCompany ? this.US_DOLLAR_LABEL : this.CA_DOLLAR_LABEL).end()
          .end()
          .start().addClass('label-input').addClass('half-container').addClass('left-of-container')
            .start().addClass('label').add(this.ANNUAL_LABEL).end()
            .tag(this.ANNUAL_FIELD_DOMESTIC, { onKey: true })
          .end()
          .start().addClass('label-input').addClass('half-container')
            .start().addClass('label').add(this.isUSABasedCompany ? this.US_VOLUME_LABEL : this.CA_VOLUME_LABEL).end()
            .tag(this.ESTIMATED_FIELD_DOMESTIC, { onKey: true })
          .end()
          .start().addClass('label-input')
            .start().addClass('label').add(this.ANTICIPATED_TRADE_LABEL).end()
            .start(this.FIRST_TRADE_DATE_FIELD_DOMESTIC).end()
          .end()
        .end()
        .start().addClass('label-input')
          .start().addClass('inline').addClass('info-width').add(this.INTERNATIONAL_PAYMENTS_LABEL).end()
          .start(this.INTERNATIONAL_PAYMENTS).addClass('inline').end()
        .end()
        .start().addClass('transfer-container').show(this.internationalPayments$.map(function(r) {
          return r == 'Yes';
        }))
          .start().addClass('medium-header').add(this.SECOND_TITLE).end()
          .start().addClass('label-input')
            .start({ class: 'foam.u2.tag.Image', data: this.flag$ }).addClass('flag-image').end()
            .start().addClass('inline').addClass('bold-label').add(this.currencyTypeLabel$).end()
          .end()
          .start().addClass('label-input').addClass('half-container').addClass('left-of-container')
            .start().addClass('label').add(this.ANNUAL_LABEL).end()
            .tag(this.ANNUAL_FIELD, { onKey: true })
          .end()
          .start().addClass('label-input').addClass('half-container')
            .start().addClass('label').add(this.estimatedLabel$).end()
            .tag(this.ESTIMATED_FIELD, { onKey: true })
          .end()
          .start().addClass('label-input')
            .start().addClass('label').add(this.ANTICIPATED_TRADE_LABEL).end()
            .start(this.FIRST_TRADE_DATE_FIELD).end()
          .end()
        .end()
      .end();
    },
    function setBaseCurrency() {
      var cur = this.isUSABasedCompany ? 'USD': 'CAD';
      this.viewData.user.suggestedUserTransactionInfo.baseCurrency = cur;
      // if business address is US then international payments are CAD,
      // if business address is CAD then international payments are USD,
      if ( foam.util.equals('USD', cur) ) {
        this.flag = this.CAD_FLAG;
        this.currencyTypeLabel = this.CA_DOLLAR_LABEL;
        this.estimatedLabel = this.CA_VOLUME_LABEL;
        this.annualLabel = this.REVENUE_ESTIMATE_LABEL_US;
      } else if ( foam.util.equals('CAD', cur) ) {
        this.flag = this.US_FLAG;
        this.currencyTypeLabel = this.US_DOLLAR_LABEL;
        this.estimatedLabel = this.US_VOLUME_LABEL;
        this.annualLabel = this.REVENUE_ESTIMATE_LABEL_CA;
      }
    }
  ],

  listeners: [
    function clearFields() {
      if ( this.internationalPayments == 'Yes' ) return;
      this.annualField = null;
      this.estimatedField = null;
    }
  ]
});
