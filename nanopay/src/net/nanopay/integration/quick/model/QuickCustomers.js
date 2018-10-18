foam.CLASS({
  package:  'net.nanopay.integration.quick.model',
  name:  'QuickCustomers',
  properties:  [
    {
      class:  'FObjectArray',
      of: 'net.nanopay.integration.quick.model.QuickCustomer',
      name:  'Customer'
    },
    {
      class:  'Int',
      name:  'startPosition'
    },
    {
      class:  'Int',
      name:  'maxResults'
    }
  ]
});