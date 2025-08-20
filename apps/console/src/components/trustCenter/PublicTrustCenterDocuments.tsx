import {
  Card,
  Tr,
  Td,
  Table,
  Thead,
  Tbody,
  Th,
  DocumentTypeBadge,
  Button,
  IconArrowDown,
  IconLock,
  useToast,
} from "@probo/ui";
import { useTranslate } from "@probo/i18n";
import { buildEndpoint } from "/providers/RelayProviders";
import { TrustCenterAccessRequestDialog } from "./TrustCenterAccessRequestDialog";

const exportDocumentPDFMutation = {
  params: {
    name: "PublicTrustCenterDocumentsExportPDFMutation",
    operationKind: "mutation",
    text: `
      mutation PublicTrustCenterDocumentsExportPDFMutation(
        $input: ExportDocumentPDFInput!
      ) {
        exportDocumentPDF(input: $input) {
          data
        }
      }
    `
  }
};

type Document = {
  id: string;
  title: string;
  documentType: string;
};

type Props = {
  documents: Document[];
  isAuthenticated: boolean;
  trustCenterId: string;
  organizationName: string;
};

type ExportDocumentPDFResponse = {
  data?: {
    exportDocumentPDF?: {
      data: string;
    };
  };
  errors?: Array<{ message: string }>;
};

export function PublicTrustCenterDocuments({
  documents,
  isAuthenticated,
  trustCenterId,
  organizationName
}: Props) {
  const { __ } = useTranslate();
  const { toast } = useToast();

  const handleDownload = async (document: Document) => {
    try {
      const response = await fetch(buildEndpoint("/api/trust/v1/graphql"), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          operationName: exportDocumentPDFMutation.params.name,
          query: exportDocumentPDFMutation.params.text,
          variables: { input: { documentId: document.id } },
        }),
      });

      const result: ExportDocumentPDFResponse = await response.json();

      if (result.errors) {
        throw new Error(result.errors[0].message);
      }

      if (result.data?.exportDocumentPDF?.data) {
        const link = window.document.createElement("a");
        link.href = result.data.exportDocumentPDF.data;
        link.download = `${document.title}.pdf`;
        window.document.body.appendChild(link);
        link.click();
        window.document.body.removeChild(link);
      }
    } catch (error) {
      toast({
        title: __("Download Failed"),
        description: __("Unable to download the document. Please try again."),
        variant: "error",
      });
    }
  };

  if (documents.length === 0) {
    return (
      <Card padded>
        <div className="text-center py-8">
          <h2 className="text-xl font-semibold text-txt-primary mb-2">
            {__("Documents")}
          </h2>
          <p className="text-txt-secondary">
            {__("No documents are currently available.")}
          </p>
        </div>
      </Card>
    );
  }

  return (
    <Card padded className="space-y-4">
      <div>
        <h2 className="text-xl font-semibold text-txt-primary">
          {__("Documents")}
        </h2>
        <p className="text-sm text-txt-secondary mt-1">
          {__("Security and compliance documentation")}
        </p>
      </div>

      <Table>
        <Thead>
          <Tr>
            <Th className="w-1/2">{__("Document")}</Th>
            <Th className="w-1/4">{__("Type")}</Th>
            <Th className="w-1/4">{__("Download")}</Th>
          </Tr>
        </Thead>
        <Tbody>
          {documents.map((document) => {
            return (
              <Tr key={document.id}>
                <Td>
                  <div className="font-medium">
                    {document.title}
                  </div>
                </Td>
                <Td>
                  <DocumentTypeBadge type={document.documentType} />
                </Td>
                <Td>
                  {!isAuthenticated ? (
                    <TrustCenterAccessRequestDialog
                      trigger={
                        <Button
                          variant="secondary"
                          icon={IconLock}
                        >
                          {__("Request Access")}
                        </Button>
                      }
                      trustCenterId={trustCenterId}
                      organizationName={organizationName}
                    />
                  ) : (
                    <Button
                      variant="secondary"
                      icon={IconArrowDown}
                      onClick={() => handleDownload(document)}
                    >
                      {__("Download")}
                    </Button>
                  )}
                </Td>
              </Tr>
            );
          })}
        </Tbody>
      </Table>
    </Card>
  );
}
