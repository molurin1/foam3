/**
 * @license
 * Copyright 2016 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.u2.view',
  name: 'TreeViewRow',
  extends: 'foam.u2.Element',

  requires: [
    'foam.mlang.ExpressionsSingleton',
    'foam.u2.tag.Image'
  ],

  exports: [
    'data'
  ],

  imports: [
    'dblclick?',
    'onObjDrop',
    'returnExpandedCSS?',
    'selection',
    'startExpanded',
    'translationService?'
  ],

  css: `
    ^ {
      white-space: nowrap;
      inset: none;
      cursor: pointer;
      width: 240px;
    }

    ^button:hover {
      background-color: /*%GREY5%*/ #e7eaec;
      color:  /*%PRIMARY1%*/ #406dea;
    }

    ^label-container {
      display: flex;
      align-items: center;
    }

    ^heading {
      min-height: 40px;
      display: flex;
      align-items: center;
      padding: 0 8px;
    }

    ^button.foam-u2-ActionView{
      padding: 8px;
      width: 100%;
    }

    ^select-level {
      display: flex;
      justify-content: space-between;
      overflow: hidden;
      padding-right: 8px;
      text-align: left;
      width: 100%;
    }

    ^select-level > * {
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    ^selected > ^heading > ^button {
      background-color: /*%PRIMARY5%*/ #e5f1fc !important;
      color:  /*%PRIMARY1%*/ #406dea;
    }
    ^toggle-icon {
      align-self: center;
      transition: 0.2s linear;
    }

    ^toggle-icon svg{
      width: 0.75em;
      height: 0.75em;
      fill: inherit;
    }
  `,

  properties: [
    {
      name: 'data'
    },
    {
      name: 'relationship'
    },
    {
      class: 'Boolean',
      name: 'expanded',
      value: false
    },
    {
      class: 'Function',
      name: 'formatter'
    },
    {
      class: 'Boolean',
      name: 'draggable',
      documentation: 'Enable to allow drag&drop editing.'
    },
    {
      class: 'Boolean',
      name: 'hasChildren'
    },
    {
      class: 'Boolean',
      name: 'doesThisIncludeSearch',
      value: false
    },
    'query',
    {
      class: 'Boolean',
      name: 'showThisRootOnSearch'
    },
    {
      class: 'Array',
      name: 'subMenus'
    },
    'showRootOnSearch',
    {
      class: 'Boolean',
      name: 'updateThisRoot',
      value: false
    },
    {
      class: 'Function',
      name: 'onClickAddOn'
    },
    {
      class: 'Int',
      name: 'level'
    },
    {
      class: 'Boolean',
      name: 'selected_',
      expression: function(selection, data$id) {
        if ( selection && foam.util.equals(selection.id, this.data.id) ) {
          return true;
        }
        return false;
      }
    }
  ],

  methods: [
    function render() {
      this.SUPER();
      var self = this;
      var controlledSearchSlot = foam.core.SimpleSlot.create();

      if ( this.query ) {
        this.query.sub(function() {
          self.updateThisRoot = true;
          self.showThisRootOnSearch = false;
          controlledSearchSlot.set(self.query.get());
          self.updateThisRoot = false;
        });
      }

      if ( self.showRootOnSearch )
        self.showRootOnSearch.set(self.showRootOnSearch.get() || self.doesThisIncludeSearch);

      this.data[self.relationship.forwardName].select().then(function(val) {
        self.hasChildren = val.array.length > 0;
        self.subMenus    = val.array;
      });

      var labelString = this.data.label;
      if ( this.translationService ) {
        labelString = self.translationService.getTranslation(foam.locale, self.data.label, self.data.label);
      }
      var mainLabel = this.E().
        addClass(self.myClass('select-level')).
        start()
        //TODO: add tooltip when ellipsis
          .addClass(this.slot(function(selected_) {
            return selected_ ? 'p-semiBold' : 'p';
          }))
          .addClass(self.myClass('label')).
          call(this.formatter, [self.data]).
        end().
        start().
          addClass(self.myClass('toggle-icon')).
          show(this.hasChildren$).
          style({
            'transform':     self.expanded$.map(function(c) { return c ? 'rotate(90deg)': 'rotate(0deg)'; })
          }).
          on('click', this.toggleExpanded).
          tag(this.Image, { glyph: 'next' }).
        end();

      this.
        addClass(this.myClass()).
        show(this.slot(function(hasChildren, showThisRootOnSearch, updateThisRoot) {
          if ( ! self.query ) return true;
          var isThisItemRelatedToSearch = false;
          if ( ! updateThisRoot ) {
            self.doesThisIncludeSearch = self.query.get() ? self.data.label.toLowerCase().includes(self.query.get().toLowerCase()) : true;

            if ( self.query.get() && !self.doesThisIncludeSearch && self.data.keywords ) {
              for ( var i = 0; i < self.data.keywords.length; i++ ) {
                if ( self.data.keywords[i].toLowerCase().includes(self.query.get().toLowerCase()) ) {
                  self.doesThisIncludeSearch = true;
                  break;
                }
              }
            }

            isThisItemRelatedToSearch = self.query.get() ? ( self.doesThisIncludeSearch && ( ! hasChildren || self.data.parent !== '' ) ) || ( hasChildren && showThisRootOnSearch ) : true;
            if ( self.showRootOnSearch )
              self.showRootOnSearch.set(self.showRootOnSearch.get() || isThisItemRelatedToSearch);
          } else {
            isThisItemRelatedToSearch = true;
          }
          if ( ! self.query.get() ) {
            self.expanded = false;
          } else if ( self.query.get() && isThisItemRelatedToSearch ) {
            self.expanded = true;
          }
          return isThisItemRelatedToSearch;
        })).
        enableClass(this.myClass('selected'), this.selected_$).
        on('dblclick', function() { self.dblclick && self.dblclick(self.data); }).
        callIf(this.draggable, function() {
          this.
          attrs({ draggable: 'true' }).
          on('dragstart', this.onDragStart).
          on('dragenter', this.onDragOver).
          on('dragover',  this.onDragOver).
          on('drop',      this.onDrop);
        }).
        start().
          addClass(self.myClass('heading')).
          style({
            'padding-left': ((( self.level - 1) * 16 ) + 8 + 'px')
          }).
          startContext({ data: self }).
            start(self.ON_CLICK_FUNCTIONS, {
              buttonStyle: 'UNSTYLED',
              label: mainLabel,
              ariaLabel: labelString,
              size: 'SMALL',
              themeIcon: self.level === 1 ? self.data.themeIcon : '',
              icon: self.level === 1 ? self.data.icon : ''
            }).
              // make not be a button so that other buttons can be nested              setNodeName('span').
              addClass(this.myClass('button')).
              style({
                'fill': this.slot(function(selected, id) {
                  if ( selected && foam.util.equals(selected.id, id) ) {
                    return self.returnExpandedCSS('/*%PRIMARY3%*/ #604aff');
                  }
                  return self.returnExpandedCSS('/*%GREY2%*/ #9ba1a6');
                }, this.selection$, this.data$.dot('id'))
              }).
            end().
          endContext().
        end().
        start().
          show(this.expanded$).
          add(this.slot(function(subMenus) {
            return this.E().forEach(subMenus/*.dao*/, function(obj) {
              this.add(self.cls_.create({
                data:             obj,
                formatter:        self.formatter,
                relationship:     self.relationship,
                expanded:         true, //self.startExpanded,
                showRootOnSearch: self.showThisRootOnSearch$,
                query:            controlledSearchSlot,
                onClickAddOn:     self.onClickAddOn,
                level:            self.level + 1
              }, self)).addClass('child-menu');
            });
          })).
        end();
    }
  ],

  listeners: [
    function onDragStart(e) {
      e.dataTransfer.setData('application/x-foam-obj-id', this.data.id);
      e.stopPropagation();
    },

    function onDragOver(e) {
      if ( ! e.dataTransfer.types.some(function(m) { return m === 'application/x-foam-obj-id'; }) )
        return;

      var id = e.dataTransfer.getData('application/x-foam-obj-id');

      if ( foam.util.equals(id, this.data.id) )
        return;

      e.preventDefault();
      e.stopPropagation();
    },

    function onDrop(e) {
      if ( ! e.dataTransfer.types.some(function(m) { return m === 'application/x-foam-obj-id'; }) )
        return;

      var id = e.dataTransfer.getData('application/x-foam-obj-id');

      if ( foam.util.equals(id, this.data.id) ) return;

      e.preventDefault();
      e.stopPropagation();

      var self = this;
      var dao  = this.__context__[this.relationship.targetDAOKey];
      dao.find(id).then(function(obj) {
        if ( ! obj ) return null;

        // TODO: We shouldn't have to remove then put,
        // We currently have to because the FLOW editor is not updating properly
        // on a put event for an object that it already has.
        dao.remove(obj).then(function() {
          self.data[self.relationship.forwardName].dao.put(obj).then(function(obj) {
            self.onObjDrop(obj, id);
          });
        });
      });
    },

    function selected(e) {
      this.selection = this.data;
      e.preventDefault();
      e.stopPropagation();
    }
  ],

  actions: [
    {
      name: 'onClickFunctions',
      label: '',
      code: function () {
        if ( this.onClickAddOn )
          this.onClickAddOn(this.data);
        this.toggleExpanded();
      }
    },
    {
      name: 'toggleExpanded',
      label: '',
      code: function() {
        this.expanded  = ! this.expanded;
        this.selection = this.data;
      }
    }
  ]
});


foam.CLASS({
  package: 'foam.u2.view',
  name: 'TreeView',
  extends: 'foam.u2.Element',

  requires: [
    'foam.mlang.ExpressionsSingleton',
    'foam.u2.view.TreeViewRow'
  ],

  imports: [
    'theme'
  ],

  exports: [
    'onObjDrop',
    'selection',
    'startExpanded'
  ],

  css: `
    ^ {
      padding-top: 10px;
      overflow-y: auto;
    }
  `,

  properties: [
    {
      class: 'foam.dao.DAOProperty',
      name: 'data'
    },
    {
      name: 'relationship'
    },
    {
      name: 'selection'
    },
    {
      class: 'Function',
      name: 'formatter'
    },
    {
      class: 'Boolean',
      name: 'startExpanded',
      value: false
    },
    'query',
    {
      class: 'Function',
      name: 'onClickAddOn'
    },
    [ 'defaultRoot', '' ]
  ],

  methods: [
    function render() {
      this.startExpanded = this.startExpanded;

      var M   = this.ExpressionsSingleton.create();
      var of  = this.__context__.lookup(this.relationship.sourceModel);
      var dao = this.data$proxy.where(
        M.EQ(of.getAxiomByName(this.relationship.inverseName), this.defaultRoot));
      var self = this;
      var isFirstSet = false;

      this.addClass().
        select(dao, function(obj) {
          if ( ! isFirstSet && ! self.selection ) {
            self.selection = obj;
            isFirstSet = true;
          }
          return self.TreeViewRow.create({
            data:         obj,
            relationship: self.relationship,
            expanded:     self.startExpanded,
            formatter:    self.formatter,
            query:        self.query,
            onClickAddOn: self.onClickAddOn,
            level:        1
          }, this);
        });
    },

    function onObjDrop(obj, target) {
      // Template Method
    }
  ]
});
