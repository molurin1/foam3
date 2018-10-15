// TODO: add accounting export. Button/Action 'syncButton'
// TODO: add export to csv. Button/Action 'csvButton'
// TODO: dbclick changed to single click
// TODO: clicking invoice should go to invoice detail view
// TODO: Button/Action 'reqMoney'
// TODO: context Menu addition and associated actions
foam.CLASS({
  package: 'net.nanopay.invoice.ui.sme',
  name: 'ReceivablesView',
  extends: 'foam.u2.Controller',

  documentation: 'View to display a table with a list of all Payable Invoices',

  implements: [
    'foam.mlang.Expressions',
  ],

  requires: [
    'foam.u2.PopupView',
    'foam.u2.dialog.Popup',
    'foam.u2.dialog.NotificationMessage',
    'net.nanopay.auth.PublicUserInfo',
    'net.nanopay.invoice.model.Invoice',
  ],

  imports: [
    'user'
  ],

  exports: [
    'dblclick',
    'filter',
    'filteredUserDAO'
  ],

  css: `
    ^ {
      width: 1240px;
      margin: 0 auto;
    }
    ^ .searchIcon {
      position: absolute;
      margin-left: 5px;
      margin-top: 0.3%;
    }
    ^ .filter-search {
      width: 225px;
      height: 40px;
      border-radius: 2px;
      background-color: #ffffff;
      vertical-align: top;
      box-shadow:none;
      padding: 10px 10px 10px 31px;
      font-size: 14px;
    }
    ^ .subTitle {
      font-size: 9pt;
      margin-left: 12%;
      margin-top: -1.5%;
      color: gray;
    }
    ^ .exportButtons {
      background-color: rgba(164, 179, 184, 0.1);
      box-shadow: 0 0 1px 0 rgba(9, 54, 73, 0.8);
      cursor: pointer;
      margin-top: 2%;
    }
    ^ table {
      width: 1240px;
    }
    ^ .foam-u2-view-TableView-row:hover {
      cursor: pointer;
      background: %TABLEHOVERCOLOR%;
    }
    ^ .foam-u2-view-TableView-row {
      height: 40px;
    }
  `,

  properties: [
    {
      class: 'String',
      name: 'filter',
      documentation: 'Search string for Company column',
      view: {
        class: 'foam.u2.TextField',
        type: 'search',
        placeholder: 'Company Search',
        onKey: true
      }
    },
    {
      name: 'userSalesArray',
      documentation: 'Array that is populated on class load with user.sales(payable invoices)'
    },
    {
      name: 'countContact',
      documentation: 'Count field for display'
    },
    {
      name: 'filteredUserDAO',
      documentation: 'DAO that is filtered from Search(\'Property filter\')',
      expression: function(filter, userSalesArray) {
        if ( filter == '' ) {
          this.countContact = userSalesArray ? userSalesArray.length : 0;
          return this.user.sales;
        }

        var filteredByCompanyInvoices = userSalesArray.filter((sale) => {
          var matches = (str) => str && str.toUpperCase().includes(filter.toUpperCase());
          return sale.payer.businessName ? matches(sale.payer.businessName) : matches(sale.payer.label());
        });

        this.countContact = filteredByCompanyInvoices.length;
        return foam.dao.ArrayDAO.create({
          array: filteredByCompanyInvoices,
          of: 'net.nanopay.invoice.model.Invoice'
        });
      },
      view: function() {
        return {
          class: 'foam.u2.view.ScrollTableView',
          columns: [
            net.nanopay.invoice.model.Invoice.PAYER.clone().copyFrom({ label: 'Company', tableCellFormatter: function(_, obj) {
              var additiveSubField = obj.payer.businessName ? obj.payer.businessName : obj.payer.label();
              this.add(additiveSubField);
            } }),
            net.nanopay.invoice.model.Invoice.INVOICE_NUMBER.clone().copyFrom({ label: 'Invoice No.' }),
            net.nanopay.invoice.model.Invoice.AMOUNT.clone().copyFrom({ tableCellFormatter: function(_, obj) {
              var additiveSubField = '+ ';
              if ( obj.destinationCurrency == 'CAD' || obj.destinationCurrency == 'USD' ) additiveSubField += '$';
              additiveSubField += (obj.addCommas((obj.amount/100).toFixed(2)) + ' ' + obj.destinationCurrency);
              this.add(additiveSubField);
            } }),
            'dueDate',
            'lastModified',
            'status'
          ]
        };
      }
    }
  ],

  messages: [
    { name: 'TITLE', message: 'Receivables' },
    { name: 'SUB_TITLE', message: 'Money owed to you' },
    { name: 'COUNT_TEXT', message: 'invoices' },
    { name: 'PLACE_HOLDER_TEXT', message: 'Looks like you do not have any Invoices yet. Please add an Invoie by clicking one of the Quick Actions.' }
  ],

  methods: [
    function init() {
      this.user.sales.select().then((salesSink) => {
        this.userSalesArray = salesSink.array;
      });
    },

    function initE() {
      this.SUPER();
      this
        .addClass(this.myClass())
        .start().style({ 'font-size': '20pt' }).add(this.TITLE).end()
        .start().addClass('subTitle').add(this.SUB_TITLE).end()
        .start()
          .start(this.REQ_MONEY).style({ 'float': 'right' }).end()
        .end()
        .start()
          .start(this.SYNC_BUTTON, { icon: 'images/ic-export.png', showLabel: true })
            .addClass('exportButtons')
          .end()
          .start(this.CSV_BUTTON, { icon: 'images/ic-export.png', showLabel: true })
            .style({ 'margin-left': '2%' }).addClass('exportButtons')
          .end()
          .start().style({ 'margin': '15px 15px 15px 0px' })
            .start({ class: 'foam.u2.tag.Image', data: 'images/ic-search.svg' }).addClass('searchIcon').end()
            .start(this.FILTER).addClass('filter-search').end()
          .end()
        .end()
        .start().add(this.countContact$).add(' ' + this.COUNT_TEXT).style({ 'font-size': '12pt', 'margin': '0px 10px 15px 2px' }).end()
        .add(this.FILTERED_USER_DAO)
        .tag({ class: 'net.nanopay.ui.Placeholder', dao: this.filteredUserDAO, message: this.PLACE_HOLDER_TEXT, image: 'images/ic-bankempty.svg' });
    },

    function dblclick(invoice) {
      // TODO: open Invoice Detail view
      // TODO: change dblclick to singleClick
    }
  ],

  actions: [
    {
      name: 'syncButton',
      label: 'sync',
      toolTip: 'Sync with accounting Software',
      code: function(X) {
        // TODO: Sync to Accounting Software
      }
    },
    {
      name: 'csvButton',
      label: 'Export as CSV',
      toolTip: 'Export list of invoices to a CSV file',
      code: function(X) {
        // TODO: Export to CSV
      }
    },
    {
      name: 'reqMoney',
      label: 'Request money',
      toolTip: 'Pay for selected invoice',
      code: function(X) {
        // TODO:
      }
    }
  ]
});
