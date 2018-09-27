/**
 * @license
 * Copyright 2018 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'net.nanopay.integration.xero',
  name: 'ClientSignInService',

  implements: [
    'net.nanopay.integration.xero.SignInService',
  ],

  requires: [
    'foam.box.SessionClientBox',
    'foam.box.HTTPBox'
  ],

  properties: [
    {
      class: 'String',
      name: 'serviceName'
    },
    {
      class: 'Stub',
      of: 'net.nanopay.integration.xero.SignInService',
      name: 'delegate',
      factory: function () {
        return this.SessionClientBox.create({delegate:this.HTTPBox.create({
          method: 'POST',
          url: this.serviceName
        })});
      },
      swiftFactory: `
return SessionClientBox_create(["delegate": HTTPBox_create([
  "method": "POST",
  "url": serviceName
])])
      `
    }
  ]
});
