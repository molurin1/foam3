foam.CLASS({
  package: 'net.nanopay.sme.cron',
  name: 'WelcomeEmailCron',
  implements: [
    'foam.core.ContextAgent'
  ],

  javaImports: [
    'foam.dao.ArraySink',
    'foam.dao.DAO',
    'foam.nanos.logger.Logger',
    'foam.nanos.notification.email.EmailMessage',
    'foam.util.Emails.EmailsUtility',
    'java.util.Date',
    'java.util.HashMap',
    'java.util.List',
    'java.util.Map',
    'net.nanopay.model.Business',
    'static foam.mlang.MLang.*',
  ],

  documentation: 'Send Welcome Email to Ablii Business 30min after SignUp',

  methods: [
    {
      name: 'execute',
      args: [
        {
          name: 'x',
          type: 'Context'
        }
      ],
      javaCode:
        `
        EmailMessage         message        = null;
        Map<String, Object>  args           = null;
        DAO                  businessDAO    = (DAO) x.get("businessDAO");
        Date                 startInterval  = new Date(new Date().getTime() - (1000 * 60 * 20));
        Date                 endInterval    = new Date(startInterval.getTime() - (1000 * 60 * 20));

        List<Business> businessOnboardedInLastXmin = ( (ArraySink) businessDAO.where(
          AND(
            GTE(Business.CREATED, endInterval),
            LT(Business.CREATED, startInterval))
          ).select(new ArraySink())).getArray();

        for(Business business : businessOnboardedInLastXmin) {
          message        = new EmailMessage();
          args           = new HashMap<>();

          message.setTo(new String[]{ business.getEmail() });
          args.put("name", business.label());  
          try {
            EmailsUtility.sendEmailFromTemplate(x, business, message, "helpsignup", args);
          } catch (Throwable t) {
            String msg = String.format("Email meant for business SignUp Error: Business (id = %1$s)", business.getId());
            ((Logger) x.get("logger")).error(msg, t);
          }
        }
        `
    }
  ]
});

