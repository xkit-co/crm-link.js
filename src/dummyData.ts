export const dummyDeveloperObjects = [
  {
    id: 341238,
    slug: 'person',
    label: 'Person',
    description:
      'Acme associates Persons with Contacts or Users in your CRM so that gifts and thank you cards can be sent to them.',
    fields: [
      {
        slug: 'name',
        type: 'string',
        label: 'Name',
        description: 'Full name of the person'
      },
      {
        slug: 'email',
        type: 'string',
        label: 'Email',
        description:
          "Along with the gift, we'll mail a thank you note to the recipient's email address"
      },
      {
        slug: 'address',
        type: 'string',
        label: 'Address',
        description: "This is where we'll deliver the gift"
      }
    ],
    events: [
      {
        slug: 'person_updated',
        type: 'update',
        label: 'Person Updated',
        description: 'Occurs when relevant properties of a Person change',
        payloadFields: [
          {
            slug: 'name',
            type: 'string',
            label: 'Name',
            description: 'Updated full name of the person'
          },
          {
            slug: 'address',
            type: 'string',
            label: 'Address',
            description: 'Updated mailing address of the person'
          },
          {
            slug: 'updated_at',
            type: 'string',
            format: 'datetime',
            label: 'Person Last Update Time',
            description:
              'ISO 8601 Date/Time of the last update made to the Person'
          }
        ]
      },
      {
        slug: 'person_created',
        type: 'create',
        label: 'Person Created',
        description: 'Occurs when new Person object is created',
        payloadFields: [
          {
            slug: 'name',
            type: 'string',
            label: 'Name',
            description: 'Full name of the person created'
          },
          {
            slug: 'email',
            type: 'string',
            label: 'Email',
            description: 'Email address of the person created'
          },
          {
            slug: 'address',
            type: 'string',
            label: 'Address',
            description: 'Mailing address of the person created'
          }
        ]
      }
    ]
  }
]

const selectors = [
  {
    children: [
      {
        children: [
          {
            children: [
              {
                input_types: [
                  {
                    input_type: {
                      format: null,
                      type: 'string'
                    },
                    transformations: ['direct']
                  }
                ],
                label: 'criteria',
                label_pattern: null,
                nullable: false,
                pointer:
                  '#/definitions/Review/properties/criterias/items/properties/criteria',
                source_relation_id: 102,
                type_label: 'string'
              },
              {
                input_types: [
                  {
                    input_type: {
                      format: null,
                      type: 'integer'
                    },
                    transformations: ['direct']
                  },
                  {
                    input_type: {
                      format: null,
                      type: 'number'
                    },
                    transformations: ['direct']
                  },
                  {
                    input_type: {
                      format: 'datetime',
                      type: 'string'
                    },
                    transformations: ['date']
                  },
                  {
                    input_type: {
                      format: null,
                      type: 'string'
                    },
                    transformations: ['direct', 'date']
                  }
                ],
                label: 'rating',
                label_pattern: null,
                nullable: true,
                pointer:
                  '#/definitions/Review/properties/criterias/items/properties/rating',
                source_relation_id: 102,
                type_label: 'integer'
              }
            ],
            input_types: [
              {
                input_type: {
                  format: null,
                  type: 'object'
                },
                transformations: ['direct']
              }
            ],
            label: 'Criteria',
            label_pattern: null,
            nullable: false,
            pointer: '#/definitions/Review/properties/criterias/items',
            source_relation_id: 102,
            type_label: 'object'
          }
        ],
        input_types: [
          {
            input_type: {
              format: 'object',
              type: 'array'
            },
            transformations: ['find', 'direct', 'collect']
          },
          {
            input_type: {
              format: 'string',
              type: 'array'
            },
            transformations: ['collect']
          },
          {
            input_type: {
              format: null,
              type: 'array'
            },
            transformations: ['find', 'direct', 'collect']
          },
          {
            input_type: {
              format: null,
              type: 'object'
            },
            transformations: ['find']
          },
          {
            input_type: {
              format: null,
              type: 'string'
            },
            transformations: ['find']
          }
        ],
        label: 'criterias',
        label_pattern: null,
        nullable: false,
        pointer: '#/definitions/Review/properties/criterias',
        source_relation_id: 102,
        type_label: 'array'
      },
      {
        input_types: [
          {
            input_type: {
              format: 'datetime',
              type: 'string'
            },
            transformations: ['date']
          },
          {
            input_type: {
              format: null,
              type: 'string'
            },
            transformations: ['direct', 'date']
          }
        ],
        label: 'date',
        label_pattern: null,
        nullable: false,
        pointer: '#/definitions/Review/properties/date',
        source_relation_id: 102,
        type_label: 'string'
      },
      {
        input_types: [
          {
            input_type: {
              format: null,
              type: 'string'
            },
            transformations: ['direct']
          }
        ],
        label: 'id',
        label_pattern: null,
        nullable: false,
        pointer: '#/definitions/Review/properties/id',
        source_relation_id: 102,
        type_label: 'string'
      },
      {
        input_types: [
          {
            input_type: {
              format: 'datetime',
              type: 'string'
            },
            transformations: ['date']
          },
          {
            input_type: {
              format: null,
              type: 'string'
            },
            transformations: ['direct', 'date']
          }
        ],
        label: 'replyDate',
        label_pattern: null,
        nullable: true,
        pointer: '#/definitions/Review/properties/replyDate',
        source_relation_id: 102,
        type_label: 'string'
      },
      {
        input_types: [
          {
            input_type: {
              format: null,
              type: 'string'
            },
            transformations: ['direct']
          }
        ],
        label: 'replyText',
        label_pattern: null,
        nullable: true,
        pointer: '#/definitions/Review/properties/replyText',
        source_relation_id: 102,
        type_label: 'string'
      },
      {
        input_types: [
          {
            input_type: {
              format: null,
              type: 'integer'
            },
            transformations: ['direct']
          },
          {
            input_type: {
              format: null,
              type: 'number'
            },
            transformations: ['direct']
          },
          {
            input_type: {
              format: 'datetime',
              type: 'string'
            },
            transformations: ['date']
          },
          {
            input_type: {
              format: null,
              type: 'string'
            },
            transformations: ['direct', 'date']
          }
        ],
        label: 'score',
        label_pattern: null,
        nullable: false,
        pointer: '#/definitions/Review/properties/score',
        source_relation_id: 102,
        type_label: 'integer'
      },
      {
        input_types: [
          {
            input_type: {
              format: null,
              type: 'string'
            },
            transformations: ['direct']
          }
        ],
        label: 'text',
        label_pattern: null,
        nullable: true,
        pointer: '#/definitions/Review/properties/text',
        source_relation_id: 102,
        type_label: 'string'
      },
      {
        input_types: [
          {
            input_type: {
              format: null,
              type: 'integer'
            },
            transformations: ['direct']
          },
          {
            input_type: {
              format: null,
              type: 'number'
            },
            transformations: ['direct']
          },
          {
            input_type: {
              format: 'datetime',
              type: 'string'
            },
            transformations: ['date']
          },
          {
            input_type: {
              format: null,
              type: 'string'
            },
            transformations: ['direct', 'date']
          }
        ],
        label: 'thumbsUp',
        label_pattern: null,
        nullable: false,
        pointer: '#/definitions/Review/properties/thumbsUp',
        source_relation_id: 102,
        type_label: 'integer'
      },
      {
        input_types: [
          {
            input_type: {
              format: null,
              type: 'string'
            },
            transformations: ['direct']
          }
        ],
        label: 'url',
        label_pattern: null,
        nullable: false,
        pointer: '#/definitions/Review/properties/url',
        source_relation_id: 102,
        type_label: 'string'
      },
      {
        input_types: [
          {
            input_type: {
              format: null,
              type: 'string'
            },
            transformations: ['direct']
          }
        ],
        label: 'userImage',
        label_pattern: null,
        nullable: false,
        pointer: '#/definitions/Review/properties/userImage',
        source_relation_id: 102,
        type_label: 'string'
      },
      {
        input_types: [
          {
            input_type: {
              format: null,
              type: 'string'
            },
            transformations: ['direct']
          }
        ],
        label: 'userName',
        label_pattern: null,
        nullable: false,
        pointer: '#/definitions/Review/properties/userName',
        source_relation_id: 102,
        type_label: 'string'
      },
      {
        input_types: [
          {
            input_type: {
              format: null,
              type: 'string'
            },
            transformations: ['direct']
          }
        ],
        label: 'version',
        label_pattern: null,
        nullable: true,
        pointer: '#/definitions/Review/properties/version',
        source_relation_id: 102,
        type_label: 'string'
      }
    ],
    input_types: [
      {
        input_type: {
          format: null,
          type: 'object'
        },
        transformations: ['direct']
      }
    ],
    label: 'Review',
    label_pattern: null,
    nullable: false,
    pointer: '#/definitions/Review',
    source_relation_id: 102,
    type_label: 'object'
  }
]

export const dummyUserObjects = [
  {
    id: 95,
    slug: 'account',
    label_one: 'Account',
    label_many: 'Accounts',
    selectors: selectors
  },
  {
    id: 96,
    slug: 'asset',
    label_one: 'Asset',
    label_many: 'Assets',
    selectors: selectors
  },
  {
    id: 97,
    slug: 'calendar',
    label_one: 'Calendar',
    label_many: 'Calendars',
    selectors: selectors
  },
  {
    id: 98,
    slug: 'campaign',
    label_one: 'Campaign',
    label_many: 'Campaigns',
    selectors: selectors
  },
  {
    id: 99,
    slug: 'contact',
    label_one: 'Contact',
    label_many: 'Contacts',
    selectors: selectors
  },
  {
    id: 105,
    slug: 'department',
    label_one: 'Department',
    label_many: 'Departments',
    selectors: selectors
  },
  {
    id: 100,
    slug: 'invoice',
    label_one: 'Invoice',
    label_many: 'Invoices',
    selectors: selectors
  },
  {
    id: 101,
    slug: 'lead',
    label_one: 'Lead',
    label_many: 'Leads',
    selectors: selectors
  },
  {
    id: 102,
    slug: 'user',
    label_one: 'User',
    label_many: 'Users',
    selectors: selectors
  },
  {
    id: 103,
    slug: 'warehouse',
    label_one: 'Warehouse',
    label_many: 'Warehouses',
    selectors: selectors
  }
]
