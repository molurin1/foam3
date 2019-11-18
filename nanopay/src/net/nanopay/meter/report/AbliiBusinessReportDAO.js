foam.CLASS({
  package: 'net.nanopay.meter.report',
  name: 'AbliiBusinessReportDAO',
  extends: 'foam.dao.ProxyDAO',

  documentation: `A generic report for all the businesses.`,

  javaImports: [
    'foam.core.Detachable',
    'foam.core.X',
    'foam.dao.AbstractSink',
    'foam.dao.DAO',
    'foam.dao.MDAO',
    'foam.dao.ArraySink',
    'foam.dao.Sink',
    'foam.mlang.MLang',
    'foam.mlang.sink.Count',
    'foam.mlang.sink.Map',
    'foam.nanos.auth.User',
    'foam.nanos.auth.UserUserJunction',
    'net.nanopay.account.Account',
    'net.nanopay.auth.LoginAttempt',
    'net.nanopay.bank.BankAccount',
    'net.nanopay.meter.report.model.AbliiBusinessReport',
    'net.nanopay.model.Business',
    'net.nanopay.sme.onboarding.BusinessOnboarding',
    'net.nanopay.sme.onboarding.OnboardingStatus',
    'net.nanopay.sme.onboarding.USBusinessOnboarding',
    'net.nanopay.tx.model.Transaction',
    
    'java.text.DateFormat',
    'java.text.SimpleDateFormat',
    'java.util.*',
  ],

  methods: [
    {
      name: 'select_',
      javaCode: `
        if ( sink == null )
          return super.select_(x, sink, skip, limit, order, predicate);

        Sink decoratedSink = decorateSink(x, sink, skip, limit, order, predicate);

        // Retrieve the DAO
        DAO businessDAO             = (DAO) x.get("localBusinessDAO");
        DAO businessOnboardingDAO   = (DAO) x.get("businessOnboardingDAO");
        DAO uSBusinessOnboardingDAO = (DAO) x.get("uSBusinessOnboardingDAO");
        DAO transactionDAO          = (DAO) x.get("localTransactionDAO");
        DAO loginAttemptDAO         = (DAO) x.get("loginAttemptDAO");
        DAO agentJunctionDAO        = (DAO) x.get("agentJunctionDAO");
        DateFormat dateFormat = new SimpleDateFormat("yyyy-MM-dd");
    
        businessDAO.select(new AbstractSink() {
          public void put(Object obj, Detachable sub) {
            Business business = (Business) obj;
    
            // format the sign up date
            String signUpDate = dateFormat.format(business.getCreated());
    
            // find the person who created the business account
            User createdBy = business.findCreatedBy(x);
            String owner = createdBy == null ? "" : createdBy.getLegalName();
    
            // get the country of the business
            String country = business.getCountryOfBusinessRegistration();
    
            // check whether the business is onboarded
            String busVerification = business.getOnboarded() ? "Yes" : "No";
    
            // check whether a bankAccount has been added to the business
            Map map = new Map.Builder(x)
              .setArg1(Account.ID)
              .setDelegate(new ArraySink())
              .build();
            business.getAccounts(x).where(MLang.INSTANCE_OF(BankAccount.class)).select(map);
            List accountIds = ((ArraySink) map.getDelegate()).getArray();
            String bankAdded = accountIds.size() != 0 ? "Yes" : "No";
    
            // get the onboarding submitted date(last modified date if the businessOnboarding is submitted)
            String onboardSubmitDate = "";
            if ( country.equals("CA") ) {
              BusinessOnboarding bo = (BusinessOnboarding) businessOnboardingDAO.find(
                MLang.AND(
                  MLang.EQ(BusinessOnboarding.BUSINESS_ID, business.getId()),
                  MLang.EQ(BusinessOnboarding.STATUS, OnboardingStatus.SUBMITTED)
                )
              );
              if ( bo != null ) onboardSubmitDate = dateFormat.format(bo.getLastModified());
            }
            else if ( country.equals("US") ) {
              USBusinessOnboarding ubo = (USBusinessOnboarding) uSBusinessOnboardingDAO.find(
                MLang.AND(
                  MLang.EQ(USBusinessOnboarding.BUSINESS_ID, business.getId()),
                  MLang.EQ(USBusinessOnboarding.STATUS, OnboardingStatus.SUBMITTED)
                )
              );
              if ( ubo != null ) onboardSubmitDate = dateFormat.format(ubo.getLastModified());
            }
    
            // check whether the business has ever created a transaction
            Count count = (Count) transactionDAO.where(
              MLang.IN(Transaction.SOURCE_ACCOUNT, accountIds)
            ).select(new Count());
            long numOfTransaction = count.getValue();

    
            // get the IP address of the last time any user of the business logged in
            map = new Map.Builder(x)
              .setArg1(UserUserJunction.SOURCE_ID)
              .setDelegate(new ArraySink())
              .build();
            agentJunctionDAO.where(MLang.EQ(UserUserJunction.TARGET_ID, business.getId())).select(map);
            List userIds = ((ArraySink) map.getDelegate()).getArray();
            LoginAttempt loginAttempt = (LoginAttempt) loginAttemptDAO.find(
                MLang.IN(LoginAttempt.LOGIN_ATTEMPTED_FOR, userIds));
            String ip = loginAttempt == null ? "" : loginAttempt.getIpAddress();
    
            AbliiBusinessReport abr = new AbliiBusinessReport.Builder(x)
              .setSignUpDate(signUpDate)
              .setBusId(business.getId())
              .setName(business.getBusinessName())
              .setOwner(owner)
              .setCountry(country)
              .setOnboarded(busVerification)
              .setBankAccountAdded(bankAdded)
              .setDateSubmitted(onboardSubmitDate)
              .setStatus(business.getCompliance())
              .setNumOfTransaction(numOfTransaction)
              .setIp(ip)
              .setEmail(business.getEmail())
              .build();
            
            decoratedSink.put(abr, null);
          }
        });

        return decoratedSink;
      `
    }
  ]
});
