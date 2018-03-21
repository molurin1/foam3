foam.CLASS({
  package: 'net.nanopay.onboarding.model',
  name: 'Question',

  description: 'Describes a single question as part of a Questionnaire',

  properties: [
    {
      class: 'String',
      name: 'question',
      description: 'Describes the question'
    },
    {
      class: 'String',
      name: 'response',
      description: 'Describes the answer'
    }
  ]
});