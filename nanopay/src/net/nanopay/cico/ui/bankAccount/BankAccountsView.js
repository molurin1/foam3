foam.CLASS({
  package: 'net.nanopay.cico.ui.bankAccount',
  name: 'BankAccountsView',
  extends: 'foam.u2.Controller',

  requires: [
    'net.nanopay.model.BankAccount',
    'foam.u2.dialog.Popup'
  ],

  imports: [ 'bankAccountDAO', 'stack' ],

  implements: [
    'foam.mlang.Expressions',
  ],

  documentation: 'View displaying list of Bank Accounts added.',

  axioms: [
    foam.u2.CSS.create({
      code: function CSS() {/*
        ^ {
          width: 962px;
          margin: 0 auto;
        }
        ^ h3 {
          opacity: 0.6;
          font-family: Roboto;
          font-size: 20px;
          font-weight: 300;
          line-height: 1;
          letter-spacing: 0.3px;
          text-align: left;
          color: #093649;
          display: inline-block;
          vertical-align: top;
          margin: 0;
          margin-top: 20px;
        }
        ^ .bankContentCard {
          width: 218px;
          height: 100px;
          margin-right: 13.5px;
          float: left;
        }
        ^ .actionButton {
          width: 218px;
          height: 100px;
          float: right;
          margin-bottom: 20px;
        }
        ^ .net-nanopay-ui-ActionView-create {
          visibility: hidden;
        }
        ^ .net-nanopay-ui-ActionView-addBank {
          margin: 0;
          background: none;
          outline: none;
          border: none;
          width: 218px;
          height: 100px;
          float: right;
          background-color: #23C2b7;
          letter-spacing: 0.3px;
          color: #FFFFFF;
          border-radius: 2px;
          opacity: 1;
          font-weight: normal;
        }
        ^ .net-nanopay-ui-ActionView-addBank span {
          display: block;
          margin-top: 8px;
          font-size: 12px;
          line-height: 1.33;
          letter-spacing: 0.2px;
        }
        ^ .net-nanopay-ui-ActionView-addBank:hover {
          background: none;
          cursor: pointer;
          background-color: #20B1A7;
        }
        ^ .foam-u2-dialog-Popup.popup-with-topnav {
          margin-top: 155px;
          height: 420px;
        }
        ^ .foam-u2-dialog-Popup-background {
          pointer-events: none;
          background-color: #edf0f5;
          opacity: 1;
        }
        ^ .foam-u2-dialog-Popup-inner {
          background-color: transparent !important;
        }
        ^ .foam-u2-md-OverlayDropdown {
          width: 175px;
        }
      */}
    })
  ],

  properties: [
    'allBanksCount',
    'verifiedBanksCount',
    'unverifiedBanksCount',
    'selection',
    { name: 'data', factory: function () { return this.bankAccountDAO; } }
  ],

  messages: [
    { name: 'TitleAll',         message: 'Total Bank Accounts' },
    { name: 'TitleVerified',    message: 'Verified Account(s)' },
    { name: 'TitleUnverified',  message: 'Unverified Account(s)' },
    { name: 'ActionAdd',        message: 'Add a new bank account' },
    { name: 'MyBankAccounts',   message: 'My Bank Accounts' },
    { name: 'placeholderText',  message: 'You don\'t have any bank accounts right now. Click the Add a bank account button to add a new bank account.' }
  ],

  methods: [
    function initE() {
      var self = this;
      this.data.on.sub(this.onDAOUpdate);
      this.onDAOUpdate();

      this
        .addClass(this.myClass())
          .start('div').addClass('row')
            .start('div').addClass('spacer')
              .tag({class: 'net.nanopay.ui.ContentCard', title: this.TitleAll, content$: this.allBanksCount$ }).addClass('bankContentCard')
            .end()
            .start('div').addClass('spacer')
              .tag({class: 'net.nanopay.ui.ContentCard', title: this.TitleVerified, content$: this.verifiedBanksCount$ }).addClass('bankContentCard')
            .end()
            .start('div').addClass('spacer')
              .tag({class: 'net.nanopay.ui.ContentCard', title: this.TitleUnverified, content$: this.unverifiedBanksCount$ }).addClass('bankContentCard')
            .end()
            .start('div')
              .tag(this.ADD_BANK, { showLabel: true })
            .end()
          .end()
          .start()
            .tag({
                class: 'foam.u2.ListCreateController',
                dao: this.bankAccountDAO,
                factory: function() { return self.BankAccount.create(); },
                detailView: {
                },
              summaryView: this.BankAccountTableView.create()
            })
          .end()
          .tag({ class: 'net.nanopay.ui.Placeholder', dao: this.bankAccountDAO, message: this.placeholderText, image: 'images/icon_bank_account_black.png' })
    }
    
  ],

  actions: [
    {
      name: 'addBank',
      label: 'Add a bank account',
      icon: 'images/ic-plus.svg',
      code: function() {
        this.add(
          this.Popup.create().tag({
            class: 'net.nanopay.cico.ui.bankAccount.form.BankForm',
            title: this.ActionAdd
          }).addClass('popup-with-topnav')
        );
      }
    }
  ],

  classes: [
    {
      name: 'BankAccountTableView',
      extends: 'foam.u2.View',

      requires: [ 
        'net.nanopay.model.BankAccount', 
        'foam.u2.dialog.Popup' 
      ],

      imports: [
        'bankAccountDAO'
      ],

      exports: [
        'unverifiedBank'
      ],

      properties: [
        {
          name: 'unverifiedBank',
          value: null
        },
        {
          name: 'selectedBank',
          value: null
        },
        {
          name: 'selection',
          preSet: function(oldValue, newValue) {
            if ( newValue && newValue.status == 'Unverified' ) {
              this.unverifiedBank = newValue;
              this.verifyAccount();
              return oldValue;
            } else if ( newValue && newValue.status == 'Verified' ) {
              this.selectedAccount = newValue;
              this.deleteAccount();
              return oldValue;
            }
          }
        },
        { name: 'data', factory: function() { return this.bankAccountDAO; } }
      ],

      messages: [
        { name: 'TitleVerification', message: 'Verification' }
      ],

      methods: [
        function initE() {
          var self = this;

          this
            .start({
              class: 'foam.u2.view.TableView',
              selection$: this.selection$,
              editColumnsEnabled: true,
              data: this.data,
              columns: [
                'accountName', 'institutionNumber', 'transitNumber', 'accountNumber', 'status'
              ]
            }).addClass(this.myClass('table')).end();
        },

        function verifyAccount() {
          this.add(
            this.Popup.create().tag({
              class: 'net.nanopay.cico.ui.bankAccount.form.BankForm',
              startAt: 1,
              title: this.TitleVerification
            }).addClass('popup-with-topnav')
          );
        },

        function deleteAccount() {
          this.add(this.Popup.create().tag({ class: 'net.nanopay.cico.ui.bankAccount.DeleteVerifyModal' }));
        }
      ]
    }
  ],

  listeners: [
    {
      name: 'onDAOUpdate',
      isFramed: true,
      code: function() {
        var self = this;
        this.data.select(this.COUNT()).then(function(count) {
          self.allBanksCount = count.value;
        });

        var verifiedBanksDAO = this.data.where(this.EQ(this.BankAccount.STATUS, "Verified"));
        verifiedBanksDAO.select(this.COUNT()).then(function(count) {
          self.verifiedBanksCount = count.value;
        });

        var unverifiedBanksDAO = this.data.where(this.EQ(this.BankAccount.STATUS, "Unverified"));
        unverifiedBanksDAO.select(this.COUNT()).then(function(count) {
          self.unverifiedBanksCount = count.value;
        });
      }
    }
  ]
});
