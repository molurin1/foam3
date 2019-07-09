foam.CLASS({
  package: 'net.nanopay.sme.ui',
  name: 'PersonalSettingsView',
  extends: 'foam.u2.Controller',

  documentation: 'Personal settings page for Ablii',

  imports: [
    'agent',
    'auth',
    'ctrl',
    'twofactor',
    'user'
  ],

  requires: [
    'foam.u2.dialog.Popup',
    'net.nanopay.ui.NewPasswordView'
  ],

  css: `
    ^ {
      margin: auto;
      max-width: 1100px;
    }
    ^password-wrapper {
      vertical-align: top;
      width: 300px;
      display: inline-block;
      margin-right: 50px;
    }
    ^change-password-card {
      padding: 24px;
      min-width: 350px;
    }
    ^change-password-card input {
      width: 100%;
    }
    ^two-factor-card {
      padding: 24px;
      min-width: 350px;
    }
    ^two-factor-instr {
      margin: 0 auto;
    }
    ^two-factor-instr-left {
      display: inline-block;
      width: 380px;
      margin-bottom: 15px;
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
      color: #604aff;
      display: inline-block;
      margin-top: 8px;
      text-decoration: none;
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
      display: inline-block;
      vertical-align: top;
    }
    @media only screen and (max-width: 767px) {
      ^ .validation-input {
        margin-top: 15px;
      }
      ^two-factor-enable {
        margin-top: 15px;
      }

    }
    @media only screen and (min-width: 1133px) {
      ^two-factor-instr-right {
        margin-left: 20px;
      }
  `,

  constants: [
    {
      type: 'String',
      name: 'IOS_LINK',
      value: 'https://itunes.apple.com/ca/app/google-authenticator/id388497605?mt=8'
    },
    {
      type: 'String',
      name: 'ANDROID_LINK',
      value: 'https://play.google.com/store/apps/details?id=com.google.android.apps.authenticator2&hl=en'
    },
  ],

  properties: [
    {
      class: 'Int',
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
      documentation: 'Two-factor authentication QR code string'
    },
    {
      class: 'String',
      name: 'twoFactorToken',
      documentation: 'Two-factor token generated by authenticator app',
    }
  ],

  messages: [
    { name: 'TITLE', message: 'Personal Settings' },
    { name: 'CHANGE_PASSWORD_SUBTITLE', message: 'Change Password' },
    { name: 'PASSWORD_STRENGTH_ERROR', message: 'Password is not strong enough.' },
    { name: 'emptyOriginal', message: 'Please enter your original password' },
    { name: 'emptyPassword', message: 'Please enter your new password' },
    { name: 'emptyConfirmation', message: 'Please re-enter your new password' },
    { name: 'passwordMismatch', message: 'Passwords do not match' },
    { name: 'passwordSuccess', message: 'Password successfully updated' },
    { name: 'TWO_FACTOR_SUBTITLE', message: 'Two-factor Authentication' },
    { name: 'TwoFactorInstr1', message: 'Download and use your Google Authenticator ' },
    { name: 'TwoFactorInstr2', message: ' app on your mobile device to scan the QR code. If you can’t use the QR code, you can enter the provided key into Google Authenticator app manually.' },
    { name: 'IOSName', message: 'iOS' },
    { name: 'AndroidName', message: 'Android' },
    { name: 'StepOne', message: 'Step 1' },
    { name: 'StepTwo', message: 'Step 2' }
  ],

  methods: [
    function initE() {
      this
      .addClass(this.myClass())
      .start('h1').add(this.TITLE).end()

      .start().addClass('card').addClass(this.myClass('change-password-card'))
        .start()
          .addClass('sub-heading')
          .add(this.CHANGE_PASSWORD_SUBTITLE)
        .end()
        .start().addClass(this.myClass('change-password-content'))
          .start().addClass('input-wrapper')
            .addClass(this.myClass('password-wrapper'))
            .start().add('Original Password').addClass('input-label').end()
            .start(this.ORIGINAL_PASSWORD).end()
          .end()
          .start().addClass('input-wrapper')
            .addClass(this.myClass('password-wrapper'))
            .start().add('New Password').addClass('input-label').end()
            .start(this.NEW_PASSWORD, {
              passwordStrength$: this.passwordStrength$
            })
            .end()
          .end()
          .start().addClass('input-wrapper')
            .addClass(this.myClass('password-wrapper'))
            .start().add('Confirm Password').addClass('input-label').end()
            .start(this.CONFIRM_PASSWORD).end()
          .end()
        .end()
        .start(this.UPDATE_PASSWORD)
          .addClass('input-wrapper')
          .addClass('sme').addClass('button').addClass('primary')
        .end()
      .end()

      .br()

      .start().addClass('card').addClass(this.myClass('two-factor-card'))
        .start()
          .addClass('sub-heading')
          .add(this.TWO_FACTOR_SUBTITLE)
        .end()
        .add(this.slot(function(twoFactorEnabled) {
          if ( ! twoFactorEnabled ) {
            // two factor disabled

            return this.E()
              .start().addClass(this.myClass('two-factor-instr'))
                .start().addClass(this.myClass('two-factor-instr-left'))
                  .start().addClass(this.myClass('step-1'))
                    .br()
                    .start('span')
                      .add(this.TwoFactorInstr1)
                      .start('a').addClass(this.myClass('two-factor-link'))
                        .add(this.IOSName)
                        .attrs({ href: this.IOS_LINK, target: '_blank' })
                      .end()
                      .add(' or ')
                      .start('a').addClass(this.myClass('two-factor-link'))
                        .add(this.AndroidName)
                        .attrs({ href: this.ANDROID_LINK, target: '_blank' })
                      .end()
                      .add(this.TwoFactorInstr2)
                    .end()
                  .end()
                .end()
                .start({
                  class: 'net.nanopay.sme.ui.TwoFactorAuthView',
                  hideDisableButton: false
                })
                  .addClass(this.myClass('two-factor-instr-right'))
                .end()
              .end();
          } else {
            // two factor enabled
            return this.E()
              .start({
                class: 'net.nanopay.sme.ui.TwoFactorAuthView',
                hideDisableButton: false
              })
              .end();
          }
        }, this.agent.twoFactorEnabled$))
      .end();
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
          this.ctrl.notify(this.emptyOriginal, 'error');
          return;
        }

        // validate new password
        if ( ! this.newPassword ) {
          this.ctrl.notify(this.emptyPassword, 'error');
          return;
        }

        if ( this.passwordStrength < 3 ) {
          this.ctrl.notify(this.PASSWORD_STRENGTH_ERROR, 'error');
          return false;
        }

        // check if confirmation entered
        if ( ! this.confirmPassword ) {
          this.ctrl.notify(this.emptyConfirmation, 'error');
          return;
        }

        // check if passwords match
        if ( ! this.confirmPassword.trim() || this.confirmPassword !== this.newPassword ) {
          this.ctrl.notify(this.passwordMismatch, 'error');
          return;
        }

        // update password
        this.auth.updatePassword(null, this.originalPassword, this.newPassword)
          .then(function(result) {
            // copy new user, clear password fields, show success
            self.user.copyFrom(result);
            self.originalPassword = null;
            self.newPassword = null;
            self.confirmPassword = null;
            self.ctrl.notify(self.passwordSuccess);
          })
          .catch(function(err) {
            self.ctrl.notify(err.message, 'error');
          });
      }
    }
  ]
});
