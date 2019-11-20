/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 *     http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.mrac',
  name: 'Message',

  documentation: '',

  properties: [
    {
      class: 'Proxy',
      of: 'foam.nanos.logger.Logger',
      name: 'delegate'
    }
  ]
});
