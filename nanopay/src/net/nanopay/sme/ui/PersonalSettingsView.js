foam.CLASS({
  package: 'net.nanopay.sme.ui',
  name: 'PersonalSettingsView',
  extends: 'foam.u2.Controller',

  documentation: 'Personal settings page for sme',

  imports: [
    'agent',
    'auth',
    'user',
    'stack',
    'userDAO',
    'twofactor',
    'validatePassword',

  ],

  requires: [
    'foam.u2.dialog.NotificationMessage',
    'net.nanopay.ui.ExpandContainer',
    'net.nanopay.ui.NewPasswordView'
  ],

  css: `
    ^ {
      margin: 50px;
    }
    ^password-wrapper {
      vertical-align: top;
      width: 300px;
      display: inline-block;
      margin-right: 50px;
    }
    ^change-password-card {
      padding: 24px;
    }
    ^change-password-content {
      margin-bottom: 15px;
    }
    ^ .input-field {
      background: white;
    }
    ^two-factor-card {
      padding: 24px;
    }
    ^two-factor-content {
      height: 200px;
      margin-bottom: 15px;
    }
    ^two-factor-instr {
      margin: 0 auto;
    }
    ^two-factor-instr-left {
      width: 25%;
      float: left;
    }
    ^step-1 span {
      font-family: Lato;
      font-size: 14px;
      font-weight: normal;
      font-style: normal;
      font-stretch: normal;
      line-height: 1.5;
      letter-spacing: normal;
      color: #8e9090;
    }
    ^two-factor-link {
      margin-top: 8px;
      display: inline-block;
      text-decoration: none;
      color: #604aff;
    }
    ^step-2 {
      margin-top: 32px;
    }
    ^step-2 span {
      font-family: Lato;
      font-size: 14px;
      font-weight: normal;
      font-style: normal;
      font-stretch: normal;
      line-height: 1.5;
      letter-spacing: normal;
      color: #8e9090;
    }
    ^two-factor-instr-right {
      width: 60%;
      float: right;
    }
    ^two-factor-qr-code {
      float: left;
      width: 141px;
      height: 141px;
      padding-right: 32px;
    }
    ^two-factor-enable {
      float: right;
      width: 80%;
      padding-top: 8px;
    }
    ^two-factor-disable {
    }
    ^status {
      font-size: 14px;
      line-height: 1.5;
      color: #2b2b2b;
    }
    ^two-factor-enabled {
      font-size: 11px;
      line-height: 1.36;
      color: #03cf1f;
      padding-bottom: 27px;
    }
    ^two-factor-disabled {
      font-size: 11px;
      line-height: 1.36;
      color: #f91c1c;
      padding-bottom: 27px;
    }
    ^enter-validation-code {
      font-size: 12px;
      color: #2b2b2b;
      padding-bottom: 8px;
    }
    ^validation-code-form {
      width: 500px;
    }
    ^ .property-twoFactorToken {
      width: 219px;
    }
    ^ .net-nanopay-ui-ActionView-enableTwoFactor {
      width: 96px;
      margin-left: 8px;
    }
    ^ .net-nanopay-ui-ActionView-disableTwoFactor {
      width: 96px;
      color: #f91c1c;
      background-color: transparent;
      border: 1px solid #f91c1c;
      margin-left: 8px;
    }
  `,

  properties: [
    {
      name: 'passwordStrength',
      value: 0
    },
    {
      class: 'String',
      name: 'originalPassword',
      view: { class: 'foam.u2.view.PasswordView' }
    },
    {
      class: 'String',
      name: 'newPassword',
      view: { class: 'net.nanopay.ui.NewPasswordView' }
    },
    {
      class: 'String',
      name: 'confirmPassword',
      view: { class: 'foam.u2.view.PasswordView' }
    },
    {
      class: 'String',
      name: 'twoFactorQrCode',
      documentation: 'Two-Factor authentication QR code string'
    },
    {
      class: 'String',
      name: 'twoFactorToken',
      documentation: 'Two-Factor token generated by authenticator app',
    }
  ],

  messages: [
    { name: 'TITLE', message: 'Personal Settings' },
    { name: 'noSpaces', message: 'Password cannot contain spaces' },
    { name: 'noNumbers', message: 'Password must have one numeric character' },
    { name: 'noSpecial', message: 'Password must not contain: !@#$%^&*()_+' },
    { name: 'emptyOriginal', message: 'Please enter your original password' },
    { name: 'emptyPassword', message: 'Please enter your new password' },
    { name: 'emptyConfirmation', message: 'Please re-enter your new password' },
    { name: 'invalidLength', message: 'Password must be 7-32 characters long' },
    { name: 'passwordMismatch', message: 'Passwords do not match' },
    { name: 'passwordSuccess', message: 'Password successfully updated' },
    { name: 'TwoFactorInstr1', message: 'Download the authenticator app on your mobile device' },
    { name: 'TwoFactorInstr2', message: 'Open the authenticator app on your mobile device and scan the QR code to retrieve your validation code then enter it in into the field on the right.' },
    { name: 'EnableTwoFactor', message: 'Enter validation code' },
    { name: 'DisableTwoFactor', message: 'Enter validation code' },
    { name: 'IOSLink', message: 'https://itunes.apple.com/ca/app/google-authenticator/id388497605?mt=8' },
    { name: 'AndroidLink', message: 'https://play.google.com/store/apps/details?id=com.google.android.apps.authenticator2&hl=en' },
    { name: 'IOSName', message: 'iOS authenticator download'},
    { name: 'AndroidName', message: 'Android authenticator download'},
    { name: 'TwoFactorNoTokenError', message: 'Please enter a verification token.' },
    { name: 'TwoFactorEnableSuccess', message: 'Two-factor authentication enabled.' },
    { name: 'TwoFactorEnableError', message: 'Could not enable two-factor authentication. Please try again.' },
    { name: 'TwoFactorDisableSuccess', message: 'Two-factor authentication disabled.' },
    { name: 'TwoFactorDisableError', message: 'Could not disable two-factor authentication. Please try again.' },
    { name: 'StepOne', message: 'Step 1' },
    { name: 'StepTwo', message: 'Step 2' },
    { name: 'EnterCode', message: 'Enter code' },
    { name: 'Status', message: 'Status' },
    { name: 'Enabled', message: '• Enabled' },
    { name: 'Disabled', message: '• Disabled' },
    { name: 'PASSWORD_STRENGTH_ERROR', message: 'Password is too weak.' },
  ],

  methods: [
    function initE() {
      this
      .addClass(this.myClass())
      .start('h1').add(this.TITLE).end()

      .start().addClass('card').addClass(this.myClass('change-password-card'))
        .start().addClass('sub-heading').add('Change Password').end()
        .start().addClass(this.myClass('change-password-content'))
          .start().addClass('input-wrapper')
            .addClass(this.myClass('password-wrapper'))
            .start().add('Original Password').addClass('input-label').end()
            .start(this.ORIGINAL_PASSWORD).end()
          .end()
          .start().addClass('input-wrapper')
            .addClass(this.myClass('password-wrapper'))
            .start().add('New Password').addClass('input-label').end()
            .start(this.NEW_PASSWORD, { passwordStrength$: this.passwordStrength$ }).end()
          .end()
          .start().addClass('input-wrapper')
            .addClass(this.myClass('password-wrapper'))
            .start().add('Confirm Password').addClass('input-label').end()
            .start(this.CONFIRM_PASSWORD).end()
          .end()
        .end()
        .start(this.UPDATE_PASSWORD)
          .addClass('sme').addClass('button').addClass('primary')
        .end()
      .end()

      .br()

      .start().addClass('card').addClass(this.myClass('two-factor-card'))
        .start().addClass('sub-heading').add('Two-Factor Authentication').end()
        .start().addClass(this.myClass('two-factor-content'))
          .start()
            .add(this.slot(function (twoFactorEnabled) {
              if ( ! twoFactorEnabled ) {
                // two factor not enabled
                var self = this;
                this.twofactor.generateKey(null, true)
                .then(function (qrCode) {
                  self.twoFactorQrCode = qrCode;
                });

                return this.E()
                  .br()
                  .start().addClass(this.myClass('two-factor-instr'))
                    .start().addClass(this.myClass('two-factor-instr-left'))
                      .start().addClass(this.myClass('step-1'))
                        .start('b').add(this.StepOne).end()
                        .br()
                        .start('span').add(this.TwoFactorInstr1).end()
                        .br()
                        .start('a').addClass(this.myClass('two-factor-link'))
                          .attrs({ href: this.IOSLink }).add(this.IOSName)
                        .end()
                        .br()
                        .start('a').addClass(this.myClass('two-factor-link'))
                          .attrs({ href: this.AndroidLink }).add(this.AndroidName)
                        .end()
                      .end()
                      .start().addClass(this.myClass('step-2'))
                        .start('b').add(this.StepTwo).end()
                        .br()
                        .start('span').add(this.TwoFactorInstr2).end()
                      .end()
                    .end()

                    .start().addClass(this.myClass('two-factor-instr-right'))
                      .start().addClass(this.myClass('two-factor-qr-code'))
                        .start('img').attrs({ src: this.twoFactorQrCode$ }).end()
                      .end()

                      .start().addClass(this.myClass('two-factor-enable'))
                        .start('b').addClass(this.myClass('status'))
                          .add(this.Status)
                        .end()
                        .start().addClass(this.myClass('two-factor-disabled'))
                          .add(this.Disabled)
                        .end()

                        .start('b').addClass(this.myClass('enter-validation-code'))
                          .add(this.EnableTwoFactor)
                        .end()
                        .start().addClass(this.myClass('validation-code-form'))
                          .start(this.TWO_FACTOR_TOKEN)
                            .attrs({ placeholder: this.EnterCode })
                          .end()
                          .start(this.ENABLE_TWO_FACTOR)
                            .addClass('sme').addClass('button').addClass('primary')
                          .end()
                        .end()
                      .end()
                    .end()
                  .end()
              } else {
                // two factor enabled
                return this.E()
                  .br()
                  .start().addClass(this.myClass('two-factor-disable'))
                    .start('b').addClass(this.myClass('status'))
                      .add(this.Status)
                    .end()
                    .start().addClass(this.myClass('two-factor-enabled'))
                      .add(this.Enabled)
                    .end()

                    .start('b')
                      .add(this.EnableTwoFactor)
                    .end()
                    .start().addClass(this.myClass('validation-code-form'))
                      .start(this.TWO_FACTOR_TOKEN)
                        .attrs({ placeholder: this.EnterCode })
                      .end()
                      .start(this.DISABLE_TWO_FACTOR).end()
                    .end()
                  .end()
              }
            }, this.agent.twoFactorEnabled$))
          .end()
        .end()
      .end()
    }
  ],

  actions: [
    {
      name: 'updatePassword',
      label: 'Update',
      code: function(X) {
        var self = this;

        // check if original password entered
        if ( ! this.originalPassword ) {
          this.add(this.NotificationMessage.create({ message: this.emptyOriginal, type: 'error' }));
          return;
        }

        // validate new password
        if ( ! this.newPassword ) {
          this.add(this.NotificationMessage.create({ message: this.emptyPassword, type: 'error' }));
          return;
        }

        if ( this.passwordStrength < 3 ) {
          this.add(this.NotificationMessage.create({ message: this.PASSWORD_STRENGTH_ERROR, type: 'error' }));
          return false;
        }

        // check if confirmation entered
        if ( ! this.confirmPassword ) {
          this.add(this.NotificationMessage.create({ message: this.emptyConfirmation, type: 'error' }));
          return;
        }

        // check if passwords match
        if ( ! this.confirmPassword.trim() || this.confirmPassword !== this.newPassword ) {
          this.add(this.NotificationMessage.create({ message: this.passwordMismatch, type: 'error' }));
          return;
        }

        // update password
        this.auth.updatePassword(null, this.originalPassword, this.newPassword).then(function(result) {
          // copy new user, clear password fields, show success
          self.user.copyFrom(result);
          self.originalPassword = null;
          self.newPassword = null;
          self.confirmPassword = null;
          self.add(self.NotificationMessage.create({ message: self.passwordSuccess }));
        })
        .catch(function(err) {
          self.add(self.NotificationMessage.create({ message: err.message, type: 'error' }));
        });
      }
    },
    {
      name: 'enableTwoFactor',
      label: 'Enable',
      code: function (X) {
        var self = this;

        if ( ! this.twoFactorToken ) {
          this.add(this.NotificationMessage.create({ message: this.TwoFactorNoTokenError, type: 'error' }));
          return;
        }

        this.twofactor.verifyToken(null, this.twoFactorToken)
        .then(function (result) {
          if ( ! result ) {
            self.add(self.NotificationMessage.create({ message: self.TwoFactorEnableError, type: 'error' }));
            return;
          }

          self.twoFactorToken = null;
          self.agent.twoFactorEnabled = true;
          self.add(self.NotificationMessage.create({ message: self.TwoFactorEnableSuccess }));
        })
        .catch(function (err) {
          self.add(self.NotificationMessage.create({ message: self.TwoFactorEnableError, type: 'error' }));
        });
      }
    },
    {
      name: 'disableTwoFactor',
      label: 'Disable',
      code: function (X) {
        var self = this;

        if ( ! this.twoFactorToken ) {
          this.add(this.NotificationMessage.create({ message: this.TwoFactorNoTokenError, type: 'error' }));
          return;
        }

        this.twofactor.disable(null, this.twoFactorToken)
        .then(function (result) {
          if ( ! result ) {
            self.add(self.NotificationMessage.create({ message: self.TwoFactorDisableError, type: 'error' }));
            return;
          }

          self.twoFactorToken = null;
          self.agent.twoFactorEnabled = false;
          self.add(self.NotificationMessage.create({ message: self.TwoFactorDisableSuccess }));
        })
        .catch(function (err) {
          self.add(self.NotificationMessage.create({ message: self.TwoFactorDisableError, type: 'error' }));
        });
      }
    }
  ]
});
