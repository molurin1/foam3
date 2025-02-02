foam.CLASS({
  package: 'foam.nanos.crunch.example',
  name: 'ExampleData',

  requires: [
    'foam.nanos.auth.Phone'
  ],
  
  properties: [
    {
      name: 'phoneNumber',
      class: 'FObjectProperty',
      of: 'foam.nanos.auth.Phone',
      documentation: 'Example phone number.',
      factory: function() {
        return this.Phone.create();
      },
      view: { class: 'foam.u2.detail.VerticalDetailView' }
    }
  ]

});