foam.CLASS({
  package: 'net.nanopay.ui',
  name: 'Controller',
  extends: 'foam.nanos.controller.ApplicationController',

  arequire: function() { return foam.nanos.client.ClientBuilder.create(); },

  documentation: 'Nanopay Top-Level Application Controller.',

  implements: [
    'foam.mlang.Expressions',
    'net.nanopay.util.CurrencyFormatter',
    'net.nanopay.util.AddCommaFormatter',
    'net.nanopay.util.FormValidation'
  ],

  requires: [
    'foam.nanos.auth.User',
    'foam.u2.stack.Stack',
    'foam.u2.stack.StackView',
    'net.nanopay.model.Account',
    'net.nanopay.model.BankAccount',
    'net.nanopay.model.Currency',
    'net.nanopay.ui.style.AppStyles',
    'net.nanopay.ui.modal.ModalStyling',
    'net.nanopay.invoice.ui.style.InvoiceStyles'
  ],

  exports: [
    'account',
    'privacyUrl',
    'termsUrl',
    'as ctrl',
    'findAccount'
  ],

  css: `
    .stack-wrapper {
      margin-bottom: -10px;
      min-height: calc(80% - 60px);
    }

    .stack-wrapper:after {
      content: "";
      display: block;
    }

    .stack-wrapper:after {
      height: 10px;
    }

    .foam-comics-DAOUpdateControllerView .property-transactionLimits .net-nanopay-ui-ActionView-addItem {
      height: auto;
      padding: 3px;
      width: auto;
    }

    .foam-comics-DAOControllerView .foam-u2-view-TableView-row {
      height: 40px;
    }

    .foam-u2-view-TableView .net-nanopay-ui-ActionView {
      height: auto;
      padding: 8px;
      width: auto;
    }
    .net-nanopay-ui-ActionView-exportButton {
      float: right;
      background-color: rgba(164, 179, 184, 0.1);
      box-shadow: 0 0 1px 0 rgba(9, 54, 73, 0.8);
      width: 75px !important;
      height: 40px;
      cursor: pointer;
      z-index: 100;
      margin-right: 5px;
    }
    .net-nanopay-ui-ActionView-exportButton img {
      margin-right: 5px;
    }
  `,

  properties: [
    'privacyUrl',
    'termsUrl',
    {
      class: 'foam.core.FObjectProperty',
      of: 'net.nanopay.model.Account',
      name: 'account',
      factory: function() { return this.Account.create(); }
    }
  ],

  methods: [
    function initE() {
      this.AppStyles.create();
      this.InvoiceStyles.create();
      this.ModalStyling.create();

      var self = this;
      foam.__context__.register(net.nanopay.ui.ActionView, 'foam.u2.ActionView');

      this.findAccount();

      this
        .addClass(this.myClass())
        .tag({class: 'net.nanopay.ui.topNavigation.TopNav' })
        .br()
        .start('div').addClass('stack-wrapper')
          .tag({class: 'foam.u2.stack.StackView', data: this.stack, showActions: false})
        .end()
        .br()
        .tag({class: 'net.nanopay.ui.FooterView'});
    },

    function findAccount() {
      var self = this;
      this.accountDAO.find(this.user.id).then(function (a) {
        return self.account.copyFrom(a);
      }.bind(this));
    }
  ],

  listeners: [
    function onUserUpdate() {
      this.SUPER();
      this.findAccount();
    }
  ]
});
