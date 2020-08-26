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
  package: 'net.nanopay.crunch.document',
  name: 'Document',

  documentation: `
    the file document that a business or user capabilities required
  `,

  messages: [
    { name: 'UPLOAD_REQUEST_MSG', message: 'Please upload a document for ' }
  ],

  sections: [
    {
      name: 'documentUploadSection',
      title: function(capability) {
        return `${this.UPLOAD_REQUEST_MSG} ${capability.name}`;
      },
      help: function(capability) {
        return capability.description ? capability.description : capability.name;
      }
    }
  ],

  properties: [
    {
      class: 'Reference',
      of: 'foam.nanos.fs.File',
      name: 'document',
      section: 'documentUploadSection'
    },
    {
      class: 'FObjectProperty',
      of: 'foam.nanos.crunch.Capability',
      name: 'capability',
      storageTransient: true,
      hidden: true
    }
  ]
});
