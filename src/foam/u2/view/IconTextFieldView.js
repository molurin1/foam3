/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.u2.view',
  name: 'IconTextFieldView',
  extends: 'foam.u2.View',

  requires: [
    'foam.u2.TextField'
  ],

  css: `
    ^ {
      position: relative;
    }
    ^icon {
      height: 14px;
      width: 14px;
      position: absolute;
      margin-left: 10px;
      margin-top: 14px;
    }
    ^input {
      padding-left: 32px !important;
    }
  `,

  properties: [
    {
      class: 'String',
      name: 'icon'
    },
    {
      class: 'String',
      name: 'type'
    },
    {
      class: 'String',
      name: 'placeHolder'
    }
  ],

  methods: [
    function initE() {
      this.SUPER();
  
      this.start()
        .addClass(this.myClass())
        .start({
          class: 'foam.u2.tag.Image',
          data: this.icon
        })
          .addClass(this.myClass('icon'))
        .end()
        .start(this.TextField, {
          type: this.type,
          data$: this.data$,
          placeholder: this.placeHolder
        })
          .addClass(this.myClass('input'))
        .end()
      .end();
    }
  ]
})