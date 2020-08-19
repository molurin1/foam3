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
  package: 'net.nanopay.country.br.tx.fee',
  name: 'PTaxRateFee',
  extends: 'net.nanopay.tx.fee.PercentageFee',

  documentation: 'PTaxRate fee from the Central Bank of Brazil.',

  javaImports: [
    'net.nanopay.country.br.OpenDataService'
  ],

  messages: [
    { name: 'FORMULA_PREFIX', message: 'PTaxRate fee' }
  ],

  properties: [
    {
      name: 'percentage',
      transient: true,
      visibility: 'HIDDEN',
      javaGetter: `
        var openDataService = (OpenDataService) getX().get("openDataService");
        var pTaxRate = openDataService.getPTaxRate();
        return pTaxRate.getCotacaoVenda();
      `
    },
    {
      name: 'formula',
      visibility: 'HIDDEN',
      tableCellFormatter: function(_, obj) {
        this.add(obj.FORMULA_PREFIX);
      }
    }
  ]
});
