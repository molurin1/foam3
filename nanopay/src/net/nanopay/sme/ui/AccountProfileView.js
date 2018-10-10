foam.CLASS({
  package: 'net.nanopay.sme.ui',
  name: 'AccountProfileView',
  extends: 'foam.u2.View',

  documentation: 'Account profile view',

  implements: [
    'foam.mlang.Expressions'
  ],

  imports: [
    'menuDAO'
  ],

  requires: [
    'foam.nanos.auth.Group',
    'foam.nanos.menu.Menu',
    'foam.nanos.menu.SubMenuView',
  ],

  css: `
  {
    margin-left: 200px;
    background: white;
  }
  ^ .xyz {
    width: 150px;
    height: 200px;
    background-color: white;
    padding: 5px;
  }
  ^ .account-profile-item {
    margin: 10px 5px;
  }
  ^ .account-profile-items-detail {
    font-size: 10px;
    color: gray;
    margin-top: 5px;
    margin-bottom: 0px;
  }
  ^ .sign-out {
    margin-left: 5px;
  }
  ^ .account-profile-item:hover {
    cursor:pointer;
  }
  `,

  methods: [
    function initE() {
      var dao = this.menuDAO.orderBy(this.Menu.ORDER)
          .where(this.EQ(this.Menu.PARENT, 'accountProfile'));

      this.addClass(this.myClass())
        .start().addClass('xyz')
          .select(dao, function(menu) {
            return this.E().addClass('account-profile-item').call(function() {
              var self = this;
              this.start('a')
                .add(menu.label)
                .start('p').addClass('account-profile-items-detail').add(menu.description).end()
                .on('click', function() {
                  menu.launch_(self.__context__, self);
                })
              .end();
            });
          })
          // .start('a').addClass('sign-out')
          //   .add('Sign out').on('click', () => {
          //     this.tag({ class: 'foam.nanos.auth.SignOutView' });
          //   })
          // .end()
        .end()
      .end();
    }
  ]
});
