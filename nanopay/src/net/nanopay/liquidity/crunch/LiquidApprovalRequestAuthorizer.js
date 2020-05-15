foam.CLASS({
  package: 'net.nanopay.liquidity.crunch',
  name: 'LiquidApprovalRequestAuthorizer',
  extends: 'net.nanopay.liquidity.crunch.LiquidAuthorizer',
  implements: [ 'foam.nanos.auth.Authorizer' ],

  javaImports: [
    'foam.dao.DAO',
    'foam.nanos.approval.Approvable',
    'foam.nanos.approval.ApprovalRequest',
    'foam.nanos.approval.ApprovalStatus',
    'foam.nanos.auth.AuthService',
    'foam.nanos.auth.AuthorizationException',
    'foam.nanos.auth.Subject',
    'foam.nanos.auth.User',
    'foam.nanos.logger.Logger',
    'foam.util.SafetyUtil',
    'net.nanopay.liquidity.approvalRequest.AccountRoleApprovalRequest'
  ],

  methods: [
    {
      name: 'createApprovePermission',
      args: [
        { name: 'className', class: 'String' },
        { name: 'outgoingAccountId', class: 'Long' }
      ],
      type: 'String',
      javaCode: `
        String permission = "canApprove";
        permission += className.substring(0, 1).toUpperCase() + className.substring(1);
        if ( outgoingAccountId > 0 ) permission += "." + outgoingAccountId;
        return permission;
      `
    },
    {
      name: 'authorizeOnRead',
      javaCode:  `
        User user = ((Subject) x.get("subject")).getUser();
        if ( user != null && ( user.getId() == foam.nanos.auth.User.SYSTEM_USER_ID || user.getGroup().equals("admin") || user.getGroup().equals("system") ) ) return;

        ApprovalRequest request = (ApprovalRequest) obj;

        // TODO: make this less ugly
        if ( ! (user.getId() == request.getApprover()) ) {

          if ( request.getStatus() == ApprovalStatus.APPROVED || request.getStatus() == ApprovalStatus.REJECTED ){
            if ( ! (request.getCreatedBy() == user.getId()) ){
              throw new AuthorizationException();
            }
          } else {
            throw new AuthorizationException();
          }
        }
      `
    },
    {
      name: 'authorizeOnUpdate',
      javaCode:  `
        Logger logger = (Logger) x.get("logger");
        
        User user = ((Subject) x.get("subject")).getUser();
        Boolean isAdmin = user.getId() == foam.nanos.auth.User.SYSTEM_USER_ID || user.getGroup().equals("admin") || user.getGroup().equals("system");
        if ( user != null &&
             isAdmin &&
             ((ApprovalRequest) newObj).getIsFulfilled() )
          return;
        ApprovalRequest request = (ApprovalRequest) oldObj;
        ApprovalRequest newRequest = (ApprovalRequest) newObj;

        if ( user.getId() != request.getApprover() && ! isAdmin ) {
          throw new AuthorizationException("You are not the approver of this request");
        }

        if ( user.getId() == newRequest.getCreatedBy() &&
          (
            newRequest.getStatus() == foam.nanos.approval.ApprovalStatus.APPROVED ||
            newRequest.getStatus() == foam.nanos.approval.ApprovalStatus.REJECTED
          )
        ){
          throw new AuthorizationException("You cannot approve or reject a request that you have initiated.");
        }

        if ( user.getId() != newRequest.getCreatedBy() && newRequest.getStatus() == foam.nanos.approval.ApprovalStatus.CANCELLED ){
          throw new AuthorizationException("You cannot cancel a request that you did not initiate.");
        }

        if ( user.getId() != newRequest.getCreatedBy() && newRequest.getStatus() == foam.nanos.approval.ApprovalStatus.REQUESTED ){
          throw new AuthorizationException("You cannot reset an already Approved, Rejected or Cancelled request back to Requested");
        }

        Long accountId = oldObj instanceof AccountRoleApprovalRequest ? ((AccountRoleApprovalRequest) oldObj).getOutgoingAccount() : 0;

        String daoKey = request.getDaoKey();
        if ( SafetyUtil.equals(request.getDaoKey(),"approvableDAO") ){
          daoKey = ((Approvable) ((DAO) x.get("approvableDAO")).find(request.getObjId())).getDaoKey();
        }

        String className = ((DAO) x.get(daoKey)).getOf().getObjClass().getSimpleName().toLowerCase();
        String permission = createPermission(className, "approve", accountId);
        AuthService authService = (AuthService) x.get("auth");

        if ( ! authService.check(x, permission) ) {
          throw new AuthorizationException();
        }
      `
    },
    {
      name: 'authorizeOnCreate',
      javaCode:  `
        Logger logger = (Logger) x.get("logger");

        User user = ((Subject) x.get("subject")).getUser();
        if ( user != null && ( user.getId() == foam.nanos.auth.User.SYSTEM_USER_ID || user.getGroup().equals("admin") || user.getGroup().equals("system") ) ) return;

        ApprovalRequest request = (ApprovalRequest) obj;

        Long accountId = obj instanceof AccountRoleApprovalRequest ? ((AccountRoleApprovalRequest) obj).getOutgoingAccount() : 0;

        String daoKey = request.getDaoKey();
        if ( SafetyUtil.equals(request.getDaoKey(),"approvableDAO") ){
          daoKey = ((Approvable) ((DAO) x.get("approvableDAO")).find(request.getObjId())).getDaoKey();
        }

        String className = ((DAO) x.get(daoKey)).getOf().getObjClass().getSimpleName().toLowerCase();
        String permission = createPermission(className, "make", accountId);
        AuthService authService = (AuthService) x.get("auth");

        if ( ! authService.check(x, permission) ) {
          throw new AuthorizationException();
        }
      `
    },
    {
      name: 'authorizeOnDelete',
      javaCode:  `
        User user = ((Subject) x.get("subject")).getUser();
        if ( user != null && ( user.getId() == foam.nanos.auth.User.SYSTEM_USER_ID || user.getGroup().equals("admin") || user.getGroup().equals("system") ) ) return;
        throw new AuthorizationException("Approval requests can only be created by the system");
      `
    }
  ]
})

