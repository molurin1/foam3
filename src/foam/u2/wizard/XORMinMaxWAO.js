/**
 * @license
 * Copyright 2022 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

 foam.CLASS({
  package: 'foam.u2.wizard',
  name: 'XORMinMaxWAO',
  implements: [ 'foam.u2.wizard.WAO' ],
  flags: ['web'],
  extends: 'foam.u2.wizard.ProxyWAO',

  documentation: `
    Currently checks if the direct prerequisite of the wizardlet to match the minMaxCapabilityId string.
    Data of the min max needs to have only 1 element in the FObjectArray hence the XOR.
    Will use the data of the min max to find the prerequisite selected, and load its data.
  `,
  
  properties: [
    {
      class: 'String',
      name: 'minMaxCapabilityId',
    }
  ],

  methods: [
    async function load(wizardlet) {
      if ( wizardlet.loading ) return;

      wizardlet.isLoaded = true; // is this needed

      var prereqMinMaxWizardlet;

      for ( var i = 0; i < wizardlet.prerequisiteWizardlets; i++ ){
        var currentWizardlet = wizardlet.prerequisiteWizardlets[i];

        if ( 
          currentWizardlet.capability && 
          currentWizardlet.capability.id == this.minMaxCapabilityId 
        ){
          prereqMinMaxWizardlet = currentWizardlet;
          break;
        }
      }

      if ( ! prereqMinMaxWizardlet ) {
        console.error(
          `MinMaxCapabilityId: ${this.minMaxCapabilityId} is not a direct prerequisite to ${wizardlet.id}`
        );
        return;
      }

      var minMaxSelectedData = prereqMinMaxWizardlet.data.selectedData;

      if ( minMaxSelectedData.length != 1 ){
        console.error(
          `Cannot apply XOR to MinMaxCapabilityId: ${this.minMaxCapabilityId}`
        );
        return;
      }

      var selectedCapabilityId = minMaxSelectedData[0];

      for ( var i = 0; i < prereqMinMaxWizardlet.prerequisiteWizardlets; i++ ){
        var currentWizardlet = prereqMinMaxWizardlet.prerequisiteWizardlets[i];

        if ( 
          currentWizardlet.capability && 
          currentWizardlet.capability.id == selectedCapabilityId 
        ){
          wizardlet.isLoaded = false; // is this needed
          return currentWizardlet.data;
        }
      }
    }
  ]
});
