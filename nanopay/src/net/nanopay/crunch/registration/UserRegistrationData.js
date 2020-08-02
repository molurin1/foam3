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
  package: 'net.nanopay.crunch.registration',
  name: 'UserRegistrationData',

  documentation: `This model represents the basic info of a User that must be collect after first login.`,
  
  implements: [
    'foam.core.Validatable'
  ],
  
  sections: [
    {
      name: 'userRegistrationSection',
      title: 'Please fill in the user registration form.'
    }
  ],
  
  properties: [
    {
      class: 'String',
      name: 'firstName',
      section: 'userRegistrationSection',
      view: {
        class: 'foam.u2.TextField',
        placeholder: 'Jane'
      },
      required: true
    },
    {
      class: 'String',
      name: 'lastName',
      section: 'userRegistrationSection',
      view: {
        class: 'foam.u2.TextField',
        placeholder: 'Doe'
      },
      required: true
    },
    {
      class: 'PhoneNumber',
      name: 'phone',
      section: 'userRegistrationSection',
      required: true
    }
  ],
  
  methods: [
    {
      name: 'validate',
      javaCode: `
        java.util.List<foam.core.PropertyInfo> props = getClassInfo().getAxiomsByClass(foam.core.PropertyInfo.class);
        for ( foam.core.PropertyInfo prop : props ) {
          try {
            prop.validateObj(x, this);
          } catch ( IllegalStateException e ) {
            throw e;
          }
        }
      `
    }
  ]
});
  