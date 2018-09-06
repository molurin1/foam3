package net.nanopay.contacts;

import foam.core.X;
import foam.dao.ArraySink;
import foam.dao.DAO;
import foam.nanos.auth.*;
import foam.test.TestUtils;
import foam.util.Auth;

public class AuthenticatedContactDAOTest
  extends foam.nanos.test.Test
{
  private Group businessGroup_;
  private Group adminGroup_;
  private User adminUser_;
  private User businessUser_;
  private X adminUserContext_;
  private X businessUserContext_;
  private DAO userDAO_;
  private String testFirstName_ = "John";
  private String testLastName_ = "Smith";
  private String testEmail_ = "john@example.com";
  private String testOrganization_ = "AcmeCo";

  public void runTest(X x) {
    setupTestingSubcontext(x);

    resetTestData(x);
    Put_Create(businessUserContext_);
    resetTestData(x);
    Put_Update_Own(businessUserContext_);
    resetTestData(x);
    Put_Update_Other_Business();
    resetTestData(x);
    Find_Own(businessUserContext_);
    resetTestData(x);
    Find_Other_Business();
    resetTestData(x);
    Remove_Own(businessUserContext_);
    resetTestData(x);
    Remove_Other_Business();
    resetTestData(x);
    Select_Business();
    resetTestData(x);
    RemoveAll_Business();
    resetTestData(x);
    Cannot_Set_Owner(businessUserContext_);
    resetTestData(x);
    Cannot_Set_UserId(businessUserContext_);

    resetTestData(x);
    Put_Create(adminUserContext_);
    resetTestData(x);
    Put_Update_Own(adminUserContext_);
    resetTestData(x);
    Put_Update_Other_Admin();
    resetTestData(x);
    Find_Own(adminUserContext_);
    resetTestData(x);
    Find_Other_Admin();
    resetTestData(x);
    Remove_Own(adminUserContext_);
    resetTestData(x);
    Remove_Other_Admin();
    resetTestData(x);
    Select_Admin();
    resetTestData(x);
    RemoveAll_Admin();
    resetTestData(x);
    Cannot_Set_Owner(adminUserContext_);
    resetTestData(x);
    Cannot_Set_UserId(adminUserContext_);
  }

  /**
   * Create a business user and an admin user as well as sub-contexts for both of them.
   */
  private void setupTestingSubcontext(X x) {
    // Mock the userDAO and put a test user in it.
    x = TestUtils.mockDAO(x, "localUserDAO");
    userDAO_ = (DAO) x.get("localUserDAO");

    adminUser_ = new User();
    adminUser_.setId(1);
    adminUser_.setEmail("admin@example.com");

    businessUser_ = new User();
    businessUser_.setId(2);
    businessUser_.setEmail("business@example.com");

    // Mock the groupDAO.
    x = TestUtils.mockDAO(x, "groupDAO");
    DAO groupDAO = (DAO) x.get("groupDAO");

    // This permission is necessary to access contactDAO.
    Permission SERVICE_PERMISSION = new Permission();
    SERVICE_PERMISSION.setId("service.contactDAO");

    // Put a group in the groupDAO with all permissions for the contactDAO.
    Permission adminPermissions[] = new Permission[6];
    Permission READ_PERMISSION = new Permission();
    Permission CREATE_PERMISSION = new Permission();
    Permission UPDATE_PERMISSION = new Permission();
    Permission REMOVE_PERMISSION = new Permission();
    Permission DELETE_PERMISSION = new Permission();
    READ_PERMISSION.setId("contact.read.*");
    CREATE_PERMISSION.setId("contact.create");
    UPDATE_PERMISSION.setId("contact.update.*");
    REMOVE_PERMISSION.setId("contact.remove.*");
    DELETE_PERMISSION.setId("contact.delete");
    adminPermissions[0] = READ_PERMISSION;
    adminPermissions[1] = CREATE_PERMISSION;
    adminPermissions[2] = UPDATE_PERMISSION;
    adminPermissions[3] = REMOVE_PERMISSION;
    adminPermissions[4] = DELETE_PERMISSION;
    adminPermissions[5] = SERVICE_PERMISSION;

    adminGroup_ = new Group();
    adminGroup_.setId("admin");
    adminGroup_.setPermissions(adminPermissions);
    groupDAO.put(adminGroup_);

    Permission businessPermissions[] = new Permission[1];
    adminPermissions[0] = SERVICE_PERMISSION;

    businessGroup_ = new Group();
    businessGroup_.setId("business");
    businessGroup_.setPermissions(businessPermissions);
    groupDAO.put(businessGroup_);

    // Mock the AuthService.
    UserAndGroupAuthService auth = new UserAndGroupAuthService(x);
    auth.start();
    x = x.put("auth", auth);

    businessUser_.setGroup(businessGroup_.getId());
    userDAO_.put(businessUser_);
    businessUserContext_ = Auth.sudo(x, businessUser_);

    adminUser_.setGroup(adminGroup_.getId());
    userDAO_.put(adminUser_);
    adminUserContext_ = Auth.sudo(x, adminUser_);
  }

  /**
   * Reset the test data to a known state.
   */
  private void resetTestData(X x) {
    DAO contactDAO = (DAO) x.get("contactDAO");
    contactDAO.removeAll_(x, 0, Long.MAX_VALUE, null, null);
  }

  private void Put_Create(X x) {
    try {
      User user = (User) x.get("user");

      // Create a contact to put.
      Contact contact = new Contact.Builder(x).setFirstName(testFirstName_).setLastName(testLastName_).setEmail(testEmail_).setOrganization(testOrganization_).build();

      // Do the put to create.
      Contact result = (Contact) user.getContacts(x).put_(x, contact);

      // Conditions to check.
      boolean emailMatches = result.getEmail() == testEmail_;
      boolean firstNameMatches = result.getFirstName() == testFirstName_;
      boolean lastNameMatches = result.getLastName() == testLastName_;
      boolean organizationMatches = result.getOrganization() == testOrganization_;
      boolean ownerMatches = result.getOwner() == user.getId();

      // Helpful print statements to track down what went wrong.
      if ( ! emailMatches ) System.out.println("Expected email to be '" + testEmail_ + "' but it was '" + result.getEmail() + "'.");
      if ( ! firstNameMatches ) System.out.println("Expected first name to be '" + testFirstName_ + "' but it was '" + result.getFirstName() + "'.");
      if ( ! lastNameMatches ) System.out.println("Expected last name to be '" + testLastName_ + "' but it was '" + result.getLastName() + "'.");
      if ( ! organizationMatches ) System.out.println("Expected organization to be '" + testOrganization_ + "' but it was '" + result.getOrganization() + "'.");
      if ( ! ownerMatches ) System.out.println("Expected owner to be '" + user.getId() + "' but it was '" + result.getOwner() + "'.");

      test(
        emailMatches && firstNameMatches && lastNameMatches && organizationMatches && ownerMatches,
        "Users in group " + user.getGroup() + " can create contacts."
      );
    } catch (Throwable t) {
      System.out.println(t.getMessage());
      t.printStackTrace();
      test(false, "Put_Create shouldn't throw an unexpected error.");
    }
  }

  private void Put_Update_Own(X x) {
    try {
      User user = (User) x.get("user");

      // Create a contact to put.
      Contact contact = new Contact.Builder(x).setFirstName(testFirstName_).setLastName(testLastName_).setEmail(testEmail_).setOrganization(testOrganization_).build();

      // Do the put to create.
      Contact result = (Contact) user.getContacts(x).put_(x, contact);

      // Modify the result.
      result = (Contact) result.fclone();
      result.setLastName("Married");

      // Do the put to update.
      result = (Contact) user.getContacts(x).put_(x, result);

      // Conditions to check.
      boolean emailMatches = result.getEmail() == testEmail_;
      boolean firstNameMatches = result.getFirstName() == testFirstName_;
      boolean lastNameMatches = result.getLastName() == "Married";
      boolean organizationMatches = result.getOrganization() == testOrganization_;
      boolean ownerMatches = result.getOwner() == user.getId();

      // Helpful print statements to track down what went wrong.
      if ( ! emailMatches ) System.out.println("Expected email to be '" + testEmail_ + "' but it was '" + result.getEmail() + "'.");
      if ( ! firstNameMatches ) System.out.println("Expected first name to be '" + testFirstName_ + "' but it was '" + result.getFirstName() + "'.");
      if ( ! lastNameMatches ) System.out.println("Expected last name to be 'Married' but it was '" + result.getLastName() + "'.");
      if ( ! organizationMatches ) System.out.println("Expected organization to be '" + testOrganization_ + "' but it was '" + result.getOrganization() + "'.");
      if ( ! ownerMatches ) System.out.println("Expected owner to be '" + user.getId() + "' but it was '" + result.getOwner() + "'.");

      test(
        emailMatches && firstNameMatches && lastNameMatches && organizationMatches && ownerMatches,
        "Users in group " + user.getGroup() + " can update their own contacts."
      );
    } catch (Throwable t) {
      System.out.println(t.getMessage());
      t.printStackTrace();
      test(false, "Put_Update_Own shouldn't throw an unexpected error.");
    }
  }

  private void Put_Update_Other_Admin() {
    try {
      // Create a contact to put.
      Contact contact = new Contact.Builder(adminUserContext_).setFirstName(testFirstName_).setLastName(testLastName_).setEmail(testEmail_).setOrganization(testOrganization_).build();

      // Do the put to create a contact for a business user.
      Contact result = (Contact) businessUser_.getContacts(businessUserContext_).put_(businessUserContext_, contact);

      // Modify the result.
      result = (Contact) result.fclone();
      result.setLastName("Married");

      // Get a direct reference to the contactDAO.
      DAO contactDAO = (DAO) adminUserContext_.get("contactDAO");

      // Make the admin update the business user's contact.
      result = (Contact) contactDAO.put_(adminUserContext_, result);

      // Conditions to check.
      boolean emailMatches = result.getEmail() == testEmail_;
      boolean firstNameMatches = result.getFirstName() == testFirstName_;
      boolean lastNameMatches = result.getLastName() == "Married";
      boolean organizationMatches = result.getOrganization() == testOrganization_;
      boolean ownerMatches = result.getOwner() == businessUser_.getId();

      // Helpful print statements to track down what went wrong.
      if ( ! emailMatches ) System.out.println("Expected email to be '" + testEmail_ + "' but it was '" + result.getEmail() + "'.");
      if ( ! firstNameMatches ) System.out.println("Expected first name to be '" + testFirstName_ + "' but it was '" + result.getFirstName() + "'.");
      if ( ! lastNameMatches ) System.out.println("Expected last name to be 'Married' but it was '" + result.getLastName() + "'.");
      if ( ! organizationMatches ) System.out.println("Expected organization to be '" + testOrganization_ + "' but it was '" + result.getOrganization() + "'.");
      if ( ! ownerMatches ) System.out.println("Expected owner to be '" + businessUser_.getId() + "' but it was '" + result.getOwner() + "'.");

      test(
        emailMatches && firstNameMatches && lastNameMatches && organizationMatches && ownerMatches,
        "Admin users can update other users' contacts."
      );
    } catch (Throwable t) {
      System.out.println(t.getMessage());
      t.printStackTrace();
      test(false, "Put_Update_Other_Admin shouldn't throw an unexpected error.");
    }
  }

  private void Put_Update_Other_Business() {
    try {
      // Create a contact to put.
      Contact contact = new Contact.Builder(businessUserContext_).setFirstName(testFirstName_).setLastName(testLastName_).setEmail(testEmail_).setOrganization(testOrganization_).build();

      // Do the put to create a contact for an admin.
      Contact result = (Contact) adminUser_.getContacts(adminUserContext_).put_(adminUserContext_, contact);

      // Modify the result.
      final Contact modified = (Contact) result.fclone();
      modified.setLastName("Married");

      // Get a direct reference to the contactDAO.
      DAO contactDAO = (DAO) businessUserContext_.get("contactDAO");

      // Make the business user update the admin user's contact.
      test(
        TestUtils.testThrows(
          () -> contactDAO.put_(businessUserContext_, modified),
          "Permission denied.",
          AuthorizationException.class
        ),
        "Non-admin users cannot update other users' contacts."
      );
    } catch (Throwable t) {
      System.out.println(t.getMessage());
      t.printStackTrace();
      test(false, "Put_Update_Other_Business shouldn't throw an unexpected error.");
    }
  }

  private void Find_Own(X x) {
    try {
      User user = (User) x.get("user");

      // Create a contact to put.
      Contact contact = new Contact.Builder(x).setFirstName(testFirstName_).setLastName(testLastName_).setEmail(testEmail_).setOrganization(testOrganization_).build();

      // Put the contact in the DAO so we can try to find it.
      Contact putResult = (Contact) user.getContacts(x).put_(x, contact);

      // Try to find the contact we just added.
      Contact findResult = (Contact) user.getContacts(x).find_(x, putResult.getId());

      // Conditions to check.
      boolean emailMatches = findResult.getEmail() == testEmail_;
      boolean firstNameMatches = findResult.getFirstName() == testFirstName_;
      boolean lastNameMatches = findResult.getLastName() == testLastName_;
      boolean organizationMatches = findResult.getOrganization() == testOrganization_;
      boolean ownerMatches = findResult.getOwner() == user.getId();

      // Helpful print statements to track down what went wrong.
      if ( ! emailMatches ) System.out.println("Expected email to be '" + testEmail_ + "' but it was '" + findResult.getEmail() + "'.");
      if ( ! firstNameMatches ) System.out.println("Expected first name to be '" + testFirstName_ + "' but it was '" + findResult.getFirstName() + "'.");
      if ( ! lastNameMatches ) System.out.println("Expected last name to be '" + testLastName_ + "' but it was '" + findResult.getLastName() + "'.");
      if ( ! organizationMatches ) System.out.println("Expected organization to be '" + testOrganization_ + "' but it was '" + findResult.getOrganization() + "'.");
      if ( ! ownerMatches ) System.out.println("Expected owner to be '" + user.getId() + "' but it was '" + findResult.getOwner() + "'.");

      test(
        emailMatches && firstNameMatches && lastNameMatches && organizationMatches && ownerMatches,
        "Users in group " + user.getGroup() + " can find their own contacts."
      );
    } catch (Throwable t) {
      System.out.println(t.getMessage());
      t.printStackTrace();
      test(false, "Find_Own shouldn't throw an unexpected error.");
    }
  }

  private void Find_Other_Admin() {
    try {
      // Create a contact to put.
      Contact contact = new Contact.Builder(adminUserContext_).setFirstName(testFirstName_).setLastName(testLastName_).setEmail(testEmail_).setOrganization(testOrganization_).build();

      // Do the put to create a contact for a business user.
      Contact putResult = (Contact) businessUser_.getContacts(businessUserContext_).put_(businessUserContext_, contact);

      // Get a direct reference to the contactDAO.
      DAO contactDAO = (DAO) adminUserContext_.get("contactDAO");

      // Make the admin find the business user's contact.
      Contact result = (Contact) contactDAO.find_(adminUserContext_, putResult.getId());

      // Conditions to check.
      boolean emailMatches = result.getEmail() == testEmail_;
      boolean firstNameMatches = result.getFirstName() == testFirstName_;
      boolean lastNameMatches = result.getLastName() == testLastName_;
      boolean organizationMatches = result.getOrganization() == testOrganization_;
      boolean ownerMatches = result.getOwner() == businessUser_.getId();

      // Helpful print statements to track down what went wrong.
      if ( ! emailMatches ) System.out.println("Expected email to be '" + testEmail_ + "' but it was '" + result.getEmail() + "'.");
      if ( ! firstNameMatches ) System.out.println("Expected first name to be '" + testFirstName_ + "' but it was '" + result.getFirstName() + "'.");
      if ( ! lastNameMatches ) System.out.println("Expected last name to be '" + testLastName_ + "' but it was '" + result.getLastName() + "'.");
      if ( ! organizationMatches ) System.out.println("Expected organization to be '" + testOrganization_ + "' but it was '" + result.getOrganization() + "'.");
      if ( ! ownerMatches ) System.out.println("Expected owner to be '" + businessUser_.getId() + "' but it was '" + result.getOwner() + "'.");

      test(
        emailMatches && firstNameMatches && lastNameMatches && organizationMatches && ownerMatches,
        "Admin users can find other users' contacts."
      );
    } catch (Throwable t) {
      System.out.println(t.getMessage());
      t.printStackTrace();
      test(false, "Find_Other_Admin shouldn't throw an unexpected error.");
    }
  }

  private void Find_Other_Business() {
    try {
      // Create a contact to put.
      Contact contact = new Contact.Builder(businessUserContext_).setFirstName(testFirstName_).setLastName(testLastName_).setEmail(testEmail_).setOrganization(testOrganization_).build();

      // Do the put to create a contact for an admin.
      Contact result = (Contact) adminUser_.getContacts(adminUserContext_).put_(adminUserContext_, contact);

      // Get a direct reference to the contactDAO.
      DAO contactDAO = (DAO) businessUserContext_.get("contactDAO");

      // Make the business user update the admin user's contact.
      test(
        TestUtils.testThrows(
          () -> contactDAO.find_(businessUserContext_, result.getId()),
          "Permission denied.",
          AuthorizationException.class
        ),
        "Non-admin users cannot find other users' contacts."
      );
    } catch (Throwable t) {
      System.out.println(t.getMessage());
      t.printStackTrace();
      test(false, "Find_Other_Business shouldn't throw an unexpected error.");
    }
  }

  private void Remove_Own(X x) {
    try {
      User user = (User) x.get("user");

      // Create a contact to put.
      Contact contact = new Contact.Builder(x).setFirstName(testFirstName_).setLastName(testLastName_).setEmail(testEmail_).setOrganization(testOrganization_).build();

      // Do the put to create.
      Contact putResult = (Contact) user.getContacts(x).put_(x, contact);

      // Remove the contact.
      user.getContacts(x).remove_(x, putResult);

      // Try to find the removed contact.
      Contact findResult = (Contact) user.getContacts(x).find_(x, putResult.getId());

      test(findResult == null, "Users in group " + user.getGroup() + " can remove their own contacts.");
    } catch (Throwable t) {
      System.out.println(t.getMessage());
      t.printStackTrace();
      test(false, "Remove_Own shouldn't throw an unexpected error.");
    }
  }

  private void Remove_Other_Admin() {
    try {
      // Create a contact to put.
      Contact contact = new Contact.Builder(adminUserContext_).setFirstName(testFirstName_).setLastName(testLastName_).setEmail(testEmail_).setOrganization(testOrganization_).build();

      // Do the put to create a contact for a business user.
      Contact putResult = (Contact) businessUser_.getContacts(businessUserContext_).put_(businessUserContext_, contact);

      // Get a direct reference to the contactDAO.
      DAO contactDAO = (DAO) adminUserContext_.get("contactDAO");

      // Make the admin remove the business user's contact.
      contactDAO.remove_(adminUserContext_, putResult);

      // Try to find the removed contact.
      Contact findResult = (Contact) contactDAO.find_(adminUserContext_, putResult.getId());

      test(findResult == null, "Admin users can remove other users' contacts.");
    } catch (Throwable t) {
      System.out.println(t.getMessage());
      t.printStackTrace();
      test(false, "Remove_Other_Admin shouldn't throw an unexpected error.");
    }
  }

  private void Remove_Other_Business() {
    try {
      // Create a contact to put.
      Contact contact = new Contact.Builder(businessUserContext_).setFirstName(testFirstName_).setLastName(testLastName_).setEmail(testEmail_).setOrganization(testOrganization_).build();

      // Do the put to create a contact for an admin.
      Contact putResult = (Contact) adminUser_.getContacts(adminUserContext_).put_(adminUserContext_, contact);

      // Get a direct reference to the contactDAO.
      DAO contactDAO = (DAO) businessUserContext_.get("contactDAO");

      // Make the business user update the admin user's contact.
      test(
        TestUtils.testThrows(
          () -> contactDAO.remove_(businessUserContext_, putResult),
          "Permission denied.",
          AuthorizationException.class
        ),
        "Non-admin users cannot remove other users' contacts."
      );
    } catch (Throwable t) {
      System.out.println(t.getMessage());
      t.printStackTrace();
      test(false, "Remove_Other_Business shouldn't throw an unexpected error.");
    }
  }

  private void Select_Admin() {
    try {
      // Create a contact for the admin to put.
      Contact adminContact = new Contact.Builder(adminUserContext_).setFirstName(testFirstName_).setLastName(testLastName_).setEmail(testEmail_).setOrganization(testOrganization_).build();

      // Create a contact for the business user to put.
      Contact businessContact = new Contact.Builder(businessUserContext_).setFirstName(testLastName_).setLastName(testFirstName_).setEmail(testEmail_).setOrganization(testOrganization_).build();

      // Do the put to create a contact for the business user.
      adminUser_.getContacts(adminUserContext_).put_(adminUserContext_, adminContact);

      // Do the put to create a contact for the admin user.
      businessUser_.getContacts(businessUserContext_).put_(businessUserContext_, businessContact);

      // Get a direct reference to the contactDAO.
      DAO contactDAO = (DAO) adminUserContext_.get("contactDAO");

      // Make the admin select on the contactDAO.
      ArraySink sink = new ArraySink();
      contactDAO.select_(adminUserContext_, sink, 0, Long.MAX_VALUE, null, null);

      test(
        sink.getArray().size() == 2,
        "Admin users get all objects when selecting."
      );
    } catch (Throwable t) {
      System.out.println(t.getMessage());
      t.printStackTrace();
      test(false, "Select_Admin shouldn't throw an unexpected error.");
    }
  }

  private void Select_Business() {
    try {
      // Create a contact for the admin to put.
      Contact adminContact = new Contact.Builder(adminUserContext_).setFirstName(testFirstName_).setLastName(testLastName_).setEmail(testEmail_).setOrganization(testOrganization_).build();

      // Create a contact for the business user to put.
      Contact businessContact = new Contact.Builder(businessUserContext_).setFirstName(testLastName_).setLastName(testFirstName_).setEmail(testEmail_).setOrganization(testOrganization_).build();

      // Do the put to create a contact for the business user.
      adminUser_.getContacts(adminUserContext_).put_(adminUserContext_, adminContact);

      // Do the put to create a contact for the admin user.
      businessUser_.getContacts(businessUserContext_).put_(businessUserContext_, businessContact);

      // Get a direct reference to the contactDAO.
      DAO contactDAO = (DAO) businessUserContext_.get("contactDAO");

      // Make the business user select on the contactDAO.
      ArraySink sink = new ArraySink();
      contactDAO.select_(businessUserContext_, sink, 0, Long.MAX_VALUE, null, null);

      test(
        sink.getArray().size() == 1,
        "Business users only get objects they own when selecting."
      );
    } catch (Throwable t) {
      System.out.println(t.getMessage());
      t.printStackTrace();
      test(false, "Select_Business shouldn't throw an unexpected error.");
    }
  }

  private void RemoveAll_Admin() {
    try {
      // Create a contact for the admin to put.
      Contact adminContact = new Contact.Builder(adminUserContext_).setFirstName(testFirstName_).setLastName(testLastName_).setEmail(testEmail_).setOrganization(testOrganization_).build();

      // Create a contact for the business user to put.
      Contact businessContact = new Contact.Builder(businessUserContext_).setFirstName(testLastName_).setLastName(testFirstName_).setEmail(testEmail_).setOrganization(testOrganization_).build();

      // Do the put to create a contact for the business user.
      adminUser_.getContacts(adminUserContext_).put_(adminUserContext_, adminContact);

      // Do the put to create a contact for the admin user.
      businessUser_.getContacts(businessUserContext_).put_(businessUserContext_, businessContact);

      // Get a direct reference to the contactDAO.
      DAO contactDAO = (DAO) adminUserContext_.get("contactDAO");

      // Make the admin user removeAll on the contactDAO.
      contactDAO.removeAll_(adminUserContext_, 0, Long.MAX_VALUE, null, null);

      // Make the admin user select on the contactDAO.
      ArraySink sink = new ArraySink();
      contactDAO.select_(adminUserContext_, sink, 0, Long.MAX_VALUE, null, null);

      test(
        sink.getArray().size() == 0,
        "Admin users remove all objects when calling removeAll."
      );
    } catch (Throwable t) {
      System.out.println(t.getMessage());
      t.printStackTrace();
      test(false, "RemoveAll_Admin shouldn't throw an unexpected error.");
    }
  }

  private void RemoveAll_Business() {
    try {
      // Create a contact for the admin to put.
      Contact adminContact = new Contact.Builder(adminUserContext_).setFirstName(testFirstName_).setLastName(testLastName_).setEmail(testEmail_).setOrganization(testOrganization_).build();

      // Create a contact for the business user to put.
      Contact businessContact = new Contact.Builder(businessUserContext_).setFirstName(testLastName_).setLastName(testFirstName_).setEmail(testEmail_).setOrganization(testOrganization_).build();

      // Do the put to create a contact for the business user.
      adminUser_.getContacts(adminUserContext_).put_(adminUserContext_, adminContact);

      // Do the put to create a contact for the admin user.
      businessUser_.getContacts(businessUserContext_).put_(businessUserContext_, businessContact);

      // Get a direct reference to the contactDAO.
      DAO contactDAO = (DAO) businessUserContext_.get("contactDAO");

      // Make the business user removeAll on the contactDAO.
      contactDAO.removeAll_(businessUserContext_, 0, Long.MAX_VALUE, null, null);

      // Make the admin user select on the contactDAO.
      ArraySink sink = new ArraySink();
      contactDAO.select_(adminUserContext_, sink, 0, Long.MAX_VALUE, null, null);

      test(
        sink.getArray().size() == 1,
        "Business users only remove objects they own when calling removeAll."
      );
    } catch (Throwable t) {
      System.out.println(t.getMessage());
      t.printStackTrace();
      test(false, "Select_Business shouldn't throw an unexpected error.");
    }
  }

  private void Cannot_Set_Owner(X x) {
    try {
      User user = (User) x.get("user");

      // Create a contact to put.
      Contact contact = new Contact.Builder(x).setFirstName(testFirstName_).setLastName(testLastName_).setEmail(testEmail_).setOrganization(testOrganization_).build();

      // Do the put to create.
      Contact result = (Contact) user.getContacts(x).put_(x, contact);

      // Change the owner to the other user.
      Contact modified = (Contact) result.fclone();
      modified.setOwner(user.getId() == 1 ? 2 : 1);

      // Get a direct reference to the contactDAO.
      DAO contactDAO = (DAO) x.get("contactDAO");

      test(
        TestUtils.testThrows(
          () -> contactDAO.put_(x, modified),
          "Changing the owner of a contact is not allowed.",
         AuthorizationException.class
        ),
        "Users in group '" + user.getGroup() + "' cannot set owner property."
      );
    } catch (Throwable t) {
      System.out.println(t.getMessage());
      t.printStackTrace();
      test(false, "Put_Update_Own shouldn't throw an unexpected error.");
    }
  }

  private void Cannot_Set_UserId(X x) {
    try {
      User user = (User) x.get("user");

      // Create a contact to put.
      Contact contact = new Contact.Builder(x).setFirstName(testFirstName_).setLastName(testLastName_).setEmail(testEmail_).setOrganization(testOrganization_).build();

      // Do the put to create.
      Contact result = (Contact) user.getContacts(x).put_(x, contact);

      // Change the userId.
      Contact modified = (Contact) result.fclone();
      modified.setUserId(123); // 123 is a dummy value.

      test(
        TestUtils.testThrows(
          () -> user.getContacts(x).put_(x, modified),
          "Changing the user pointed to by a contact is not allowed.",
         AuthorizationException.class
        ),
        "Users in group '" + user.getGroup() + "' cannot set userId property."
      );
    } catch (Throwable t) {
      System.out.println(t.getMessage());
      t.printStackTrace();
      test(false, "Put_Update_Own shouldn't throw an unexpected error.");
    }
  }
}
