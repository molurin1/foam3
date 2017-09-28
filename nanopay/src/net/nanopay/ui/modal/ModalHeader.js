
foam.CLASS({
  package: 'net.nanopay.ui.modal',
  name: 'ModalHeader',
  extends: 'foam.u2.View',

  documentation: 'Modal Container close/title',

  imports: [
    'stack',
    'closeDialog'
  ],

  exports: [
    'closeDialog'
  ],

  properties: [
    'title'
  ],

  axioms: [
    foam.u2.CSS.create({
      code: function CSS() {/*
      ^{
        width: 448px;
        margin: auto;
      }
      ^ .container{
        height: 40.8px;
        background-color: #093649;
      }
      ^ .title{
        height: 40px;
        font-family: Roboto;
        font-size: 14px;
        line-height: 2.86;
        text-align: left;
        color: #ffffff;
        margin-left: 19px;
        display: inline-block;
      }
      ^ .close{
        width: 24px;
        height: 24px;
        margin-top: 5px;
        cursor: pointer;
        position: relative;
        top: 4px;
        right: 20px;
        float: right;
      }
      ^ .net-nanopay-ui-ActionView-close{
        position: relative;
        right: -310px;
        width: 50px;
        height: 40px;
        opacity: 0.01;
      }
    */}
    })
  ],
  
  methods: [
    function initE(){
    this.SUPER();
    var self = this;
    
    this
    .addClass(this.myClass())
      .start()
        .start()
          .start().addClass('container')
            .start().addClass('title').add(this.title).end()
            .start({class:'foam.u2.tag.Image', data: 'images/ic-cancelwhite.svg'}).addClass('close')
              .add(this.CLOSE)
            .end()
          .end()
        .end()
      .end()
    } 
  ],
    
  actions: [
    {
      name: 'close',
      code: function(X){
        X.closeDialog()
      }
    }
  ] 
})