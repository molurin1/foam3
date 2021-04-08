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
  package: 'net.nanopay.partner.treviso',
  name: 'TrevisoUnlockPaymentTermsAndConditions',
  extends: 'net.nanopay.crunch.acceptanceDocuments.BaseAcceptanceDocumentCapability',

  imports: [
    'appConfig'
  ],

  messages: [
    { name: 'ACKNOWLEDGE_BRAZIL_TC', message: 'Must acknowledge the Terms and Conditions' },
    { name: 'AGREEMENT_FILE', message: '01aafe67-d9c1-6181-ce7b-54ad2d1c791f'}
  ],

  sections: [
    {
      name: 'reviewAgreementDocumentsSection',
      title: 'Review and accept the terms and conditions',
      navTitle: 'Terms and Conditions',
      permissionRequired: false
    }
  ],

  properties: [
    {
      name: 'title',
      value: `the Terms and Conditions`
    },
    {
      name: 'checkboxText',
      value: 'I agree to '
    },
    {
      name: 'fileId',
      factory: function() {
        return this.AGREEMENT_FILE;
      }
    },
    {
      name: 'agreement',
      validationPredicates: [
        {
          args: ['agreement'],
          predicateFactory: function(e) {
            return e.EQ(net.nanopay.partner.treviso
              .TrevisoUnlockPaymentTermsAndConditions.AGREEMENT, true);
          },
          errorMessage: 'ACKNOWLEDGE_BRAZIL_TC'
        }
      ]
    }
  ]
});
