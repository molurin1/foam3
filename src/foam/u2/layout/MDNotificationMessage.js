/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.u2.layout',
  name: 'MDNotificationMessage',
  extends: 'foam.u2.View',

    documentation: `
      A notification message is a UI element to give a user immediate
      feedback. Notification messages are only visible for a few seconds.
    `,

    requires: [
      'foam.log.LogLevel',
      'foam.u2.tag.CircleIndicator'
    ],

    imports: [
      'theme'
    ],

    css: `
      ^ {
        display: flex;
        justify-content: center;
        position: fixed;
        top: 0;
        width: 100vw;
        z-index: 15000;
      }
      ^inner {
        width: 100%;
        height: 5rem;
        max-width: 1024px;
        margin: auto;
        padding: 8px 24px;
        animation-name: fade;
        animation-duration: 5s;
        font-size: 1.4rem;
        line-height: 1.33;
        letter-spacing: 0.2px;
        border-radius: 3px;
        box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.08);
        background: #e2f2dd;
        display: flex;
        justify-content: space-between;
        align-items: center;
      }
      ^banner {
        background-color: #32bf5e;
        height: 4px;
        width: inherit;
        max-width: 1072px;
        margin-left: -24px;
        border-top-left-radius: 3px;
        border-top-right-radius: 3px;
        position: absolute;
        top: 0;
      }
      @keyframes fade {
        0% { opacity: 0; }
        10% { opacity: 1; }
        80% { opacity: 1; }
        100% { opacity: 0; }
      }
      ^status-icon {
        width: 20px;
        height: 20px;
        margin-right: 16px;
        vertical-align: middle;
      }
      ^content {
        display: inline-block;
        vertical-align: middle;
        font-size: 2.5em;
        font-weight: 800;
        color: #19402e;
        letter-spacing: normal;
      }
      ^description {
        font-size: 1.4rem;
        font-weight: normal;
        line-height: 1.43;
        letter-spacing: normal;
        color: #19402e;
        margin-left: 36px;
      }
      ^error-background {
        background: #fff6f6;
      }
      ^warning-background {
        background: #fdf8de;
      }
      ^error-banner {
        background: #d9170e;
      }
      ^warning-banner {
        background: #eedc00;
      }
      ^error-content {
        color: #631414;
      }
      ^warning-content {
        color: #816819;
      }
      ^link-icon {
        display: inline-block;
        margin-top: 2px;
        vertical-align: middle;
        margin-right: 0 !important;
        width: 16px;
        height: 16px;
      }
      ^close-icon {
        background-image: url("images/round-close-icon.svg");
        background-size: 12px 12px;
        cursor:pointer;
        height: 12px;
        opacity: 0.5;
        width: 12px;
        position: absolute;
        top: 18;
      }
      ^close-icon:hover {
        opacity: 1;
      }
    `,

    properties: [
      {
        class: 'String',
        name: 'type'
      },
      'message',
      'description'
    ],

    methods: [

      function render() {
        var self = this;

        var indicator;
        if ( this.type == this.LogLevel.ERROR ) {
          indicator = {
            size: 40,
            backgroundColor: this.theme.destructive3,
            borderColor: this.theme.destructive3,
            icon: this.theme.glyphs.exclamation.getDataUrl({
              fill: this.theme.white
            })
          };
        } else if ( this.type == this.LogLevel.WARN ) {
          indicator = {
            size: 40,
            icon: 'images/baseline-warning-yellow.svg'
          };
        } else {
          indicator = {
            size: 40,
            backgroundColor: this.theme.approval3,
            borderColor: this.theme.approval3,
            icon: this.theme.glyphs.checkmark.getDataUrl({
              fill: this.theme.white
            })
          };
        }
        this
          .addClass(this.myClass())
          .start().addClass(this.myClass('inner'))
            .enableClass(this.myClass('error-background'), this.type == this.LogLevel.ERROR)
            .enableClass(this.myClass('warning-background'), this.type == this.LogLevel.WARN)
            .start('div').addClass(this.myClass('banner'))
              .enableClass(this.myClass('error-banner'), this.type == this.LogLevel.ERROR)
              .enableClass(this.myClass('warning-banner'), this.type == this.LogLevel.WARN)
            .end()
            .start()
              .start(this.CircleIndicator, indicator)
                .addClass(this.myClass('status-icon'))
              .end()
              .start().addClass(this.myClass('content'))
                .enableClass(this.myClass('error-content'), this.type == this.LogLevel.ERROR)
                .enableClass(this.myClass('warning-content'), this.type == this.LogLevel.WARN)
                .callIfElse(foam.String.isInstance(this.message), function() {
                  this.add(self.message);
                  console.log(self.message);
                }, function() {
                  this.tag(self.message);
                  console.log(self.message);
                })
              .end()
              .start().addClass(this.myClass('description'))
                .enableClass(this.myClass('error-content'), this.type == this.LogLevel.ERROR)
                .enableClass(this.myClass('warning-content'), this.type == this.LogLevel.WARN)
                .callIfElse(foam.String.isInstance(this.description), function() {
                  this.add(self.description);
                  console.log(self.description);
                }, function() {
                  this.tag(self.description);
                  console.log(self.description);
                })
              .end()
            .end()
            .startContext({ data: this })
              .start()
                .addClass(this.myClass('link-icon'))
                .start()
                  .addClass(this.myClass('close-icon'))
                  .on('click', () => this.remove())
                .end()
              .end()
            .endContext()
          .end();

        setTimeout(() => {
          this.remove();
        }, 5000);
      }
    ]
  });
