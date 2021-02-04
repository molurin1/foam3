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
  package: 'net.nanopay.ticket',
  name: 'ReversalTicketCreateApprovals',

  implements: [
    'foam.nanos.ruler.RuleAction'
  ],

  documentation: `Rule to send out approvals after the ReversalTicket has been created`,

  javaImports: [
    'foam.core.ContextAwareAgent',
    'foam.core.FObject',
    'foam.core.X',
    'foam.dao.DAO',
    'foam.dao.ArraySink',
    'foam.nanos.auth.User',
    'foam.nanos.approval.Approvable',
    'foam.nanos.approval.ApprovalRequest',
    'foam.nanos.approval.ApprovalStatus',
    'foam.nanos.ruler.Operations',
    'foam.nanos.auth.Subject',
    'java.util.Map',
    'java.util.ArrayList',
    'java.util.List',
    'foam.util.SafetyUtil',
    'net.nanopay.ticket.ReversalTicket',
    'net.nanopay.ticket.RefundStatus',
    'foam.nanos.logger.Logger'
  ],

  properties: [
    {
      class: 'String',
      name: 'groupToNotify',
      value: 'fraud-ops'
    }
  ],

  methods: [
    {
      name: 'applyAction',
      javaCode: `
        User user = ((Subject) x.get("subject")).getUser();

        Logger logger = (Logger) x.get("logger");

        FObject clonedObj = obj.fclone();

        ReversalTicket oldReversalTicket = (ReversalTicket) obj;
        ReversalTicket newReversalTicket = (ReversalTicket) clonedObj;

        agency.submit(x, new ContextAwareAgent() {

          @Override
          public void execute(X x) {
            DAO approvalRequestDAO = (DAO) getX().get("approvalRequestDAO");
            DAO approvableDAO = (DAO) getX().get("approvableDAO");

            Operations operation = Operations.CREATE;

            String hashedId = new StringBuilder("d")
              .append("localTicketDAO")
              .append(":o")
              .append(String.valueOf(oldReversalTicket.getId()))
              .toString();

            List approvablesPending = ((ArraySink) approvableDAO
              .where(foam.mlang.MLang.AND(
                foam.mlang.MLang.EQ(Approvable.LOOKUP_ID, hashedId),
                foam.mlang.MLang.EQ(Approvable.STATUS, ApprovalStatus.REQUESTED)
              )).inX(getX()).select(new ArraySink())).getArray();

            if ( approvablesPending.size() > 0 ){
              logger.warning("Approvable already  exists for: " + hashedId);
              // TODO: throw an error once we add the paymentId checks as this is supposed  to be  unexpected
              // but because no paymentid check, then we end up in  an infinite loop just need to return
              return;
            }

            try {
              FObject objectToDiffAgainst = (FObject) oldReversalTicket;

              newReversalTicket.setRefundStatus(RefundStatus.APPROVED);

              Map propertiesToApprove = objectToDiffAgainst.diff(newReversalTicket);

              Approvable approvable = (Approvable) approvableDAO.put_(getX(), new Approvable.Builder(getX())
                .setLookupId(hashedId)
                .setDaoKey("ticketDAO")
                .setServerDaoKey("localTicketDAO")
                .setStatus(ApprovalStatus.REQUESTED)
                .setObjId(String.valueOf(obj.getProperty("id")))
                .setOperation(operation)
                .setOf(oldReversalTicket.getClassInfo())
                .setPropertiesToUpdate(propertiesToApprove).build());

              ApprovalRequest  approvalRequest = new ApprovalRequest.Builder(getX())
                .setDaoKey("approvableDAO")
                .setObjId(approvable.getId())
                .setOperation(operation)
                .setCreatedBy(user.getId())
                .setGroup(getGroupToNotify())
                .setClassification(
                  "Ticket:" +
                  oldReversalTicket.getId() +
                  " for Transaction:" +
                  oldReversalTicket.getRequestTransaction()
                )
                .setStatus(ApprovalStatus.REQUESTED).build();

              approvalRequestDAO.put_(getX(), approvalRequest);
            } catch (Exception e){
              throw new RuntimeException(e);
            }
          }
        }, "Sent out approval requests to approve the ReversalTicket");
      `
    }
  ]

});
