foam.CLASS({
  package: 'net.nanopay.auth',
  name: 'ExternalInvoiceTokenTest',
  extends: 'foam.nanos.test.Test',

  javaImports: [
    'foam.core.X',
    'foam.dao.ArraySink',
    'foam.dao.DAO',
    'foam.dao.MDAO',
    'foam.dao.Sink',
    'foam.nanos.auth.AuthenticationException',
    'foam.nanos.auth.AuthorizationException',
    'foam.nanos.auth.User',
    'foam.nanos.auth.token.Token',
    'foam.nanos.auth.token.TokenService',
    'foam.util.Auth',
    'java.util.Calendar',
    'java.util.List',
    'net.nanopay.contacts.Contact',
    'net.nanopay.model.Business',
    'net.nanopay.invoice.model.Invoice',
    'static foam.mlang.MLang.*'
  ],

  methods: [{
    name: 'runTest',
    javaReturns: 'void',
    javaCode: `
      DAO bareUserDAO = (DAO) x.get("bareUserDAO");
      DAO localUserDAO = (DAO) x.get("localUserDAO");
      DAO contactDAO = (DAO) x.get("contactDAO");
      DAO tokenDAO = (DAO) x.get("tokenDAO");
      TokenService externalToken = (TokenService) x.get("externalInvoiceToken");

      Calendar calendar = Calendar.getInstance();

      // Remove existing test contacts and users if exists.
      bareUserDAO.where(EQ(Contact.EMAIL, "samus@example.com")).removeAll();

      User user = new User();
      user.setFirstName("Unit");
      user.setLastName("Test");
      user.setEmail("test.nanopay1@mailinator.com");
      user.setGroup("admin");
      user = (User) bareUserDAO.put(user);
      x = Auth.sudo(x, user);
      
      // Create the test contact to send money to.
      Contact contact = new Contact();
      contact.setEmail("samus@example.com");
      contact.setFirstName("Samus");
      contact.setLastName("Aran");
      contact.setOrganization("Retro Studios");
      Contact samus = (Contact) user.getContacts(x).put(contact);

      // Create a payable invoice with the contact as the payee.
      Invoice invoice = new Invoice();
      invoice.setPayeeId(samus.getId());
      invoice.setAmount(1);
      invoice.setDestinationCurrency("CAD");
      invoice.setSourceCurrency("CAD");
      invoice = (Invoice) user.getExpenses(x).put(invoice);

      // Find generated token and check to see if contact user is associated.

      Token result = (Token) tokenDAO.find(AND(
        EQ(Token.PROCESSED, false),
        GT(Token.EXPIRY, calendar.getTime()),
        EQ(Token.USER_ID, samus.getId())
        ));

      test(result != null, "Generated token for external user on invoice create exists." );

      // Set up actual user.
      User actualUser = new User();
      actualUser.setEmail("samus@example.com");
      actualUser.setFirstName("Samus");
      actualUser.setLastName("Aran");
      actualUser.setOrganization("Retro Studios");
      actualUser.setDesiredPassword("metroid123");
      actualUser.setSpid("nanopay");
      
      // Process Token & Create user
      externalToken.processToken(x, actualUser, result.getData());

      // Get created user from the external token service and check if enabled.
      User tokenUser = (User) localUserDAO.find(
        AND(
          EQ(User.EMAIL, "samus@example.com"),
          NOT(INSTANCE_OF(Business.class)),
          NOT(INSTANCE_OF(Contact.class))
        )
      );

      test(tokenUser.getEnabled() == true, "Process token enabled & created user associated to token.");
      test(tokenUser.getEmailVerified() == true, "Process token email verified user.");

      // Get Token and check if processed to true.
      Token processedToken = (Token) tokenDAO.find(AND(
        EQ(Token.PROCESSED, true),
        GT(Token.EXPIRY, calendar.getTime()),
        EQ(Token.DATA, result.getData())
        ));
  
      test(processedToken != null, "External token was processed." );

      // Create new invoice, token should not be created and processed since user exists.
      Invoice invoice2 = new Invoice();
      invoice2.setPayeeId(samus.getId());
      invoice2.setAmount(1);
      invoice2.setDestinationCurrency("CAD");
      invoice2.setSourceCurrency("CAD");
      invoice2 = (Invoice) user.getExpenses(x).put(invoice2);

      Token noToken = (Token) tokenDAO.find(AND(
        EQ(Token.PROCESSED, false),
        GT(Token.EXPIRY, calendar.getTime()),
        EQ(Token.USER_ID, samus.getId())
        ));

      test( noToken == null, "Token for internal user was not created since already exists." );

    `
  }]
});
