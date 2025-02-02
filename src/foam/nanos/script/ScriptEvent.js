/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.script',
  name: 'ScriptEvent',

  documenation: `Captures the running of a Script.  The associate DAO is not clustered, but the event carries the hostname of the instance it ran on to distinguish when DAOs from many instances are collected by the NOC for example.`,

  implements: [
    'foam.nanos.medusa.Clusterable'
  ],

  tableColumns: [
    'scriptType',
    'owner',
    'lastRun',
    'lastDuration',
    'lastStatus',
    'hostname'
  ],

  properties: [
    {
      name: 'id',
      class: 'String',
      visibility: 'RO'
    },
    {
      docementation: `Set on event creation to the class name of the Script - Script, Cron, Test, for example.`,
      name: 'scriptType',
      label: 'Type',
      class: 'String',
      visibility: 'RO',
      tableWidth: 100,
    },
    {
      documentation: `Copy of the Relationship owner id.  Since the owner Reference can come from multiple DAOs (script, cron, test), the Reference Id doesn't show in Detail View. Could change owner to Reference but using a Relationship provides the Relationship table. See Relationship javaPostSet.`,
      name: 'scriptId',
      class: 'String',
      visibility: 'RO',
      storageTransient: true
    },
    {
      class: 'DateTime',
      name: 'lastRun',
      documentation: 'Date and time the script ran last.',
      visibility: 'RO',
      tableWidth: 140
    },
    {
      class: 'Duration',
      name: 'lastDuration',
      documentation: 'Date and time the script took to complete.',
      visibility: 'RO',
      tableWidth: 125
    },
    {
      class: 'foam.core.Enum',
      of: 'foam.nanos.script.ScriptStatus',
      name: 'lastStatus',
      documentation: 'The last status that the script had before its completion.',
      visibility: 'RO',
      value: 'UNSCHEDULED'
    },
    {
      class: 'String',
      name: 'output',
      visibility: 'RO',
      view: {
        class: 'foam.u2.view.ModeAltView',
        readView: { class: 'foam.u2.view.PreView' }
      }
    },
    {
      documentation: 'Instance script ran on',
      name: 'hostname',
      class: 'String',
      javaFactory: 'return System.getProperty("hostname", "localhost");'
    },
    {
      documentation: 'A non-clusterable script can run on all instances, and any run info will be stored locally',
      name: 'clusterable',
      class: 'Boolean',
      value: true,
      includeInDigest: false
    }
  ]
});
