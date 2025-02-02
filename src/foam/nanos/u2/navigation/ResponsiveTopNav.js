/**
 * @license
 * Copyright 2021 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.u2.navigation',
  name: 'ResponsiveTopNav',
  extends: 'foam.u2.View',

  documentation: 'FOAM Responsive Top Nav',

  imports: [
    'displayWidth',
    'isMenuOpen',
    'loginSuccess',
    'menuDAO',
    'pushMenu?',
    'theme'
  ],

  css: `
    ^ {
      align-items: center;
      background-color: /*%WHITE%*/ #FFFFFF;
      border-bottom: 2px solid rgba(0, 0, 0, 0.06);
      display: flex;
      min-height: 64px;
      justify-content: space-between;
      padding: 8px 16px;
      position: relative;
      width: 100%;
    }
    ^components-container {
      align-items: center;
      display: flex;
      flex: 1;
    }
    ^components-container > * + * {
      margin-left: 8px;
    }
    ^menuControl{
      position: absolute;
    }
    ^logo {
      flex: 1;
      justify-content: center;
    }

    @media (min-width: /*%DISPLAYWIDTH.LG%*/ 960px) {
      ^components-container {
        flex: unset;
      }
      ^menuControl{
        position: relative;
      }
      ^logo {
        flex: unset;
        justify-content: flex-start;
      }
    }
  `,

  properties: [
    {
      class: 'Boolean',
      name: 'hasNotifictionMenuPermission'
    },
    {
      name: 'nodeName',
      value: 'header'
    }
  ],

  methods: [
    function checkNotificationAccess() {
      this.menuDAO.find('notifications').then(bb=>{
        this.hasNotifictionMenuPermission = bb;
      });
    },
    function render() {
      var self = this;
      this.checkNotificationAccess();
      this
        .show(this.loginSuccess$)
        .addClass(this.myClass())
        .start().addClass(this.myClass('components-container'))
          // Menu Open/Close
          .startContext({ data: this })
            .start(this.MENU_CONTROL, { themeIcon: 'hamburger', buttonStyle: 'TERTIARY', size: 'SMALL' })
              .addClass(this.myClass('menuControl'))
            .end()
          .endContext()
          .start({ class: 'foam.nanos.u2.navigation.ApplicationLogoView' })
            .addClass(this.myClass('logo'))
            .on('click', () => {
              this.pushMenu(this.theme.logoRedirect, true);
            })
          .end()
        .end()
        // TODO: Make Responsive
        .add(this.slot(function(displayWidth) {
          if ( displayWidth.ordinal >= foam.u2.layout.DisplayWidth.LG.ordinal ) {
            return this.E().addClass(this.myClass('components-container'))
            .start({ class: 'foam.nanos.u2.navigation.NotificationMenuItem' })
              .show(self.hasNotifictionMenuPermission$)
            .end()
            .tag({ class: 'foam.nanos.auth.LanguageChoiceView' })
            .tag({ class: 'foam.nanos.u2.navigation.UserInfoNavigationView' });
          } else {
            return this.E();
          }
        }));
    }
  ],

  actions: [
    {
      name: 'menuControl',
      label: '',
      ariaLabel: 'Open/Close Menu',
      code: function() {
        this.isMenuOpen = ! this.isMenuOpen;
      }
    }
  ]
});
