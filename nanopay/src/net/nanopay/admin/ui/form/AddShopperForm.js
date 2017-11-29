foam.CLASS({
  package: 'net.nanopay.admin.ui.form',
  name: 'AddShopperForm',
  extends: 'net.nanopay.ui.wizard.WizardView',

  documentation: 'Pop up that extends WizardView for adding a shopper',

  requires: [
    'foam.nanos.auth.User',
    'foam.nanos.auth.Address',
    'net.nanopay.ui.NotificationMessage',
    'net.nanopay.tx.model.Transaction'
  ],

  imports: [
    'closeDialog',
    'stack',
    'userDAO',
    'user',
    'transactionDAO'
  ],

  axioms: [
    foam.u2.CSS.create({code: net.nanopay.ui.wizard.WizardView.getAxiomsByClass(foam.u2.CSS)[0].code})
  ],

  methods: [
    function init() {
      this.views = [
        { parent: 'addShopper', id: 'form-addShopper-info',      label: 'Shopper Info', view: { class: 'net.nanopay.admin.ui.form.AddShopperInfoForm' } },
        { parent: 'addShopper', id: 'form-addShopper-review',    label: 'Review',       view: { class: 'net.nanopay.admin.ui.form.AddShopperReviewForm' } },
        { parent: 'addShopper', id: 'form-addShopper-sendMoney', label: 'Send Money',   view: { class: 'net.nanopay.admin.ui.form.AddShopperSendMoneyForm' } },
        { parent: 'addShopper', id: 'form-addShopper-done',      label: 'Done',         view: { class: 'net.nanopay.admin.ui.form.AddShopperDoneForm' } }
      ];
      this.SUPER();
    }
  ],

  actions: [
    {
      name: 'goBack',
      label: 'Back',
      isAvailable: function() { return true; },
      code: function(X) {
        X.stack.push({ class: 'net.nanopay.admin.ui.UserView' });
      }
    },
    {
      name: 'goNext',
      label: 'Next',
      isAvailable: function(position) {
        if( position <= this.views.length - 1 ) return true;
        return false;
      },
      code: function() {
        var self = this;

        // info from form
        var shopperInfo = this.viewData;

        if ( this.position == 0 ) { 
          // Shopper Info
          if ( ( shopperInfo.firstName == null || shopperInfo.firstName.trim() == '' ) ||
          ( shopperInfo.lastName == null || shopperInfo.lastName.trim() == '' ) ||
          ( shopperInfo.emailAddress == null || shopperInfo.emailAddress.trim() == '' ) ||
          ( shopperInfo.phoneNumber == null || shopperInfo.phoneNumber.trim() == '' ) ||
          ( shopperInfo.birthday == null || shopperInfo.birthday == 'yyyy-mm-dd' ) ||
          ( shopperInfo.streetNumber == null || shopperInfo.streetNumber.trim() == '' ) ||
          ( shopperInfo.streetName == null || shopperInfo.streetName.trim() == '' ) ||
          ( shopperInfo.city == null || shopperInfo.city.trim() == '' ) ||
          ( shopperInfo.postalCode == null || shopperInfo.postalCode.trim() == '' ) ||
          ( shopperInfo.password == null || shopperInfo.password.trim() == '' ) )
          {
            self.add(self.NotificationMessage.create({ message: 'Please fill out all necessary fields before proceeding.', type: 'error' }));
            return;
          }

          if( true ) {
            self.subStack.push(self.views[self.subStack.pos + 1].view);
            return;
          }

        }

        if ( this.position == 1 ) {
          // Review
          var shopperAddress = this.Address.create({
            address: shopperInfo.streetNumber + ' ' + shopperInfo.streetName,
            suite: shopperInfo.addressLine,
            city: shopperInfo.city,
            postalCode: shopperInfo.postalCode,
            regionId: shopperInfo.province
          });

          var newShopper = this.User.create({
            firstName: shopperInfo.firstName,
            lastName: shopperInfo.lastName,
            email: shopperInfo.emailAddress,
            type: 'Shopper',
            birthday: shopperInfo.birthday,
            address: shopperAddress,
            password: shopperInfo.password
          });

          this.userDAO.put(newShopper).then(function(response) {
            shopperInfo.shopper = response;
            self.add(self.NotificationMessage.create({ message: 'New shopper ' + shopperInfo.firstName + ' ' + shopperInfo.lastName + ' successfully added!', type: '' }));
            self.subStack.push(self.views[self.subStack.pos + 1].view);
            return;
          }).catch(function(error) {
            self.add(self.NotificationMessage.create({ message: error.message, type: 'error' }));
            return;
          });

        }

        if ( this.position == 2 ) {
          // Send Money

          if( true ) {
            if( shopperInfo.amount == 0 || shopperInfo.amount == null ) {
              self.add(self.NotificationMessage.create({ message: 'Please enter an amount greater than $0.00.', type: 'error' }));
              return;
            }

            var transaction = this.Transaction.create({
              payeeId: shopperInfo.shopper.id,
              payerId: this.user.id,
              amount: shopperInfo.amount
            });

            this.transactionDAO.put(transaction).then(function(response) {
              self.add(self.NotificationMessage.create({ message: 'Value transfer successfully sent' }));
              self.subStack.push(self.views[self.subStack.pos + 1].view);
              return;
            }).catch(function(error) {
              self.add(self.NotificationMessage.create({ message: error.message, type: 'error' }));
              return;
            });

          }
        }

        if ( this.subStack.pos == this.views.length - 1 ) {
          // Done
          return this.stack.push({ class: 'net.nanopay.admin.ui.UserView' });
        }

      }
    }
  ]
});