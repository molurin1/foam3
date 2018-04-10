foam.CLASS({
  package: 'net.nanopay.onboarding.b2b.ui',
  name: 'AddPrincipalOwnersForm',
  extends: 'net.nanopay.ui.wizard.WizardSubView',

  documentation: 'Form to input Principal Owner(s)',

  imports: [
    'countryDAO',
    'regionDAO',
    'validateEmail',
    'validatePostalCode',
    'validatePhone',
    'validateAge',
    'validateCity',
    'validateStreetNumber',
    'validateAddress',
    'validatePrincipalOwner',
    'createPrincipalOwner',
    'principalOwnersDAO',
    'principalOwnersCount',
    'user'
  ],

  implements: [
    'foam.mlang.Expressions'
  ],

  requires: [
    'foam.nanos.auth.Region',
    'foam.u2.dialog.NotificationMessage',
    'foam.nanos.auth.User',
    'foam.nanos.auth.Phone',
    'foam.nanos.auth.Address',
    'foam.dao.ArrayDAO'
  ],

  css:`
    ^ .sectionTitle {
      line-height: 16px;
      font-size: 14px;
      font-weight: bold;

      margin-top: 30px;
      margin-bottom: 20px;
    }

    ^ .fullWidthField.hideTable {
      height: 0 !important;
      overflow: hidden;
      margin-bottom: 0 !important;
      transform: translateY(-40px);
      opacity: 0;
    }

    ^ table {
      width: 540px;
      margin-bottom: 30px;
    }

    ^ thead > tr > th {
      height: 30px;
    }

    ^ .foam-u2-view-TableView tbody > tr {
      height: 30px;
    }

    ^ .foam-u2-view-TableView tbody > tr:hover {
      background: #e9e9e9;
    }

    ^ .foam-u2-view-TableView-selected {
      background-color: rgba(89, 165, 213, 0.3) !important;
    }

    ^ .foam-u2-view-TableView-selected:hover {
      background-color: rgba(89, 165, 213, 0.3) !important;
    }

    ^ .animationContainer {
      position: relative;
      width: 540px;
      height: 64px;
      overflow: hidden;
      box-sizing: border-box;
    }

    ^ .displayContainer {
      position: absolute;
      top: 0;
      left: 0;

      width: 540px;
      height: 64px;

      opacity: 1;
      box-sizing: border-box;

      -webkit-transition: all .15s linear;
      -moz-transition: all .15s linear;
      -ms-transition: all .15s linear;
      -o-transition: all .15s linear;
      transition: all 0.15s linear;

      z-index: 10;
    }

    ^ .displayContainer.hidden {
      left: 540px;
      opacity: 0;
    }

    ^ .displayContainer p {
      margin: 0;
      margin-bottom: 8px;
    }

    ^ .fullWidthField {
      width: 540px;

      -webkit-transition: all .15s linear;
      -moz-transition: all .15s linear;
      -ms-transition: all .15s linear;
      -o-transition: all .15s linear;
      transition: all 0.15s linear;
    }

    ^ .fullWidthField:focus {
      border: solid 1px #59A5D5;
      outline: none;
    }

    ^ .noPadding {
      padding: 0
    }

    ^ .caret {
      position: relative;
      pointer-events: none;
    }

    ^ .caret:before {
      content: '';
      position: absolute;
      top: -23px;
      left: 510px;
      border-top: 7px solid #a4b3b8;
      border-left: 7px solid transparent;
      border-right: 7px solid transparent;
    }

    ^ .caret:after {
      content: '';
      position: absolute;
      left: 12px;
      top: 0;
      border-top: 0px solid #ffffff;
      border-left: 0px solid transparent;
      border-right: 0px solid transparent;
    }

    ^ .displayOnly {
      border: solid 1px rgba(164, 179, 184, 0.5) !important;
    }

    ^ .inputContainer {
      position: absolute;
      top: 0;
      left: 0;

      width: 540px;
      height: 64px;

      opacity: 1;
      box-sizing: border-box;

      z-index: 9;
    }

    ^ .inputContainer.hidden {
      pointer-events: none;
      opacity: 0;
    }

    ^ .nameFieldsCol {
      display: inline-block;
      vertical-align: middle;

      /* 100% minus 2x 20px padding equally divided by 3 fields */
      width: calc((100% - 40px) / 3);
      height: 64px;

      opacity: 1;
      box-sizing: border-box;

      margin-right: 20px;

      -webkit-transition: all .15s linear;
      -moz-transition: all .15s linear;
      -ms-transition: all .15s linear;
      -o-transition: all .15s linear;
      transition: all 0.15s linear;
    }

    ^ .nameFieldsCol:last-child {
      margin-right: 0;
    }

    ^ .nameFieldsCol p {
      margin: 0;
      margin-bottom: 8px;
    }

    ^ .nameFieldsCol.firstName {
      opacity: 0;
      // transform: translateX(64px);
    }
    ^ .nameFieldsCol.middleName {
      opacity: 0;
      transform: translateX(-166.66px);
    }
    ^ .nameFieldsCol.lastName {
      opacity: 0;
      transform: translateX(-166.66px);
    }

    ^ .fields {
      width: 100%;
    }

    ^ .phoneNumberFieldsCol {
      display: inline-block;
      vertical-align: middle;

      height: 64px;

      opacity: 1;
      box-sizing: border-box;

      margin-right: 20px;

      -webkit-transition: all .15s linear;
      -moz-transition: all .15s linear;
      -ms-transition: all .15s linear;
      -o-transition: all .15s linear;
      transition: all 0.15s linear;
    }

    ^ .phoneNumberFieldsCol:last-child {
      margin-right: 0;
    }

    ^ .phoneNumberFieldsCol p {
      margin: 0;
      margin-bottom: 8px;
    }

    ^ .phoneNumberFieldsCol.out {
      opacity: 0;
      transform: translateX(-166.66px);
    }

    ^ .phoneCountryCodeCol {
      width: 105px;
      pointer-events: none;
    }

    ^ .phoneNumberCol {
      width: 415px;
    }

    ^ .streetContainer {
      width: 540px;
    }

    ^ .streetFieldCol {
      display: inline-block;
      margin-right: 20px;
    }

    ^ .streetFieldCol:last-child {
      margin-right: 0;
    }

    ^ .streetNumberField {
      width: 125px;
    }

    ^ .streetNameField {
      width: 395px;
    }

    ^ .net-nanopay-ui-ActionView-addPrincipalOwner {
      width: 540px;
      height: 40px;

      font-size: 14px;

      margin-top: 50px;
    }

    ^ .net-nanopay-ui-ActionView-delete {
      background-color: rgba(216, 30, 5, 0.3) !important;
      border: solid 1px #d81e05 !important;
      color: #d81e05 !important;
      margin-left: 10px;
    }

    ^ .net-nanopay-ui-ActionView-delete:hover,
    ^ .net-nanopay-ui-ActionView-delete:focus {
      background-color: #d81e05 !important;
      color: white !important;
    }

    ^ .net-nanopay-ui-ActionView-cancelEdit {
      color: black !important;
      background-color: rgba(164, 179, 184, 0.1) !important;
      box-shadow: 0 0 1px 0 rgba(9, 54, 73, 0.8) !important;
      float: right;
    }

    ^ .net-nanopay-ui-ActionView-cancelEdit:hover,
    ^ .net-nanopay-ui-ActionView-cancelEdit:focus {
      background-color: rgba(164, 179, 184, 0.3) !important;
    }

    ^ .net-nanopay-ui-ActionView {
      color: white;
      font-size: 12px;
      outline: none;
      background-color: #59a5d5;
    }

    ^ .net-nanopay-ui-ActionView:hover,
    ^ .net-nanopay-ui-ActionView:focus {
      background-color: #3783b3;
    }

    ^ .dropdownContainer {
      width: 540px;
      outline: none;
    }

    ^ .checkBoxContainer {
      position: relative;
      margin-bottom: 20px;
      padding: 13px 0;
    }

    ^ .checkBoxContainer .foam-u2-md-CheckBox {
      display: inline-block;
      vertical-align: middle;

      margin: 0 10px;
      margin-left: 0;

      padding: 0 13px;
    }

    ^ .checkBoxContainer .foam-u2-md-CheckBox:checked {
      background-color: %PRIMARYCOLOR%;
      border-color: %PRIMARYCOLOR%;
    }

    ^ .checkBoxContainer .foam-u2-md-CheckBox-label {
      display: inline-block;
      vertical-align: middle;

      margin: 0;
      position: relative;
    }

    ^ .foam-u2-tag-Select {
      width: 540px;
      border-radius: 0;

      -webkit-appearance: none;
      -moz-appearance: none;
      appearance: none;

      padding-right: 35px;

      cursor: pointer;
    }

    ^ .foam-u2-tag-Select:disabled {
      cursor: default;
      background: white;
    }

    ^ .foam-u2-TextField, ^ .foam-u2-DateView, ^ .foam-u2-tag-Select {
      height: 40px;

      background-color: #ffffff;
      border: solid 1px rgba(164, 179, 184, 0.5);

      padding: 12px 13px;

      box-sizing: border-box;
      outline: none;

      -webkit-transition: all .15s linear;
      -moz-transition: all .15s linear;
      -ms-transition: all .15s linear;
      -o-transition: all .15s linear;
      transition: all 0.15s linear;
    }

    ^ .foam-u2-TextField:focus,
    ^ .foam-u2-DateView:focus,
    ^ .foam-u2-tag-Select:focus,
    ^ .net-nanopay-ui-ActionView:focus {
      border: solid 1px #59A5D5;
    }

    ^ .foam-u2-TextField:disabled,
    ^ .foam-u2-DateView:disabled,
    ^ .foam-u2-tag-Select:disabled,
    ^ .net-nanopay-ui-ActionView:disabled {
      border: solid 1px rgba(164, 179, 184, 0.5) !important;
      color: #a4b3b8 !important;
    }
  `,

  messages: [
    { name: 'BasicInfoLabel', message: 'Basic Information' },
    { name: 'LegalNameLabel', message: 'Legal Name' },
    { name: 'FirstNameLabel', message: 'First Name' },
    { name: 'MiddleNameLabel', message: 'Middle Initials (optional)' },
    { name: 'LastNameLabel', message: 'Last Name' },
    { name: 'JobTitleLabel', message: 'Job Title' },
    { name: 'EmailAddressLabel', message: 'Email Address' },
    { name: 'CountryCodeLabel', message: 'Country Code' },
    { name: 'PhoneNumberLabel', message: 'Phone Number' },
    { name: 'PrincipalTypeLabel', message: 'Principal Type' },
    { name: 'DateOfBirthLabel', message: 'Date of Birth' },
    { name: 'ResidentialAddressLabel', message: 'Residential Address' },
    { name: 'CountryLabel', message: 'Country' },
    { name: 'StreetNumberLabel', message: 'Street Number' },
    { name: 'StreetNameLabel', message: 'Street Name' },
    { name: 'AddressLabel', message: 'Address' },
    { name: 'ProvinceLabel', message: 'Province' },
    { name: 'CityLabel', message: 'City' },
    { name: 'PostalCodeLabel', message: 'Postal Code' }
  ],

  properties: [
    {
      name: 'selectedPrincipalOwner',
      preSet: function(oldValue, newValue) {
        if ( newValue != null ) this.editPrincipalOwner(newValue);
        return newValue;
      }
    },
    {
      class: 'Boolean',
      name: 'isEditingName',
      value: false,
      postSet: function(oldValue, newValue) {
        this.displayedLegalName = '';
        if ( this.firstNameField ) this.displayedLegalName += this.firstNameField;
        if ( this.middleNameField ) this.displayedLegalName += ' ' + this.middleNameField;
        if ( this.lastNameField ) this.displayedLegalName += ' ' + this.lastNameField;
      }
    },
    {
      class: 'Boolean',
      name: 'isEditingPhone',
      value: false,
      postSet: function(oldValue, newValue) {
        this.displayedPhoneNumber = '';
        if ( this.phoneCountryCodeField ) this.displayedPhoneNumber += this.phoneCountryCodeField;
        if ( this.phoneNumberField ) this.displayedPhoneNumber += ' ' + this.phoneNumberField;
      }
    },
    {
      class: 'String',
      name: 'displayedLegalName',
      value: ''
    },
    {
      class: 'String',
      name: 'firstNameField',
      value: '',
      postSet: function(oldValue, newValue) {
        this.viewData.principalOwner.firstName = newValue;
      }
    },
    'firstNameFieldElement',
    {
      class: 'String',
      name: 'middleNameField',
      value: '',
      postSet: function(oldValue, newValue) {
        this.viewData.principalOwner.middleName = newValue;
      }
    },
    {
      class: 'String',
      name: 'lastNameField',
      value: '',
      postSet: function(oldValue, newValue) {
        this.viewData.principalOwner.lastName = newValue;
      }
    },
    {
      class: 'String',
      name: 'jobTitleField',
      value: '',
      postSet: function(oldValue, newValue) {
        this.viewData.principalOwner.jobTitle = newValue;
      }
    },
    {
      class: 'String',
      name: 'emailAddressField',
      value: '',
      postSet: function(oldValue, newValue) {
        this.viewData.principalOwner.emailAddress = newValue;
      }
    },
    {
      class: 'String',
      name: 'displayedPhoneNumber',
      value: '+1'
    },
    {
      class: 'String',
      name: 'phoneCountryCodeField',
      value: '+1',
      postSet: function(oldValue, newValue) {
        this.viewData.principalOwner.countryCode = newValue;
      }
    },
    'phoneNumberFieldElement',
    {
      name: 'phoneNumberField',
      class: 'String',
      value: '',
      postSet: function(oldValue, newValue) {
        this.viewData.principalOwner.phoneNumber = newValue;
      }
    },
    {
      name: 'principleTypeField',
      value: 'Shareholder',
      view: { class: 'foam.u2.view.ChoiceView', choices: [ 'Shareholder', 'Owner', 'Officer', 'To Be Filled Out' ] },
      postSet: function(oldValue, newValue) {
        this.viewData.principalOwner.principleType = newValue;
      }
    },
    {
      class: 'Date',
      name: 'birthdayField',
      tableCellFormatter: function(date) {
        this.add(date ? date.toISOString().substring(0,10) : '');
      },
      postSet: function(oldValue, newValue) {
        this.viewData.principalOwner.birthday = newValue;
      }
    },
    {
      name: 'countryField',
      view: function(_, X) {
        return foam.u2.view.ChoiceView.create({
          dao: X.countryDAO,
          objToChoice: function(a) {
            return [a.id, a.name];
          }
        })
      },
      factory: function() {
        return this.viewData.country || 'CA';
      }
    },
    {
      class: 'String',
      name: 'streetNumberField',
      value: '',
      postSet: function(oldValue, newValue) {
        this.viewData.principalOwner.streetNumber = newValue;
      }
    },
    {
      class: 'String',
      name: 'streetNameField',
      value: '',
      postSet: function(oldValue, newValue) {
        this.viewData.principalOwner.streetName = newValue;
      }
    },
    {
      class: 'String',
      name: 'addressField',
      value: '',
      postSet: function(oldValue, newValue) {
        this.viewData.principalOwner.address = newValue;
      }
    },
    {
      name: 'provinceField',
      view: function(_, X) {
        var choices = X.data.slot(function (countryField) {
          return X.regionDAO.where(X.data.EQ(X.data.Region.COUNTRY_ID, countryField || ""));
        });
        return foam.u2.view.ChoiceView.create({
          objToChoice: function(region) {
            return [region.id, region.name];
          },
          dao$: choices
        });
      },
      postSet: function(oldValue, newValue) {
        this.viewData.principalOwner.province = newValue;
      }
    },
    {
      class: 'String',
      name: 'cityField',
      value: '',
      postSet: function(oldValue, newValue) {
        this.viewData.principalOwner.city = newValue;
      }
    },
    {
      class: 'String',
      name: 'postalCodeField',
      value: '',
      postSet: function(oldValue, newValue) {
        this.viewData.principalOwner.postalCode = newValue;
      }
    },
    {
      class: 'String',
      name: 'addLabel',
      value: 'Add Another Principle Owner'
    },
    {
      class: 'Boolean',
      name: 'isDisplayMode',
      value: false
    },
    {
      class: 'Boolean',
      name: 'isSameAsAdmin',
      value: false,
      postSet: function(oldValue, newValue) {
        this.selectedPrincipalOwner = null;
        this.sameAsAdmin(newValue);
      }
    }
  ],

  methods: [
    function initE() {
      this.SUPER();
      var self = this;
      this.principleTypeField = 'Shareholder';
      var modeSlot = this.isDisplayMode$.map(function(mode) { return mode ? foam.u2.DisplayMode.DISABLED : foam.u2.DisplayMode.RW; });
      var modeSlotSameAsAdmin = this.slot(function(isSameAsAdmin, isDisplayMode) {
        return ( isSameAsAdmin || isDisplayMode ) ? foam.u2.DisplayMode.DISABLED : foam.u2.DisplayMode.RW;
      })
      this.addClass(this.myClass())
        .start('div')
          // TODO: TABLE SHOULD GO HERE
          .start('div')
            .addClass('fullWidthField')
            .enableClass('hideTable', this.principalOwnersCount$.map(function(c) { return c > 0; }), true)
            .start({
              class: 'foam.u2.view.TableView',
              data$: this.principalOwnersDAO$,
              editColumnsEnabled: false,
              selection$: this.selectedPrincipalOwner$,
              columns: [
                'legalName', 'jobTitle', 'principleType'
              ]
            }).end()
          .end()

          .start('div')
            .addClass('fullWidthField')
            .style({ 'margin-bottom':'30px' })
            .enableClass('hideTable', this.selectedPrincipalOwner$.map(function(selected) { return selected ? true : false; }), true)
            .start(this.EDIT).end()
            .start(this.DELETE).end()
            .start(this.CANCEL_EDIT).end()
          .end()

          .start('p').add(this.BasicInfoLabel).addClass('sectionTitle').style({'margin-top':'0'}).end()

          .start('div').addClass('checkBoxContainer')
            .start({ class: 'foam.u2.md.CheckBox', label: 'Same as Admin', data$: this.isSameAsAdmin$ }).end()
          .end()

          .start('div').addClass('animationContainer')
            .start('div')
              .addClass('displayContainer')
              .enableClass('hidden', this.isEditingName$)
                .start('p').add(this.LegalNameLabel).addClass('infoLabel').end()
                .start(this.DISPLAYED_LEGAL_NAME, { mode$: modeSlotSameAsAdmin })
                  .addClass('fullWidthField')
                  .addClass('displayOnly')
                  .on('focus', function() {
                    this.blur();
                    self.firstNameFieldElement && self.firstNameFieldElement.focus();
                    self.isEditingName = true;
                  })
                  .end()
            .end()
            .start('div')
              .addClass('inputContainer')
              .enableClass('hidden', this.isEditingName$, true)
                .start('div')
                  .addClass('nameFieldsCol')
                  .enableClass('firstName', this.isEditingName$, true)
                    .start('p').add(this.FirstNameLabel).addClass('infoLabel').end()
                    .start(this.FIRST_NAME_FIELD, { mode$: modeSlotSameAsAdmin }, this.firstNameFieldElement$)
                      .addClass('fields')
                    .end()
                .end()
                .start('div')
                  .addClass('nameFieldsCol')
                  .enableClass('middleName', this.isEditingName$, true)
                    .start('p').add(this.MiddleNameLabel).addClass('infoLabel').end()
                    .start(this.MIDDLE_NAME_FIELD, { mode$: modeSlotSameAsAdmin })
                      .addClass('fields')
                    .end()
                .end()
                .start('div')
                  .addClass('nameFieldsCol')
                  .enableClass('lastName', this.isEditingName$, true)
                    .start('p').add(this.LastNameLabel).addClass('infoLabel').end()
                    .start(this.LAST_NAME_FIELD, { mode$: modeSlotSameAsAdmin })
                      .addClass('fields')
                    .end()
                .end()
            .end()
          .end()

          .start('div')
            .on('click', function() {
              self.isEditingName = false;
            })
            .start('p').add(this.JobTitleLabel).addClass('infoLabel').end()
            .start(this.JOB_TITLE_FIELD, { mode$: modeSlotSameAsAdmin }).addClass('fullWidthField').end()
            .start('p').add(this.EmailAddressLabel).addClass('infoLabel').end()
            .start(this.EMAIL_ADDRESS_FIELD, { mode$: modeSlotSameAsAdmin }).addClass('fullWidthField').end()

            .start('div')
              .style({ 'margin-top': '20px' })
              .addClass('animationContainer')
              .start('div')
                .addClass('displayContainer')
                .enableClass('hidden', this.isEditingPhone$)
                .start('p').add(this.PhoneNumberLabel).addClass('infoLabel').end()
                .start(this.DISPLAYED_PHONE_NUMBER, { mode$: modeSlotSameAsAdmin })
                  .addClass('fullWidthField')
                  .addClass('displayOnly')
                  .on('focus', function() {
                    this.blur();
                    self.phoneNumberFieldElement && self.phoneNumberFieldElement.focus();
                    self.isEditingPhone = true;
                  })
                .end()
              .end()
              .start('div')
                .addClass('inputContainer')
                .enableClass('hidden', this.isEditingPhone$, true)
                .start('div')
                  .addClass('phoneNumberFieldsCol')
                  .addClass('phoneCountryCodeCol')
                  .enableClass('out', this.isEditingPhone$, true)
                  .start('div').add(this.CountryCodeLabel).addClass('infoLabel').style({ 'margin-bottom': '8px' }).end()
                  .start(this.PHONE_COUNTRY_CODE_FIELD, { mode: foam.u2.DisplayMode.DISABLED })
                    .addClass('fields')
                    .on('focus', function() {
                      this.blur();
                      self.phoneNumberFieldElement && self.phoneNumberFieldElement.focus();
                    })
                  .end()
                .end()
                .start('div')
                  .addClass('phoneNumberFieldsCol')
                  .addClass('phoneNumberCol')
                  .enableClass('out', this.isEditingPhone$, true)
                  .start('p').add(this.PhoneNumberLabel).addClass('infoLabel').end()
                  .start(this.PHONE_NUMBER_FIELD, { mode$: modeSlot }, this.phoneNumberFieldElement$)
                    .addClass('fields')
                    .on('focus', function() {
                      self.isEditingPhone = true;
                    })
                    .on('focusout', function() {
                      self.isEditingPhone = false;
                    })
                  .end()
                .end()
              .end()
            .end()

            .start('p').add(this.PrincipalTypeLabel).addClass('infoLabel').end()
            .start('div').addClass('dropdownContainer')
              .tag(this.PRINCIPLE_TYPE_FIELD, { mode$: modeSlot })
              .start('div').addClass('caret').end()
            .end()
            .start('p').add(this.DateOfBirthLabel).addClass('infoLabel').end()
            .start(this.BIRTHDAY_FIELD, { mode$: modeSlot }).addClass('fullWidthField').end()

            // ADDRESS INFO
            .start('p').add(this.ResidentialAddressLabel).addClass('sectionTitle').end()
            .start('p').add(this.CountryLabel).addClass('infoLabel').end()
            .start('div').addClass('dropdownContainer')
              .start(this.COUNTRY_FIELD, { mode$: modeSlot }).end()
              .start('div').addClass('caret').end()
            .end()
            .start('div').addClass('streetContainer')
              .start('div').addClass('streetFieldCol')
                .start('p').add(this.StreetNumberLabel).addClass('infoLabel').end()
                .start(this.STREET_NUMBER_FIELD, { mode$: modeSlot }).addClass('fullWidthField').addClass('streetNumberField').end()
              .end()
              .start('div').addClass('streetFieldCol')
                .start('p').add(this.StreetNameLabel).addClass('infoLabel').end()
                .start(this.STREET_NAME_FIELD, { mode$: modeSlot }).addClass('fullWidthField').addClass('streetNameField').end()
              .end()
            .end()
            .start('p').add(this.AddressLabel).addClass('infoLabel').end()
            .start(this.ADDRESS_FIELD, { mode$: modeSlot }).addClass('fullWidthField').end()
            .start('p').add(this.ProvinceLabel).addClass('infoLabel').end()
            .start('div').addClass('dropdownContainer')
              .start(this.PROVINCE_FIELD, { mode$: modeSlot }).end()
              .start('div').addClass('caret').end()
            .end()
            .start('p').add(this.CityLabel).addClass('infoLabel').end()
            .start(this.CITY_FIELD, { mode$: modeSlot }).addClass('fullWidthField').end()
            .start('p').add(this.PostalCodeLabel).addClass('infoLabel').end()
            .start(this.POSTAL_CODE_FIELD, { mode$: modeSlot }).addClass('fullWidthField').end()
            .start(this.ADD_PRINCIPAL_OWNER, { label$: this.addLabel$ }).end()
          .end()
        .end();
    },

    function clearFields() {
      this.firstNameField = '';
      this.middleNameField = '';
      this.lastNameField = '';
      this.isEditingName = false; // This will change displayedLegalName as well
      this.jobTitleField = '';
      this.emailAddressField = '';
      this.phoneNumberField = '';
      this.isEditingPhone = false;
      this.principleTypeField = 'Shareholder';
      this.birthdayField = null;

      this.countryField = 'CA';
      this.streetNumberField = '';
      this.streetNameField = '';
      this.addressField = '';
      this.provinceField = 'AB';
      this.cityField = '';
      this.postalCodeField = '';

      this.addLabel = 'Add Another Principal Owner';
      this.selectedPrincipalOwner = undefined;
      this.isDisplayMode = false;

      this.document.getElementsByClassName('stackColumn')[0].scrollTop = 0;
      this.document.body.scrollTop = 0; // For Safari
      this.document.documentElement.scrollTop = 0; // For Chrome, Firefox, IE and Opera
    },

    function editPrincipalOwner(owner) {
      this.isSameAsAdmin = false;

      this.firstNameField = owner.firstName;
      this.middleNameField = owner.middleName;
      this.lastNameField = owner.lastName;
      this.isEditingName = false; // This will change displayedLegalName as well
      this.jobTitleField = owner.jobTitle;
      this.emailAddressField = owner.email;
      this.phoneNumberField = this.extractPhoneNumber(owner.phone);
      this.isEditingPhone = false;
      this.principleTypeField = owner.principleType;
      this.birthdayField = owner.birthday;

      this.countryField = owner.address.countryId;
      this.streetNumberField = owner.address.streetNumber;
      this.streetNameField = owner.address.streetName;
      this.addressField = owner.address.address2;
      this.provinceField = owner.address.regionId;
      this.cityField = owner.address.city;
      this.postalCodeField = owner.address.postalCode;

      this.addLabel = 'Update';

      this.isDisplayMode = true;
    },

    function extractPhoneNumber(phone) {
      return phone.number.substring(2);
    },

    function sameAsAdmin(flag) {
      this.clearFields();
      if ( flag ) {
        this.firstNameField = this.user.firstName;
        this.middleNameField = this.user.middleName;
        this.lastNameField = this.user.lastName;
        this.isEditingName = false;

        this.jobTitleField = this.user.jobTitle;
        this.emailAddressField = this.user.email;
        this.phoneNumberField = this.extractPhoneNumber(this.user.phone);
        this.isEditingPhone = false;
      }
    }
  ],

  actions: [
    {
      name: 'edit',
      label: 'Edit',
      isAvailable: function(isDisplayMode) {
        return isDisplayMode;
      },
      code: function() {
        this.isDisplayMode = false;
      }
    },
    {
      name: 'delete',
      label: 'Delete',
      isAvailable: function(isDisplayMode) {
        return isDisplayMode;
      },
      code: function() {
        this.principalOwnersDAO.remove(this.selectedPrincipalOwner);
        this.clearFields();
      }
    },
    {
      name: 'cancelEdit',
      label: 'Cancel',
      code: function() {
        this.clearFields();
      }
    },
    {
      name: 'addPrincipalOwner',
      isEnabled: function(isDisplayMode) {
        return ! isDisplayMode;
      },
      code: function() {
        if ( !this.validatePrincipalOwner() ) return;
        // TODO?: Maybe add a loading indicator?
        this.createPrincipalOwner();
        this.clearFields();
      }
    }
  ]
});
