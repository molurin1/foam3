foam.CLASS({
  package: 'net.nanopay.sme.ui',
  name: 'Details',
  extends: 'net.nanopay.ui.wizard.WizardSubView',

  documentation: '',

  implements: [
    'foam.mlang.Expressions',
  ],

  imports: [
    'notificationDAO',
    'publicUserDAO',
    'stack',
    'user',
    'hideNavFooter'
  ],

  requires: [
    'foam.u2.dialog.NotificationMessage',
    'net.nanopay.admin.model.AccountStatus',
    'net.nanopay.auth.PublicUserInfo',
    'net.nanopay.invoice.model.Invoice',
    'foam.u2.Element',
  ],

  /*
  css: `
    ^ {
      position: absolute;
      left: 0;
      height: 100% !important;
      width: 100% !important;
    }
    ^ .invoice-content {
      margin-left: 80px;
    }
    ^ .tab {
      border-radius: 4px;
      width: 200px;
      text-align: left;
      padding-left: 20px;
    }
    ^ .tab-border {
      border: solid 1.5px #604aff;
    }
    ^positionColumn {
      display: inline-block;
      width: 200px;
      vertical-align: top;
      margin-left: 30px;
      margin-right: 50px;
    }
    ^ .navContainer {
      position: absolute;
      bottom: 0;
      height: 40px;
      width: 100% !important;
      background-color: white;
    }
    ^ .block {
      margin-top: 38px;
      width: 500px;
    }
    ^ .header {
      font-size: 24px;
      font-weight: 900;
      margin-bottom: 16px;
    }
    ^ .invoice-details {
      background-color: white;
      padding: 15px;
      border-radius: 4px;
    }
    ^ .invoice-title {
      font-size: 26px;
      font-weight: 900;
    }
  `,
  */

  messages: [
    { name: 'SEND_MONEY_HEADER', message: 'Create new or choose from existing' },
    { name: 'REQUEST_MONEY_HEADER', message: '' }
  ],

  properties: [
    {
      class: 'FObjectProperty',
      of: 'net.nanopay.invoice.model.Invoice',
      name: 'invoiceDetail'
    },
    'isPayable',
    'type',
    {
      name: 'newButton',
      value: true
    },
    'existingButton',
    'newButtonLabel',
    'existingButtonLabel',
    'detailContainer',
    {
      class: 'Boolean',
      name: 'isForm',
      value: true
    },
    {
      class: 'Boolean',
      name: 'isList',
      value: false
    },
    {
      class: 'Boolean',
      name: 'isDetailView',
      value: false
    },
    {
      class: 'foam.dao.DAOProperty',
      name: 'myDAO',
      expression: function() {
        if ( this.type === 'payable' ) {
          return this.user.expenses;
        }
        return this.user.sales;
      }
    },
    {
      class: 'foam.dao.DAOProperty',
      name: 'filteredDAO',
      expression: function() {
        return this.myDAO.orderBy(this.DESC(this.Invoice.ISSUE_DATE));
      }
    }
  ],

  methods: [
    function initE() {
      this.SUPER();

      var view = this;
      this.newButtonLabel = 'New ' + this.type;
      this.existingButtonLabel = 'Existing ' + this.type + 's';

      this.addClass(this.myClass())
        .start().addClass('invoice-content')
          .start().style({ 'display': 'inline-block' })
            .start('h2')
              .add(this.SEND_MONEY_HEADER)
            .end()
            .start(this.NEW, { label$: this.newButtonLabel$ })
              .addClass('tab').enableClass('tab-border', this.newButton$)
            .end()
            .start(this.EXISTING, { label$: this.existingButtonLabel$ })
              .addClass('tab').enableClass('tab-border', this.existingButton$)
              .style({ 'margin-left': '20px' })
            .end()

            .start()
              .start().addClass('block')
                .show(this.isForm$)
                .start().addClass('header')
                  .add('Details')
                .end()
                .tag({
                  class: 'net.nanopay.sme.ui.NewInvoiceModal',
                  invoice: this.invoice,
                  type: this.type
                })
              .end()

              .start()
                .show(this.isList$)
                .select(this.filteredDAO$proxy, function(invoice) {
                  return this.E().addClass('block')
                    .start().addClass('header')
                      .add('Choose an existing ' + view.type)
                    .end()
                    .start({
                      class: 'net.nanopay.sme.ui.InvoiceRowView',
                      data: invoice
                    })
                      .on('click', function() {
                        view.isForm = false;
                        view.isList = false;
                        view.isDetailView = true;
                        view.invoiceDetail = invoice;
                      })
                    .end();
                })
              .end()

              .start()
                .show(this.isDetailView$)
                .add(this.slot(function(invoiceDetail) {
                  return this.E().addClass('block')
                    .start().addClass('header')
                      .add('Choose an existing ' + this.type)
                    .end()
                    .start().add('← Back to selection')
                      .style({ 'margin-bottom': '15px' })
                      .on('click', () => {
                        this.isForm = false;
                        this.isList = true;
                        this.isDetailView = false;
                      })
                    .end()
                    .start({
                      class: 'net.nanopay.sme.ui.InvoiceDetailModal',
                      invoice: invoiceDetail || this.Invoice.create({})
                    }).addClass('invoice-details')
                    .end();
                }))
              .end()
            .end()
          .end()
        .end();
    }
  ],

  actions: [
    {
      name: 'new',
      label: 'New',
      code: function(X) {
        this.isForm = true;
        this.isList = false;
        this.isDetailView = false;
        this.newButton = true;
        this.existingButton = false;
      }
    },
    {
      name: 'existing',
      label: 'Existing',
      code: function(X) {
        this.isForm = false;
        this.isList = true;
        this.isDetailView = false;
        this.newButton = false;
        this.existingButton = true;
      }
    }
  ]
});
