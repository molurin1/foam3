/**
 * @license
 * Copyright 2019 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.u2.view',
  name: 'MapView',
  extends: 'foam.u2.View',

  requires: [
    'foam.u2.layout.Cols',
    'foam.u2.layout.Rows'
  ],

  imports: [
    'referencePath?'
  ],

  exports: [
    'as view',
    'mode'
  ],

  css: `
    ^key { flex-grow: 1; flex-basis: 0; }
    ^value { flex-grow: 1; flex-basis: 0; }
    ^ .foam-u2-ActionView-addRow { margin: 0 0 4px 0; }
    ^ .foam-u2-ActionView-remove { margin-left: 6px; padding: 6px 14px; height: 32px;}
    ^ .foam-u2-layout-Cols { padding-bottom: 4px; display: flex; align-items: center;}
  `,

  classes: [
    {
      name: 'KeyValueRow',
      imports: [
        'mode',
        'view'
      ],
      properties: [
        {
          class: 'String',
          name: 'key'
        },
        {
          name: 'value',
          view: 'foam.u2.view.AnyView'
        }
      ],
      actions: [
        {
          name: 'remove',
          isAvailable: function(mode) {
            return mode === foam.u2.DisplayMode.RW;
          },
          code: function() {
            var d2 = foam.Object.shallowClone(this.view.data);
            delete d2[this.key];
            this.view.data = d2;
          }
        }
      ]
    },
    {
      name: 'ErrorRow',
      properties: [
        {
          class: 'String',
          name: 'key'
        },
        {
          class: 'String',
          name: 'value',
          value: '< RECURSION DETECTED >'
        }
      ],
    }
  ],

  methods: [
    function render() {
      var self = this;
      this
        .addClass(this.myClass())
        .add(this.slot(function(data) {
          return self.Rows.create()
            .forEach(Object.entries(data || {}), function([key, value]) {
              let oldKey = key;
              let row    = self.KeyValueRow.create({key, value});

              let recursive = self.referencePath && self.referencePath.conflicts(value);
              if ( recursive ) {
                row.value = self.ErrorRow.create({key});
              } else {
                row.onDetach(row.sub('propertyChange', function() {
                  delete self.data[oldKey];
                  self.data[row.key] = row.value;
                  oldKey = row.key;
                }));
              }
              this
                .startContext({ data: row })
                  .start(self.Cols)
                    .start()
                      .addClass(self.myClass('key'))
                      .add(self.KeyValueRow.KEY)
                    .end()
                    .start()
                      .addClass(self.myClass('value'))
                      .add(self.KeyValueRow.VALUE)
                    .end()
                    .callIf(! recursive, function () {
                      this
                        .tag(self.KeyValueRow.REMOVE, {
                          isDestructive: true
                        })
                    })
                  .end()
                .endContext();
            });
        }))
        .startContext({data: this}).add(this.ADD_ROW).endContext();
    }
  ],

  actions: [
    {
      name: 'addRow',
      label: 'Add',
      isAvailable: function(mode) {
        return mode === foam.u2.DisplayMode.RW;
      },
      code: function() {
        var d2 = foam.Object.shallowClone(this.data);
        d2[Date.now()] = '';
        this.data = d2;
      }
    }
  ]
});
