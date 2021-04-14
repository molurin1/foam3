/**
 * NANOPAY CONFIDENTIAL
 *
 * [2021] nanopay Corporation
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
  package: 'net.nanopay.ticket',
  name: 'Scenario',
  extends: 'foam.nanos.ruler.Rule',

  documentation: 'Rule that can only be seen if the user who created the transaction has permissions to select it.',

  javaImports: [
    'foam.core.X',
    'foam.nanos.auth.User',
    'net.nanopay.account.Account',
    'net.nanopay.ticket.RefundTicket',
    'net.nanopay.tx.model.Transaction',
    'static foam.mlang.MLang.*'
  ],

  methods: [
    {
      name: 'getUser',
      javaCode: `
        Transaction txn = ((RefundTicket) obj).findProblemTransaction(x);
        return txn.findSourceAccount(x).findOwner(x);
      `
    }
  ]
});
