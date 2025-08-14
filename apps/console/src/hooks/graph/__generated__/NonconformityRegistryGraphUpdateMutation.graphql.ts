/**
 * @generated SignedSource<<19732d1bd6a2a118a8e813058693bad0>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type NonconformityRegistryStatus = "CLOSED" | "IN_PROGRESS" | "OPEN";
export type UpdateNonconformityRegistryInput = {
  auditId?: string | null | undefined;
  correctiveAction?: string | null | undefined;
  dateIdentified?: any | null | undefined;
  description?: string | null | undefined;
  dueDate?: any | null | undefined;
  effectivenessCheck?: string | null | undefined;
  id: string;
  ownerId?: string | null | undefined;
  referenceId?: string | null | undefined;
  rootCause?: string | null | undefined;
  status?: NonconformityRegistryStatus | null | undefined;
};
export type NonconformityRegistryGraphUpdateMutation$variables = {
  input: UpdateNonconformityRegistryInput;
};
export type NonconformityRegistryGraphUpdateMutation$data = {
  readonly updateNonconformityRegistry: {
    readonly nonconformityRegistry: {
      readonly audit: {
        readonly framework: {
          readonly id: string;
          readonly name: string;
        };
        readonly id: string;
      };
      readonly correctiveAction: string | null | undefined;
      readonly dateIdentified: any | null | undefined;
      readonly description: string | null | undefined;
      readonly dueDate: any | null | undefined;
      readonly effectivenessCheck: string | null | undefined;
      readonly id: string;
      readonly owner: {
        readonly fullName: string;
        readonly id: string;
      };
      readonly referenceId: string;
      readonly rootCause: string;
      readonly status: NonconformityRegistryStatus;
      readonly updatedAt: any;
    };
  };
};
export type NonconformityRegistryGraphUpdateMutation = {
  response: NonconformityRegistryGraphUpdateMutation$data;
  variables: NonconformityRegistryGraphUpdateMutation$variables;
};

const node: ConcreteRequest = (function(){
var v0 = [
  {
    "defaultValue": null,
    "kind": "LocalArgument",
    "name": "input"
  }
],
v1 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "id",
  "storageKey": null
},
v2 = [
  {
    "alias": null,
    "args": [
      {
        "kind": "Variable",
        "name": "input",
        "variableName": "input"
      }
    ],
    "concreteType": "UpdateNonconformityRegistryPayload",
    "kind": "LinkedField",
    "name": "updateNonconformityRegistry",
    "plural": false,
    "selections": [
      {
        "alias": null,
        "args": null,
        "concreteType": "NonconformityRegistry",
        "kind": "LinkedField",
        "name": "nonconformityRegistry",
        "plural": false,
        "selections": [
          (v1/*: any*/),
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "referenceId",
            "storageKey": null
          },
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "description",
            "storageKey": null
          },
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "dateIdentified",
            "storageKey": null
          },
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "rootCause",
            "storageKey": null
          },
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "correctiveAction",
            "storageKey": null
          },
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "dueDate",
            "storageKey": null
          },
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "status",
            "storageKey": null
          },
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "effectivenessCheck",
            "storageKey": null
          },
          {
            "alias": null,
            "args": null,
            "concreteType": "People",
            "kind": "LinkedField",
            "name": "owner",
            "plural": false,
            "selections": [
              (v1/*: any*/),
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
          {
            "alias": null,
            "args": null,
            "concreteType": "Audit",
            "kind": "LinkedField",
            "name": "audit",
            "plural": false,
            "selections": [
              (v1/*: any*/),
              {
                "alias": null,
                "args": null,
                "concreteType": "Framework",
                "kind": "LinkedField",
                "name": "framework",
                "plural": false,
                "selections": [
                  (v1/*: any*/),
                  {
                    "alias": null,
                    "args": null,
                    "kind": "ScalarField",
                    "name": "name",
                    "storageKey": null
                  }
                ],
                "storageKey": null
              }
            ],
            "storageKey": null
          },
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "updatedAt",
            "storageKey": null
          }
        ],
        "storageKey": null
      }
    ],
    "storageKey": null
  }
];
return {
  "fragment": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Fragment",
    "metadata": null,
    "name": "NonconformityRegistryGraphUpdateMutation",
    "selections": (v2/*: any*/),
    "type": "Mutation",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Operation",
    "name": "NonconformityRegistryGraphUpdateMutation",
    "selections": (v2/*: any*/)
  },
  "params": {
    "cacheID": "a76545f5642f914e8e8206160e1d8839",
    "id": null,
    "metadata": {},
    "name": "NonconformityRegistryGraphUpdateMutation",
    "operationKind": "mutation",
    "text": "mutation NonconformityRegistryGraphUpdateMutation(\n  $input: UpdateNonconformityRegistryInput!\n) {\n  updateNonconformityRegistry(input: $input) {\n    nonconformityRegistry {\n      id\n      referenceId\n      description\n      dateIdentified\n      rootCause\n      correctiveAction\n      dueDate\n      status\n      effectivenessCheck\n      owner {\n        id\n        fullName\n      }\n      audit {\n        id\n        framework {\n          id\n          name\n        }\n      }\n      updatedAt\n    }\n  }\n}\n"
  }
};
})();

(node as any).hash = "456b4f3b6f36c0b518bd3eb870e0d2c5";

export default node;
