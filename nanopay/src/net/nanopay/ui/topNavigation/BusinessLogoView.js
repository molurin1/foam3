foam.CLASS({
  package: 'net.nanopay.ui.topNavigation',
  name: 'BusinessLogoView',
  extends: 'foam.u2.View',

  documentation: 'View to display business logo and name.',

  imports: [
    'logo',
    'user'
  ],

  axioms: [
    foam.u2.CSS.create({
      code: function CSS() {/*
        ^{
          width: 175px;
          display: inline-block;
          text-align: center;
          padding-top: 3px;
          padding-left: 25px;
        }
        ^ img {
          width: 205px;
          height: auto;
          padding-top: 10px;
        }
        ^ span{
          position: relative;
          font-weight: 300;
          font-size: 16px;
          margin-left: 10px;
        }
        ^business-name{
          width: 70%;
          text-align: left;
          overflow: hidden;
          text-overflow: ellipsis;
          position: relative;
          white-space: nowrap;
          top: -35;
          height: 20px;
          display: inline-block;
          vertical-align: middle;
          margin-top: 32px;
          margin-left: 5px;
        }
        ^placeholder-business{
          width: 40px;
          height: 40px;
          margin: 5px;
          border-radius: 50%;
          background: white;
        }
      */}
    })
  ],

  methods: [
    function initE() {
      this.SUPER();

      this.user.group$.sub(this.onGroupChange);
      
      this
        .addClass(this.myClass())
        .start()
          .start({ class: 'foam.u2.tag.Image', data: this.logo$ }).end()
        .end();
    }
  ],

  listeners: [
    function onGroupChange() {
      if ( this.user.group == 'ccShopper' ) {
        this.logo = 'images/connected-shopper.svg';
      }
    }
  ]
});