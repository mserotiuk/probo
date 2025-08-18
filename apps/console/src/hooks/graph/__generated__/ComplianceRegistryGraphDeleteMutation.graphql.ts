/**
 * @generated SignedSource<<0d815d748a76df90cc5305fa28913125>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type DeleteComplianceRegistryInput = {
  complianceRegistryId: string;
};
export type ComplianceRegistryGraphDeleteMutation$variables = {
  connections: ReadonlyArray<string>;
  input: DeleteComplianceRegistryInput;
};
export type ComplianceRegistryGraphDeleteMutation$data = {
  readonly deleteComplianceRegistry: {
    readonly deletedComplianceRegistryId: string;
  };
};
export type ComplianceRegistryGraphDeleteMutation = {
  response: ComplianceRegistryGraphDeleteMutation$data;
  variables: ComplianceRegistryGraphDeleteMutation$variables;
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
  "name": "deletedComplianceRegistryId",
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
    "name": "ComplianceRegistryGraphDeleteMutation",
    "selections": [
      {
        "alias": null,
        "args": (v2/*: any*/),
        "concreteType": "DeleteComplianceRegistryPayload",
        "kind": "LinkedField",
        "name": "deleteComplianceRegistry",
        "plural": false,
        "selections": [
          (v3/*: any*/)
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
    "name": "ComplianceRegistryGraphDeleteMutation",
    "selections": [
      {
        "alias": null,
        "args": (v2/*: any*/),
        "concreteType": "DeleteComplianceRegistryPayload",
        "kind": "LinkedField",
        "name": "deleteComplianceRegistry",
        "plural": false,
        "selections": [
          (v3/*: any*/),
          {
            "alias": null,
            "args": null,
            "filters": null,
            "handle": "deleteEdge",
            "key": "",
            "kind": "ScalarHandle",
            "name": "deletedComplianceRegistryId",
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
    "cacheID": "4ee4b9ffa6ea477c93a0ba80b8295a44",
    "id": null,
    "metadata": {},
    "name": "ComplianceRegistryGraphDeleteMutation",
    "operationKind": "mutation",
    "text": "mutation ComplianceRegistryGraphDeleteMutation(\n  $input: DeleteComplianceRegistryInput!\n) {\n  deleteComplianceRegistry(input: $input) {\n    deletedComplianceRegistryId\n  }\n}\n"
  }
};
})();

(node as any).hash = "c979ce19185e3d4c20c8a952b5245993";

export default node;
