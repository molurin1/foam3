/**
* @license
* Copyright 2021 The FOAM Authors. All Rights Reserved.
* http://www.apache.org/licenses/LICENSE-2.0
*/

foam.CLASS({
  package: 'foam.nanos.u2.navigation',
  name: 'NavigationController',
  extends: 'foam.u2.Controller',

  documentation: 'Component to combine Macro layouts',

  css: `
    :root {
      --sidebar-width: 240px;
      --topbar-height: 0px;
      --footer-height: 0px;
    }

    /******************
    Replace sidebar-width when Chrome 
    and Safari add animation support 
    to grid-template-columns
    ---------
    ^ {
      display: grid;
      grid-template: auto 1fr / minmax(240px, 10%) 1fr;
    }
    ********************/

    ^ {
      display: grid;
      height: 100vh;
      grid-template: auto 1fr / auto 1fr;
    }


    ^header {
      grid-column: 1 / 3;
    }

    ^sideNav {
      grid-column: 1 / 2;
      height: calc(100% - var(--topbar-height));
      overflow: auto;
      position: absolute;
      top: var(--topbar-height);
      z-index: 100;
    }

    ^stack-view {
      grid-column: 2 / 3;
      height: 100%;
      overflow: auto;
      transition: 0.2s ease;
    }

    ^sidebar^sideNav{
      transition: 0.2s ease;
      width: var(--sidebar-width);
    }

    ^sidebarClosed^sideNav{
      transition: 0.2s ease;
      width: 0px;
    }


    @media only screen and (min-width: /*%DISPLAYWIDTH.LG%*/ 960px) {
      ^sideNav{
        height: auto;
        position: relative;
        top: 0;
        z-index: 1;
      }
    }
  `,

  imports: [
    'displayWidth',
    'document',
    'initLayout',
    'isMenuOpen',
    'loginSuccess',
    'showNav',
    'stack'
  ],

  requires: [
    'foam.u2.stack.DesktopStackView',
    'foam.u2.layout.DisplayWidth'
  ],

  properties: [
    {
      class: 'foam.u2.ViewSpec',
      name: 'topNav'
    },
    {
      class: 'foam.u2.ViewSpec',
      name: 'sideNav'
    },
    {
      class: 'foam.u2.ViewSpec',
      name: 'footer'
    },
    {
      class: 'foam.u2.ViewSpec',
      name: 'mainView'
    },
    {
      name: 'headerSlot_'
    }
  ],
  methods: [
    function render() {
      var self  = this;
      // TODO: Add responsive View switching
      this.onDetach(this.headerSlot_$.sub(this.adjustTopBarHeight));
      this.onDetach(this.displayWidth$.sub(this.maybeCloseNav));
      this.maybeCloseNav();

      this.addClass()
      .add(this.slot( async function(loginSuccess, topNav) {
        if ( ! loginSuccess || ! topNav ) return null;
        await this.initLayout;
        return this.E()
          .addClass(this.myClass('header'))
          .tag(topNav, {}, self.headerSlot_$)
          .show(this.showNav$);
      }))
        .add(this.slot( async function(loginSuccess, sideNav) {
          if ( ! loginSuccess || ! sideNav ) return null;
          await this.initLayout;
          return this.E()
            .tag(sideNav)
            .show(this.showNav$)
            .enableClass(this.myClass('sidebarClosed'), this.isMenuOpen$, true)
            .enableClass(this.myClass('sidebar'), this.isMenuOpen$)
            .addClass(this.myClass('sideNav'));
        }))
        .start(this.mainView)
          .addClass(this.myClass('stack-view'))
        .end();
      // TODO: Maybe add footer support if needed
    }
  ],

  listeners: [
    function maybeCloseNav() {
      if ( this.displayWidth.ordinal < this.DisplayWidth.LG.ordinal ) {
        this.isMenuOpen = false;
      }
    },
    function adjustTopBarHeight() {
      if ( ! this.headerSlot_ ) return;
      let root = this.document.documentElement;
      this.headerSlot_.el().then(el => { 
        root?.style.setProperty('--topbar-height', el.offsetHeight + 'px' ); 
      })
    }
  ]
});
