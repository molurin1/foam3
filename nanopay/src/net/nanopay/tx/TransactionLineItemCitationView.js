/**
 * @license
 * Copyright 2019 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'net.nanopay.tx',
  name: 'TransactionLineItemCitationView',
  extends: 'foam.u2.CitationView',

  requires: [
    'foam.u2.layout.Cols'
  ],

  methods: [
   function initE() {
      this.addClass(this.myClass());

      this.start(this.Cols)
        .start(this.Cols)
          .add(/* Class */)
          .add(/* Item */)
        .end()
        .add(/* Balance */)
      .end()
    }
  ]
});
