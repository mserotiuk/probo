/**
 * @generated SignedSource<<a3f34af85b45563725a110a4e6b6cbfb>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type ComplianceRegistryStatus = "CLOSED" | "IN_PROGRESS" | "OPEN";
export type CreateComplianceRegistryInput = {
  actionsToBeImplemented?: string | null | undefined;
  area?: string | null | undefined;
  auditId: string;
  dueDate?: any | null | undefined;
  lastReviewDate?: any | null | undefined;
  organizationId: string;
  ownerId: string;
  referenceId: string;
  regulator?: string | null | undefined;
  requirement?: string | null | undefined;
  source?: string | null | undefined;
  status: ComplianceRegistryStatus;
};
export type ComplianceRegistryGraphCreateMutation$variables = {
  connections: ReadonlyArray<string>;
  input: CreateComplianceRegistryInput;
};
export type ComplianceRegistryGraphCreateMutation$data = {
  readonly createComplianceRegistry: {
    readonly complianceRegistryEdge: {
      readonly node: {
        readonly actionsToBeImplemented: string | null | undefined;
        readonly area: string | null | undefined;
        readonly audit: {
          readonly framework: {
            readonly name: string;
          };
          readonly id: string;
          readonly name: string | null | undefined;
        };
        readonly createdAt: any;
        readonly dueDate: any | null | undefined;
        readonly id: string;
        readonly lastReviewDate: any | null | undefined;
        readonly owner: {
          readonly fullName: string;
          readonly id: string;
        };
        readonly referenceId: string;
        readonly regulator: string | null | undefined;
        readonly requirement: string | null | undefined;
        readonly source: string | null | undefined;
        readonly status: ComplianceRegistryStatus;
      };
    };
  };
};
export type ComplianceRegistryGraphCreateMutation = {
  response: ComplianceRegistryGraphCreateMutation$data;
  variables: ComplianceRegistryGraphCreateMutation$variables;
};

const node: ConcreteRequest = (function(){
var v0 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "connections"
},
v1 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "input"
},
v2 = [
  {
    "kind": "Variable",
    "name": "input",
    "variableName": "input"
  }
],
v3 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "id",
  "storageKey": null
},
v4 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "referenceId",
  "storageKey": null
},
v5 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "area",
  "storageKey": null
},
v6 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "source",
  "storageKey": null
},
v7 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "requirement",
  "storageKey": null
},
v8 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "actionsToBeImplemented",
  "storageKey": null
},
v9 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "regulator",
  "storageKey": null
},
v10 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "lastReviewDate",
  "storageKey": null
},
v11 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "dueDate",
  "storageKey": null
},
v12 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "status",
  "storageKey": null
},
v13 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "name",
  "storageKey": null
},
v14 = {
  "alias": null,
  "args": null,
  "concreteType": "People",
  "kind": "LinkedField",
  "name": "owner",
  "plural": false,
  "selections": [
    (v3/*: any*/),
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "fullName",
      "storageKey": null
    }
  ],
  "storageKey": null
},
v15 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "createdAt",
  "storageKey": null
};
return {
  "fragment": {
    "argumentDefinitions": [
      (v0/*: any*/),
      (v1/*: any*/)
    ],
    "kind": "Fragment",
    "metadata": null,
    "name": "ComplianceRegistryGraphCreateMutation",
    "selections": [
      {
        "alias": null,
        "args": (v2/*: any*/),
        "concreteType": "CreateComplianceRegistryPayload",
        "kind": "LinkedField",
        "name": "createComplianceRegistry",
        "plural": false,
        "selections": [
          {
            "alias": null,
            "args": null,
            "concreteType": "ComplianceRegistryEdge",
            "kind": "LinkedField",
            "name": "complianceRegistryEdge",
            "plural": false,
            "selections": [
              {
                "alias": null,
                "args": null,
                "concreteType": "ComplianceRegistry",
                "kind": "LinkedField",
                "name": "node",
                "plural": false,
                "selections": [
                  (v3/*: any*/),
                  (v4/*: any*/),
                  (v5/*: any*/),
                  (v6/*: any*/),
                  (v7/*: any*/),
                  (v8/*: any*/),
                  (v9/*: any*/),
                  (v10/*: any*/),
                  (v11/*: any*/),
                  (v12/*: any*/),
                  {
                    "alias": null,
                    "args": null,
                    "concreteType": "Audit",
                    "kind": "LinkedField",
                    "name": "audit",
                    "plural": false,
                    "selections": [
                      (v3/*: any*/),
                      (v13/*: any*/),
                      {
                        "alias": null,
                        "args": null,
                        "concreteType": "Framework",
                        "kind": "LinkedField",
                        "name": "framework",
                        "plural": false,
                        "selections": [
                          (v13/*: any*/)
                        ],
                        "storageKey": null
                      }
                    ],
                    "storageKey": null
                  },
                  (v14/*: any*/),
                  (v15/*: any*/)
                ],
                "storageKey": null
              }
            ],
            "storageKey": null
          }
        ],
        "storageKey": null
      }
    ],
    "type": "Mutation",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": [
      (v1/*: any*/),
      (v0/*: any*/)
    ],
    "kind": "Operation",
    "name": "ComplianceRegistryGraphCreateMutation",
    "selections": [
      {
        "alias": null,
        "args": (v2/*: any*/),
        "concreteType": "CreateComplianceRegistryPayload",
        "kind": "LinkedField",
        "name": "createComplianceRegistry",
        "plural": false,
        "selections": [
          {
            "alias": null,
            "args": null,
            "concreteType": "ComplianceRegistryEdge",
            "kind": "LinkedField",
            "name": "complianceRegistryEdge",
            "plural": false,
            "selections": [
              {
                "alias": null,
                "args": null,
                "concreteType": "ComplianceRegistry",
                "kind": "LinkedField",
                "name": "node",
                "plural": false,
                "selections": [
                  (v3/*: any*/),
                  (v4/*: any*/),
                  (v5/*: any*/),
                  (v6/*: any*/),
                  (v7/*: any*/),
                  (v8/*: any*/),
                  (v9/*: any*/),
                  (v10/*: any*/),
                  (v11/*: any*/),
                  (v12/*: any*/),
                  {
                    "alias": null,
                    "args": null,
                    "concreteType": "Audit",
                    "kind": "LinkedField",
                    "name": "audit",
                    "plural": false,
                    "selections": [
                      (v3/*: any*/),
                      (v13/*: any*/),
                      {
                        "alias": null,
                        "args": null,
                        "concreteType": "Framework",
                        "kind": "LinkedField",
                        "name": "framework",
                        "plural": false,
                        "selections": [
                          (v13/*: any*/),
                          (v3/*: any*/)
                        ],
                        "storageKey": null
                      }
                    ],
                    "storageKey": null
                  },
                  (v14/*: any*/),
                  (v15/*: any*/)
                ],
                "storageKey": null
              }
            ],
            "storageKey": null
          },
          {
            "alias": null,
            "args": null,
            "filters": null,
            "handle": "prependEdge",
            "key": "",
            "kind": "LinkedHandle",
            "name": "complianceRegistryEdge",
            "handleArgs": [
              {
                "kind": "Variable",
                "name": "connections",
                "variableName": "connections"
              }
            ]
          }
        ],
        "storageKey": null
      }
    ]
  },
  "params": {
    "cacheID": "68c793eb099ce3e917992b3f8c22d551",
    "id": null,
    "metadata": {},
    "name": "ComplianceRegistryGraphCreateMutation",
    "operationKind": "mutation",
    "text": "mutation ComplianceRegistryGraphCreateMutation(\n  $input: CreateComplianceRegistryInput!\n) {\n  createComplianceRegistry(input: $input) {\n    complianceRegistryEdge {\n      node {\n        id\n        referenceId\n        area\n        source\n        requirement\n        actionsToBeImplemented\n        regulator\n        lastReviewDate\n        dueDate\n        status\n        audit {\n          id\n          name\n          framework {\n            name\n            id\n          }\n        }\n        owner {\n          id\n          fullName\n        }\n        createdAt\n      }\n    }\n  }\n}\n"
  }
};
})();

(node as any).hash = "50e1966d2f9cc1ed347a77f8f024125c";

export default node;
