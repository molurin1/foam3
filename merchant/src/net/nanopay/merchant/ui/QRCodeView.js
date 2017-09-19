foam.CLASS({
  package: 'net.nanopay.merchant.ui',
  name: 'QRCodeView',
  extends: 'net.nanopay.merchant.ui.ToolbarView',

  imports: [
    'user',
    'stack',
    'tipEnabled',
    'toolbarIcon',
    'toolbarTitle'
  ],

  axioms: [
    foam.u2.CSS.create({
      code: function CSS() {/*
        ^ {
          width: 320px;
          background-color: #2c4389;
          position: relative;
        }
        ^ .qr-code-wrapper-div {
          background-color: #ffffff;
          width: 180px;
          height: 180px;
          position: absolute;
          left: 70px;
          top: 20px;
        }
        ^ .qr-code-div {
          padding: 10px;
        }
        ^ .amount-div {
          font-size: 25px;
          font-weight: 500;
          text-align: center;
          position: absolute;
          top: 220px;
          width: 320px;
        }
        ^ .instructions-div {
          font-size: 16px;
          line-height: 1.88;
          text-align: center;
          position: absolute;
          top: 279px;
          width: 320px;
        }
      */}
    })
  ],

  properties: [
    ['header', true],
    { class: 'Currency', name: 'amount' }
  ],

  messages: [
    { name: 'instruction1', message: '1. Open MintChip App' },
    { name: 'instruction2', message: '2. Tap Pay Merchant' },
    { name: 'instruction3', message: '3. Scan QR Code' }
  ],

  methods: [
    function initE() {
      this.SUPER();
      var self = this;
      this.toolbarIcon = 'arrow_back';
      this.toolbarTitle = 'Back';

      this
        .addClass(this.myClass())
        .start('div')
          .addClass('qr-code-wrapper-div')
          .start('div').addClass('qr-code-div').end()
        .end()
        .start('span')
        .start('div').addClass('amount-div')
          .add('$' + ( this.amount / 100 ).toFixed(2))
        .end()
        .start('div').addClass('instructions-div')
          .add(this.instruction1).br()
          .add(this.instruction2).br()
          .add(this.instruction3).br()
        .end()

      this.onload.sub(function () {
        var qrCode = new QRCode(document.getElementsByClassName('qr-code-div')[0], {
          text: JSON.stringify({
            userId: self.user.id,
            amount: self.amount,
            tip: self.tipEnabled
          }),
          width: 160,
          height: 160
        });
      });
    }
  ]
})