foam.CLASS({
  package: 'net.nanopay.sme.onboarding.ui',
  name: 'BeneficialOwnershipForm',
  extends: 'net.nanopay.ui.wizard.WizardSubView',

  documentation: ` Fifth step in the business registration wizard,
  responsible for collecting beneficial owner information.
`,

imports: [
  'wizard',
  'countryDAO',
  'regionDAO',
  'validateEmail',
  'validatePostalCode',
  'validatePhone',
  'validateAge',
  'validateCity',
  'validateStreetNumber',
  'validateAddress',
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
  { name: 'Address2Label', message: 'Address 2 (optional)' },
  { name: 'Address2Hint', message: 'Apartment, suite, unit, building, floor, etc.' },
  { name: 'ProvinceLabel', message: 'Province' },
  { name: 'CityLabel', message: 'City' },
  { name: 'PostalCodeLabel', message: 'Postal Code' },
  { name: 'PrincipalOwnerError', message: 'A principal owner with that name already exists.' }
],

properties: [
  {
    name: 'principalOwnersDAO',
    factory: function() {
      if ( this.viewData.user.principalOwners ) {
        return foam.dao.ArrayDAO.create({ array: this.viewData.user.principalOwners, of: 'foam.nanos.auth.User' });
      }
      return foam.dao.ArrayDAO.create({ of: 'foam.nanos.auth.User' });
    }
  },
  {
    name: 'editingPrincipalOwner',
    postSet: function(oldValue, newValue) {
      if ( newValue != null ) this.editPrincipalOwner(newValue, true);
      this.tableViewElement.selection = newValue;
    }
  },
  {
    name: 'addPrincipalOwnerLabel',
    expression: function(editingPrincipalOwner) {
      if (editingPrincipalOwner) {
        return 'Update';
      } else {
        return 'Add Another Principle Owner';
      }
    }
  },
  {
    class: 'Long',
    name: 'principalOwnersCount',
    factory: function() {
      // In case we load from a save state
      this.principalOwnersDAO.select(foam.mlang.sink.Count.create()).then(function(c) {
        return c.value;
      });
    }
  },
  'tableViewElement',
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
    value: ''
  },
  'firstNameFieldElement',
  {
    class: 'String',
    name: 'middleNameField',
    value: ''
  },
  {
    class: 'String',
    name: 'lastNameField',
    value: ''
  },
  {
    class: 'String',
    name: 'jobTitleField',
    value: ''
  },
  {
    class: 'String',
    name: 'emailAddressField',
    value: ''
  },
  {
    class: 'String',
    name: 'displayedPhoneNumber',
    value: '+1'
  },
  {
    class: 'String',
    name: 'phoneCountryCodeField',
    value: '+1'
  },
  'phoneNumberFieldElement',
  {
    name: 'phoneNumberField',
    class: 'String',
    value: ''
  },
  {
    name: 'principleTypeField',
    value: 'Shareholder',
    view: {
      class: 'foam.u2.view.ChoiceView',
      choices: ['Shareholder', 'Owner', 'Officer']
    }
  },
  {
    class: 'Date',
    name: 'birthdayField',
    tableCellFormatter: function(date) {
      this.add(date ? date.toISOString().substring(0,10) : '');
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
      });
    },
    factory: function() {
      return this.viewData.country || 'CA';
    }
  },
  {
    class: 'String',
    name: 'streetNumberField',
    value: ''
  },
  {
    class: 'String',
    name: 'streetNameField',
    value: ''
  },
  {
    class: 'String',
    name: 'suiteField',
    value: ''
  },
  {
    name: 'provinceField',
    view: function(_, X) {
      var choices = X.data.slot(function(countryField) {
        return X.regionDAO.where(X.data.EQ(X.data.Region.COUNTRY_ID, countryField || ''));
      });
      return foam.u2.view.ChoiceView.create({
        objToChoice: function(region) {
          return [region.id, region.name];
        },
        dao$: choices
      });
    }
  },
  {
    class: 'String',
    name: 'cityField',
    value: ''
  },
  {
    class: 'String',
    name: 'postalCodeField',
    value: ''
  },
  'addButtonElement',
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
      if ( newValue ) this.editingPrincipalOwner = null;
      this.sameAsAdmin(newValue);
    }
  }
],

methods: [
  function init() {
    this.SUPER();
    this.principalOwnersDAO.on.sub(this.onDAOChange);
    this.onDAOChange();

    // Gives the onboarding wizard access to the validations
    this.wizard.addPrincipalOwnersForm = this;
  },

  function initE() {
    this.SUPER();
    var self = this;
    this.principleTypeField = 'Shareholder';
    var modeSlot = this.isDisplayMode$.map(function(mode) {
      return mode ? foam.u2.DisplayMode.DISABLED : foam.u2.DisplayMode.RW;
    });
    var modeSlotSameAsAdmin = this.slot(function(isSameAsAdmin, isDisplayMode) {
      return ( isSameAsAdmin || isDisplayMode ) ? foam.u2.DisplayMode.DISABLED : foam.u2.DisplayMode.RW;
    });
    this.scrollToTop();

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
            disableUserSelection: true,
            columns: [
              'legalName', 'jobTitle', 'principleType',
              foam.core.Property.create({
                name: 'delete',
                label: '',
                tableCellFormatter: function(value, obj, axiom) {
                  this.start('div').addClass('deleteButton')
                    .start({ class: 'foam.u2.tag.Image', data: 'images/ic-trash.svg'}).end()
                    .start('p').addClass('buttonLabel').add('Delete').end()
                    .on('click', function(evt) {
                      evt.stopPropagation();
                      this.blur();
                      if ( self.editingPrincipalOwner === obj ) {
                        self.editingPrincipalOwner = null;
                        self.clearFields();
                      }
                      self.deletePrincipalOwner(obj);
                    })
                  .end();
                }
              }),
              foam.core.Property.create({
                name: 'edit',
                label: '',
                factory: function() {
                  return {};
                },
                tableCellFormatter: function(value, obj, axiom) {
                  this.start('div').addClass('editButton')
                    .start({ class: 'foam.u2.tag.Image', data: 'images/ic-edit.svg'}).end()
                    .start('p').addClass('buttonLabel').add('Edit').end()
                    .on('click', function(evt) {
                      evt.stopPropagation();
                      this.blur();
                      self.editingPrincipalOwner = obj;
                    })
                  .end();
                }
              })
            ]
          }, {}, this.tableViewElement$).end()
        .end()

        .start('p').add(this.BasicInfoLabel).addClass('sectionTitle').style({ 'margin-top': '0' }).end()

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
                .start(this.PHONE_NUMBER_FIELD, { mode$: modeSlot, placeholder: 'format: 000-000-0000' }, this.phoneNumberFieldElement$)
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
          .start('p').add(this.Address2Label).addClass('infoLabel').end()
          .start(this.SUITE_FIELD, { mode$: modeSlot }).addClass('fullWidthField').end()
          .start('p').add(this.Address2Hint).addClass('address2Hint').end()
          .start('p').add(this.ProvinceLabel).addClass('infoLabel').end()
          .start('div').addClass('dropdownContainer')
            .start(this.PROVINCE_FIELD, { mode$: modeSlot }).end()
            .start('div').addClass('caret').end()
          .end()
          .start('p').add(this.CityLabel).addClass('infoLabel').end()
          .start(this.CITY_FIELD, { mode$: modeSlot }).addClass('fullWidthField').end()
          .start('p').add(this.PostalCodeLabel).addClass('infoLabel').end()
          .start(this.POSTAL_CODE_FIELD, { mode$: modeSlot }).addClass('fullWidthField').end()

          .start('div').style({ 'margin-top': '50px' })
            .start(this.CANCEL_EDIT)
              .enableClass('hidden', this.editingPrincipalOwner$, true)
              .on('focus', function() {
                if ( ! self.editingPrincipalOwner ) self.addButtonElement.focus();
              })
            .end()
            .start(this.ADD_PRINCIPAL_OWNER, { isDisplayMode$: this.addButtonElement$, label$: this.addPrincipalOwnerLabel$ })
              .enableClass('updateButton', this.editingPrincipalOwner$)
            .end()
          .end()

        .end()
      .end();
  },

  function clearFields(scrollToTop) {
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
    this.suiteField = '';
    this.provinceField = 'AB';
    this.cityField = '';
    this.postalCodeField = '';

    this.isDisplayMode = false;

    if ( scrollToTop ) {
      this.scrollToTop();
    }
  },

  function editPrincipalOwner(user, editable) {
    var formHeaderElement = this.document.getElementsByClassName('sectionTitle')[0];
    formHeaderElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
    this.isSameAsAdmin = false;

    this.firstNameField = user.firstName;
    this.middleNameField = user.middleName;
    this.lastNameField = user.lastName;
    this.isEditingName = false; // This will change displayedLegalName as well
    this.jobTitleField = user.jobTitle;
    this.emailAddressField = user.email;
    this.phoneNumberField = this.extractPhoneNumber(user.phone);
    this.isEditingPhone = false;
    this.principleTypeField = user.principleType;
    this.birthdayField = user.birthday;

    this.countryField = user.address.countryId;
    this.streetNumberField = user.address.streetNumber;
    this.streetNameField = user.address.streetName;
    this.suiteField = user.address.suite;
    this.provinceField = user.address.regionId;
    this.cityField = user.address.city;
    this.postalCodeField = user.address.postalCode;

    this.isDisplayMode = ! editable;
  },

  function extractPhoneNumber(phone) {
    return phone.number.substring(2);
  },

  function sameAsAdmin(flag) {
    this.clearFields();
    if ( flag ) {
      var formHeaderElement = this.document.getElementsByClassName('sectionTitle')[0];
      formHeaderElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
      this.firstNameField = this.viewData.user.firstName;
      this.middleNameField = this.viewData.user.middleName;
      this.lastNameField = this.viewData.user.lastName;
      this.isEditingName = false;

      this.jobTitleField = this.viewData.user.jobTitle;
      this.emailAddressField = this.viewData.user.email;
      this.phoneNumberField = this.extractPhoneNumber(this.viewData.user.phone);
      this.isEditingPhone = false;
    }
  },

  function isFillingPrincipalOwnerForm() {
    if ( this.firstNameField ||
         this.middleNameField ||
         this.lastNameField ||
         this.jobTitleField ||
         this.emailAddressField ||
         this.phoneNumberField ||
         this.birthdayField ||
         this.streetNumberField ||
         this.streetNameField ||
         this.suiteField ||
         this.cityField ||
         this.postalCodeField ) {
      return true;
    }
    return false;
  },

  function deletePrincipalOwner(obj) {
    var self = this;
    this.principalOwnersDAO.remove(obj).then(function(deleted) {
      self.prevDeletedPrincipalOwner = deleted;
    });
  },

  function validatePrincipalOwner() {
    if ( ! this.firstNameField || ! this.lastNameField ) {
      this.add(this.NotificationMessage.create({ message: 'First and last name fields must be populated.', type: 'error' }));
      return false;
    }

    if ( ! this.jobTitleField ) {
      this.add(this.NotificationMessage.create({ message: 'Job title field must be populated.', type: 'error' }));
      return false;
    }

    if ( ! this.validateEmail(this.emailAddressField) ) {
      this.add(this.NotificationMessage.create({ message: 'Invalid email address.', type: 'error' }));
      return false;
    }

    if ( ! this.validatePhone(this.phoneCountryCodeField + this.phoneNumberField) ) {
      this.add(this.NotificationMessage.create({ message: 'Invalid phone number.', type: 'error' }));
      return false;
    }

    // By pass for safari & mozilla type='date' on input support
    // Operator checking if dueDate is a date object if not, makes it so or throws notification.
    if ( isNaN(this.birthdayField) && this.birthdayField != null ) {
      this.add(foam.u2.dialog.NotificationMessage.create({ message: 'Please Enter Valid Birthday yyyy-mm-dd.', type: 'error' }));
      return;
    }
    if ( ! this.validateAge(this.birthdayField) ) {
      this.add(this.NotificationMessage.create({ message: 'Principal owner must be at least 16 years of age.', type: 'error' }));
      return false;
    }

    if ( ! this.validateStreetNumber(this.streetNumberField) ) {
      this.add(this.NotificationMessage.create({ message: 'Invalid street number.', type: 'error' }));
      return false;
    }
    if ( ! this.validateAddress(this.streetNameField) ) {
      this.add(this.NotificationMessage.create({ message: 'Invalid street name.', type: 'error' }));
      return false;
    }
    if ( this.suiteField.length > 0 && ! this.validateAddress(this.suiteField) ) {
      this.add(this.NotificationMessage.create({ message: 'Invalid address line.', type: 'error' }));
      return false;
    }
    if ( ! this.validateCity(this.cityField) ) {
      this.add(this.NotificationMessage.create({ message: 'Invalid city name.', type: 'error' }));
      return false;
    }
    if ( ! this.validatePostalCode(this.postalCodeField) ) {
      this.add(this.NotificationMessage.create({ message: 'Invalid postal code.', type: 'error' }));
      return false;
    }

    return true;
  }
],

actions: [
  {
    name: 'cancelEdit',
    label: 'Cancel',
    code: function() {
      this.editingPrincipalOwner = null;
      this.clearFields();
    }
  },
  {
    name: 'addPrincipalOwner',
    isEnabled: function(isDisplayMode) {
      return ! isDisplayMode;
    },
    code: async function() {
      if ( ! this.validatePrincipalOwner() ) return;

      var principalOwner;

      if ( this.editingPrincipalOwner ) {
        principalOwner = this.editingPrincipalOwner;
      } else {
        principalOwner = this.User.create({
          id: this.principalOwnersCount + 1
        });
      }

      principalOwner.firstName = this.firstNameField;
      principalOwner.middleName = this.middleNameField;
      principalOwner.lastName = this.lastNameField;
      principalOwner.email = this.emailAddressField;
      principalOwner.phone = this.Phone.create({
        number: this.phoneCountryCodeField + this.phoneNumberField
      });
      principalOwner.birthday = this.birthdayField;
      principalOwner.address = this.Address.create({
        streetNumber: this.streetNumberField,
        streetName: this.streetNameField,
        suite: this.suiteField,
        city: this.cityField,
        postalCode: this.postalCodeField,
        countryId: this.countryField,
        regionId: this.provinceField
      });
      principalOwner.jobTitle = this.jobTitleField;
      principalOwner.principleType = this.principleTypeField;

      if ( ! this.editingPrincipalOwner ) {
        var owners = (await this.principalOwnersDAO.select()).array;
        var nameTaken = owners.some((owner) => {
          var ownerFirst = owner.firstName.toLowerCase();
          var ownerLast = owner.lastName.toLowerCase();
          var formFirst = this.firstNameField.toLowerCase();
          var formLast = this.lastNameField.toLowerCase();
          return ownerFirst === formFirst && ownerLast === formLast;
        });
        if ( nameTaken ) {
          this.add(this.NotificationMessage.create({
            message: this.PrincipalOwnerError,
            type: 'error'
          }));
          return;
        }
      }

      // TODO?: Maybe add a loading indicator?

      await this.principalOwnersDAO.put(principalOwner);
      this.editingPrincipalOwner = null;
      this.tableViewElement.selection = null;
      this.clearFields(true);
      this.isSameAsAdmin = false;

      return true;
    }
  }
],

listeners: [
  function onDAOChange() {
    var self = this;
    this.principalOwnersDAO.select().then(function(principalOwners) {
      self.viewData.user.principalOwners = principalOwners.array;
      self.principalOwnersCount = principalOwners.array.length;
    });
  }
]
});
