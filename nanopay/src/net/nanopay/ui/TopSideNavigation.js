foam.CLASS({
  package: 'net.nanopay.ui',
  name: 'TopSideNavigation',
  extends: 'foam.u2.Controller',

  documentation: `
    Top and side navigation menu bars. Side navigation bar displays menu items
    available to user and a menu search which navigates to menu after selection.
    Top navigation bar displays application and user related information along
    with personal settings menus.
  `,

  implements: [
    'foam.mlang.Expressions'
  ],

  requires: [
    'foam.nanos.menu.Menu'
  ],

  imports: [
    'currentMenu',
    'menuListener',
    'loginSuccess',
    'menuDAO',
    'pushMenu',
  ],

  css: `
    ^ .side-nav-view {
      display: inline-block;
      position: fixed;
      height: 100vh;
      width: 240px;
      padding-top: 60px;
      overflow-y: scroll;
      overflow-x: hidden;
      z-index: 100;
      font-size: 26px;
      color: /*%GREY2%*/ #9ba1a6;
      border-right: 1px solid /*%GREY4%*/ #e7eaec;
      background: /*%GREY5%*/ #f5f7fas;
    }
    ^ .selected-sub {
      color: /*%BLACK%*/ #1e1f21;
      font-weight: 800;
    }
    ^ .submenu {
      max-height: 204px;
      overflow-y: scroll;
      overflow-x: hidden;
      font-size: 14px;
      border-bottom: 1px solid /*%GREY4%*/ #e7eaec;
    }
    ^ .icon {
      width: 16px;
      height: 16px;
      padding-right: 10px;
      vertical-align: top;
    }
    ^ .up-arrow {
      margin-bottom: 6px;
      border: 1px solid /*%PRIMARY3%*/ #406dea;
      display: inline-block;
      padding: 3px;
      float: right;
      position: relative;
      right: 40px;
      top: 7px;
      transform: rotate(45deg);
      border-width: 1px 0px 0px 1px;
      -webkit-transform: rotate(45deg);
    }
    ^ .menu-label {
      width: calc(100% - 24px);
      padding-top: 15px;
      padding-left: 20px;
      height: 30px;
      font-size: 14px;
      vertical-align: top;
      display: inline-block;
      border-left: 4px solid /*%GREY5%*/ #f5f7fa;
    }
    ^ .menu-label span {
      display: inline-block;
    }
    ^ .selected-root {
      width: 100%;
      border-left: 4px solid /*%PRIMARY3%*/ #406dea !important;
      background: /*%PRIMARY5%*/ #e5f1fc;
      color: /*%BLACK%*/ black;
    }
    ^ .menu-label:hover {
      color: /*%BLACK%*/ black;
      cursor: pointer;
    }
    ^ .menu-label:not(.selected-root):hover {
      border-left: 4px solid transparent;
      background: /*%GREY4%*/ #e7eaec;
    }
    ^submenu-item {
      display: flex;
      padding: 12px 12px 12px 51px;
    }
    ^submenu-item:hover {
      cursor: pointer;
    }
    ^ .foam-u2-view-RichChoiceView {
      width: calc(240px - 16px - 16px);
      margin: 16px;
    }
    ^submenu-item ^selected-dot {
      border-radius: 999px;
      min-width: 8px;
      height: 8px;
      background-color: transparent;
      display: inline-block;
      margin-right: 8px;
      margin-top: 4px;
    }
    ^ .selected-sub ^selected-dot {
      background-color: /*%PRIMARY3%*/ #406dea;
    }
  `,

  properties: [
    {
      name: 'menuName',
      value: '' // The root menu
    },
    {
      class: 'FObjectProperty',
      of: 'foam.u2.Element',
      name: 'subMenu',
      documentation: 'Used to store selected submenu element after window reload and scroll into parent view'
    },
    {
      class: 'foam.dao.DAOProperty',
      name: 'dao_',
      factory: function() {
        return this.menuDAO.orderBy(this.Menu.ORDER);
      }
    },
    {
      name: 'menuSearch',
      view: function(_, X) {
        return {
          class: 'foam.u2.view.RichChoiceView',
          sections: [
            {
              heading: '',
              dao: X.menuDAO
            },
          ],
          search: true,
          searchPlaceholder: 'Search...',
          selectionView: { class: 'net.nanopay.ui.MenuChoiceSelection' },
          rowView: { class: 'net.nanopay.ui.MenuRowView' }
        };
      },
      factory: function() {
        return this.currentMenu;
      }
    }
  ],

  methods: [
      function initE() {
        var self = this;
        // Sets currentMenu and listeners on search selections and subMenu scroll on load.
        if ( window.location.hash != null ) this.menuListener(window.location.hash.replace('#', ''));

        this.start()
          .addClass(this.myClass())
          .show(this.loginSuccess$)
          .start().addClass('side-nav-view')
            .tag(this.MENU_SEARCH)
            .select(this.dao_.where(this.EQ(this.Menu.PARENT, this.menuName)), function(menu) {
              var slot = foam.core.SimpleSlot.create({ value: false });
              var hasChildren = foam.core.SimpleSlot.create({ value: false });
              var visibilitySlot = foam.core.ArraySlot.create({ slots: [slot, hasChildren] }).map((results) => results.every(x => x));
              return this.E()
                .start()
                  .attrs({ name: menu.label })
                  .on('click', function() {
                    if ( self.currentMenu != null && self.currentMenu.parent == menu.id ) {
                      return;
                    }
                    if ( ! hasChildren.get() ) {
                      self.menuListener(menu.id);
                      self.pushMenu(menu.id);
                    }
                    self.menuSearch = menu.id;
                  })
                  .addClass('sidenav-item-wrapper')
                  .start()
                    .addClass('menu-label')
                    .enableClass('selected-root', slot)
                    .enableClass('selected-root', self.currentMenu$.map((currentMenu) => {
                      var selectedRoot = window.location.hash.replace('#', '') == menu.id ||
                        currentMenu != null &&
                        currentMenu.id == menu.id ||
                        currentMenu.parent == menu.id;
                      slot.set(selectedRoot);
                      return selectedRoot;
                    }))

                    // If the menu doesn't have an icon then we use an empty
                    // span instead. We do this to avoid a broken image icon
                    // being inserted by the browser in place of the menu icon.
                    .add(menu.icon$.map(iconURL => {
                      return iconURL
                        ? this.E('span')
                            .start('img')
                              .addClass('icon')
                              .attr('src', iconURL)
                            .end()
                        : this.E('span').start('span').addClass('icon').end();
                    }))

                    .start('span')
                      .add(menu.label)
                    .end()
                    .start().enableClass('up-arrow', visibilitySlot).end()
                  .end()

                  .start()
                    .addClass('submenu')
                    .show(visibilitySlot)
                    .select(self.dao_.where(self.EQ(self.Menu.PARENT, menu.id)), function(subMenu) {
                      hasChildren.set(true);
                      var e = this.E()
                        .addClass(self.myClass('submenu-item'))
                        .start().addClass(self.myClass('selected-dot')).end()
                        .attrs({ name: subMenu.id })
                        .on('click', function() {
                          if ( self.currentMenu != null && self.currentMenu.id != subMenu.id ) {
                            self.pushMenu(subMenu.id);
                            self.menuSearch = menu.id;
                          }
                        })
                        .start('span').add(subMenu.label).end()
                        .enableClass('selected-sub', self.currentMenu$.map((currentMenu) => {
                          return currentMenu != null && currentMenu.id === subMenu.id;
                        }));

                      if ( self.currentMenu == subMenu ) self.subMenu = e;

                      return e;
                    })
                  .end()
                .end();
            })
          .end()
        .end()
        .tag({ class: 'net.nanopay.ui.TopNavigation' });

        this.menuSearch$.sub(this.menuSearchSelect);
        this.subMenu$.dot('state').sub(this.scrollToCurrentSub);
      }
  ],

  listeners: [
    async function menuSearchSelect() {
      var menu = await this.menuDAO.find(this.menuSearch);
      this.pushMenu(this.menuSearch);
      this.menuListener(menu);
      // Scroll to submenu selected from search.
      if ( document.getElementsByName(this.menuSearch)[0] ) {
        document.getElementsByName(this.menuSearch)[0].scrollIntoView({ block: 'end' });
      }
    },
    function scrollToCurrentSub() {
      // When submenu element is loaded, scroll element into parent view TODO: Fix to align to middle of parent div.
      if ( this.subMenu.state === this.subMenu.LOADED ) {
        if ( this.subMenu.el() ) {
          this.subMenu.el().scrollIntoView({ block: 'end' });
        }
      }
    }
  ]
});
