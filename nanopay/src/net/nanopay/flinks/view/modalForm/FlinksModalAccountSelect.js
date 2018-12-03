foam.CLASS({
  package: 'net.nanopay.flinks.view.modalForm',
  name: 'FlinksModalAccountSelect',
  extends: 'net.nanopay.ui.wizardModal.WizardModalSubView',

  implements: [
    'foam.mlang.Expressions'
  ],

  requires: [
    'net.nanopay.ui.LoadingSpinner',
    'net.nanopay.bank.BankAccount',
    'net.nanopay.bank.BankAccountStatus',
    'net.nanopay.bank.CABankAccount',
    'net.nanopay.payment.Institution'
  ],

  exports: [
    'as accountSelection'
  ],

  imports: [
    'institutionDAO',
    'isConnecting',
    'notify',
    'institution',
    'flinksAuth',
    'user',
    'cadCurrency'
  ],

  css: `
    ^ {
      width: 504px;
    }
    ^content {
      position: relative;
      padding: 24px;
      padding-top: 0;
    }
    ^account-card {
      width: 456px;
      height: 83px;
      box-sizing: border-box;
      border-radius: 3px;
      box-shadow: 0 1px 1px 0 #dae1e9;
      border: 1px solid #edf0f5;

      margin-bottom: 16px;

      background-repeat: no-repeat;
      background-position-x: 24px;
      background-position-y: 34px;
      background-image: url(images/ablii/radio-resting.svg);

      cursor: pointer;

      -webkit-transition: all .15s ease-in-out;
      -moz-transition: all .15s ease-in-out;
      -ms-transition: all .15s ease-in-out;
      -o-transition: all .15s ease-in-out;
      transition: all .15s ease-in-out;
    }
    ^account-card:hover {
      box-shadow: 0 10px 24px 0 rgba(0, 0, 0, 0.12), 0 0 24px 0 rgba(0, 0, 0, 0.15);
    }
    ^account-card:last-child {
      margin-bottom: 0;
    }
    ^account-card.selected {
      border: 1px solid #604aff;
      background-image: url(images/ablii/radio-active.svg);
    }
    ^account-info-container {
      display: flex;
      margin-left: 56px;
      height: 100%;
      flex-direction: row;
      align-items: center;
      padding-right: 24px;
    }
    ^account-info-container p {
      margin: 0;
    }
    ^title {
      font-size: 14px;
      font-weight: 900;
    }
    ^subtitle {
      font-size: 10px;
      font-weight: normal;
      color: #8e9090;
    }
    ^balance {
      font-size: 14px;
      font-weight: 900;
      margin-left: auto !important;
    }
  `,

  properties: [
    {
      name: 'loadingSpinner',
      factory: function() {
        var spinner = this.LoadingSpinner.create();
        return spinner;
      }
    },
    {
      class: 'Int',
      name: 'selectTick',
      value: - 1000000,
    },
    {
      class: 'Array',
      name: 'selectedAccounts',
      value: []
    },
    {
      class: 'Array',
      name: 'filteredValidAccounts',
      factory: function() {
        return this.viewData.accounts
          .filter((t) => this.isValidAccount(t));
      }
    }
  ],

  messages: [
    { name: 'Connecting', message: 'Connecting... This may take a few minutes.'},
    { name: 'InvalidForm', message: 'Please select an account to proceed.'}
  ],

  methods: [
    function initE() {
      var self = this;
      this.addClass(this.myClass())
        .start({ class: 'net.nanopay.flinks.view.element.FlinksModalHeader', institution: this.institution }).end()
        .start('div').addClass(this.myClass('content'))
          .start('div').addClass('spinner-container').show(this.isConnecting$)
            .start('div').addClass('spinner-container-center')
              .add(this.loadingSpinner)
              .start('p').add(this.Connecting).addClass('spinner-text').end()
            .end()
          .end()
          .forEach(this.filteredValidAccounts, function(account, index) {
            this.start('div').addClass(self.myClass('account-card'))
              .enableClass('selected', self.selectTick$.map((o) => self.isAccountSelected(account)))
              .start('div').addClass(self.myClass('account-info-container'))
                .start('div').addClass(self.myClass('info-container'))
                  .start('p').addClass(self.myClass('title'))
                    .add(account.Title)
                  .end()
                  .start('p').addClass(self.myClass('subtitle'))
                    .add('Account # ' + account.AccountNumber)
                  .end()
                .end()
                .start('p').addClass(self.myClass('balance'))
                  .add(self.cadCurrency.format(account.Balance.Current))
                .end()
              .end()
              .on('click', () => {
                self.accountOnClick(account);
                self.selectTick ++;
              })
            .end();
          })
        .end()
        .start({class: 'net.nanopay.sme.ui.wizardModal.WizardModalNavigationBar', back: this.BACK, next: this.NEXT}).end();
    },

    function createCurrencyFormatterSlot(amount) {
      return this.slot(this.currencyDAO.find('CAD').then((currency) => {
        this.formattedBalance = currency.format(this.balance);
      }));
    },

    function isValidAccount(account) {
      var hasTransitNumber = account.TransitNumber && account.TransitNumber !== '';
      var isCAD = account.Currency === 'CAD';
      return hasTransitNumber && isCAD;
    },

    function isAccountSelected(account) {
      return !! this.selectedAccounts.find((t) => t === account);
    },

    function accountOnClick(account) {
      if ( this.isAccountSelected(account) ) {
        this.selectedAccounts
          .splice(this.selectedAccounts.indexOf(account), 1);
      } else {
        this.selectedAccounts.push(account);
      }
    },

    async function crossCheckInstitutions() {
      this.isConnecting = true;
      var institutions = await this.institutionDAO.where(
        this.EQ(this.Institution.NAME, this.institution.name)
      ).select();
      var institution = institutions.array[0];
      for ( var account of this.selectedAccounts ) {
        var newAccount = this.createBankAccount( account, institution );
        this.viewData.bankAccounts ? this.viewData.bankAccounts.push(newAccount) : this.viewData.bankAccounts = [ newAccount ];
      }
      this.isConnecting = false;
      this.pushToId('pad');
    },

    function createBankAccount(account, institution) {
      return this.CABankAccount.create({
        name: account.Title,
        accountNumber: account.AccountNumber,
        institution: institution,
        institutionNumber: institution.institutionNumber,
        branchId: account.TransitNumber, // setting branchId cause branch maybe present or not(the lookup is done on the BE).
        status: this.BankAccountStatus.VERIFIED,
        owner: this.user.id
      });
    }
  ],

  actions: [
    {
      name: 'back',
      label: 'Cancel',
      code: function(X) {
        X.closeDialog();
      }
    },
    {
      name: 'next',
      label: 'Confirm',
      code: function(X) {
        var model = X.accountSelection;
        if ( model.isConnecting ) return;
        if ( model.selectedAccounts.length > 0 ) {
          model.crossCheckInstitutions();
          return;
        }
        X.notify(model.InvalidForm, 'error');
      }
    }
  ]
});
