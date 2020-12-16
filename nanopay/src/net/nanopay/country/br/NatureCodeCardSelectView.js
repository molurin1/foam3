/**
 * NANOPAY CONFIDENTIAL
 *
 * [2020] nanopay Corporation
 * All Rights Reserved.
 *
 * NOTICE:  All information contained herein is, and remains
 * the property of nanopay Corporation.
 * The intellectual and technical concepts contained
 * herein are proprietary to nanopay Corporation
 * and may be covered by Canadian and Foreign Patents, patents
 * in process, and are protected by trade secret or copyright law.
 * Dissemination of this information or reproduction of this material
 * is strictly forbidden unless prior written permission is obtained
 * from nanopay Corporation.
 */

foam.CLASS({
  package: 'net.nanopay.country.br',
  name: 'NatureCodeCardSelectView',
  extends: 'foam.u2.view.CardSelectView',

  documentation: `
    CardSelectView of a minMax where the dependent capabilities are of NatureCode model.
    This displays the operationType of NatureCode on the card.
  `,

  css: `
  ^operation {
    margin-block-start: auto;
    font-weight: 400;
    text-align: end;
    bottom: 0;
    right: 0;
    position: absolute;
    margin: 16px;
  }
  `,

  properties: [
    {
      class: 'String',
      name: 'operationType',
      expression: function(obj) {
        return obj && obj.operationType;
      }
    }
  ],

  methods: [
    function initE() {
      this
        .addClass(this.myClass('innerFlexer')).style({ 'text-align': 'left' })
        .start(this.CardBorder)
          // .addClass(this.myClass('bob'))
          .enableClass(this.myClass('selected'), this.slot((data, mode) => {
            return data && mode !== foam.u2.DisplayMode.DISABLED;
          }))
          .enableClass(this.myClass('disabled'), this.slot((data, mode) => {
            return ! data && mode === foam.u2.DisplayMode.DISABLED;
          }))
          .enableClass(this.myClass('selected-disabled'), this.slot((data, mode) => {
            return data && mode === foam.u2.DisplayMode.DISABLED;
          }))
          .on('click', this.onClick)
          .add(this.label)
          .start().addClass(this.myClass('operation')).add(this.operationType).end()
        .end();
    }
  ]
});
