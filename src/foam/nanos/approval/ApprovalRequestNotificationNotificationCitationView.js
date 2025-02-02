/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.approval',
  name: 'ApprovalRequestNotificationNotificationCitationView',
  extends: 'foam.nanos.notification.NotificationCitationView',

  requires: [
    'foam.comics.DAOUpdateControllerView',
    'foam.u2.stack.StackBlock'
  ],

  imports: [
    'DAO approvalRequestDAO',
    'DAO userDAO',
    'stack'
  ],

  exports: [
    'as data',
    'approvalRequestDAO as dao'
  ],

  properties: [
    'classification',
    {
      name: 'showClassification',
      class: 'Boolean',
      value: false
    },
    'monogram',
    'userSummary',
    {
      name: 'status',
      class: 'Enum',
      of: 'foam.nanos.approval.ApprovalStatus'
    },
    {
      name: 'hideStatus',
      class: 'Boolean',
      value: false
    },
  ],

  actions: [
    {
      name: 'viewMore',
      code: function() {
        this.stack.push(this.StackBlock.create({ view: { class: 'foam.comics.DAOUpdateControllerView', key: this.data.approvalRequest }, parent: this }));
      }
    }
  ],

  methods: [
    function render() {
      //this.SUPER();
      this.description = this.data.body;
      if ( this.description !== '' && this.description.length > 70 ) {
        this.description = this.description.substr(0, 70-1) + '...';
      }

      this
        .addClass(this.myClass())
        .startContext({ mode: foam.u2.DisplayMode.RO, controllerMode: foam.u2.ControllerMode.VIEW })
          .start()
            // .start().addClass('monogram')
            //   .add(this.monogram)
            // .end()
            .start().addClass('userSummaryDiv')
              .start().addClass('userSummary')
                .add(this.userSummary$)
              .end()
              .start().addClass('created')
                .add(this.created$)
              .end()
            .end()
            .start().addClass('classification')
              .show(this.showClassification$).add(this.classification$)
            .end()
            .start().addClass('description')
              .add(this.description$)
            .end()
            .start().addClass('status')
              .hide(this.hideStatus$)
              .add(this.STATUS)
            .end()
            // TODO: Enable when memento support and ability to jump to detail view
            // .start().addClass('viewMore')
            //   .add(this.VIEW_MORE)
            // .end()
          .end()
        .endContext();

      var self = this;
      this.approvalRequestDAO.find(this.data.approvalRequest).then(function(approval) {
        if ( approval ) {
          self.created = approval.created.toUTCString();
          self.classification = approval.classification;
          self.showClassification = !! self.classification;
          self.status = approval.status;

          self.userDAO.find(approval.createdBy).then(function(user) {
            self.userSummary = user.toSummary();
            // self.monogram = user.monogram;
          });
        } else {
          self.created = self.data.created.toUTCString();
          self.showClassification = false;
          self.hideStatus = true;
        }
      });
    }
  ],

  css: `
    ^ {
      line-height: 17px;
      width: 100%;
    }
    ^ .userSummary {
      font-size: 1.4rem;
      font-weight: 600;
      color: #1e1f21;
      margin-left: 16px;
    }
    ^ .created {
      font-size: 1.1rem;
      color: #5e6061;
      margin-left: 16px;
    }
    ^ .classification {
      padding-left: 8px;
      padding-right: 8px;
      min-width: 84px;
      height: 20px;
      border-radius: 3px;
      box-shadow: 0 2px 4px 0 rgba(0, 0, 0, 0);
      background-color: #e7eaec;
      color: #5e6061;
      text-align: center;
      line-height: 20px;
      font-size: 1.2rem;
      margin-left: 32px;
      display: inline-block;
    }
    ^ .description {
      font-size: 1.4rem;
      color: #1e1f21;
      margin-left: 32px;
      display: inline-block;
    }
    ^ .status {
      width: 94px;
      height: 20px;
      line-height: 20px;
      border-radius: 3px;
      box-shadow: 0 2px 4px 0 rgba(0, 0, 0, 0);
      font-size: 1.2rem;
      text-align: center;
      float: right;
      margin-right: 145px;
      margin-top: 14px;
    }
    ^ .userSummaryDiv {
      position: relative;
      top: 8;
      display: inline-block;
     }
  `
});
