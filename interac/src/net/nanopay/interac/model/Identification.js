foam.CLASS({
  package: 'net.nanopay.interac.model',
  name: 'Identification',

  documentation: 'User identification method',

  properties: [
    {
      class: 'String',
      name: 'id'
    },
    {
      class: 'Reference',
      name: 'owner',
      of: 'foam.nanos.auth.User'
    },
    {
      class: 'String',
      name: 'type'
    },
    {
      class: 'String',
      name: 'issuer'
    }
  ]
});