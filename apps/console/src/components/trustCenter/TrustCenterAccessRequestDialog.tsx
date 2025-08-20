import { useState } from "react";
import {
  Dialog,
  DialogFooter,
  DialogContent,
  Button,
  Field,
  useToast,
  useDialogRef,
} from "@probo/ui";
import { useTranslate } from "@probo/i18n";
import { sprintf } from "@probo/helpers";
import { useFormWithSchema } from "/hooks/useFormWithSchema";
import { z } from "zod";
import { buildEndpoint } from "/providers/RelayProviders";

// Manual mutation for trust API (not processed by relay compiler)
const createTrustCenterAccessMutation = {
  params: {
    name: "CreateTrustCenterAccessMutation",
    operationKind: "mutation",
    text: `
      mutation CreateTrustCenterAccessMutation(
        $input: CreateTrustCenterAccessInput!
      ) {
        createTrustCenterAccess(input: $input) {
          trustCenterAccess {
            id
            email
            name
          }
        }
      }
    `
  }
};

type CreateTrustCenterAccessResponse = {
  data?: {
    createTrustCenterAccess?: {
      trustCenterAccess: {
        id: string;
        email: string;
        name: string;
      };
    };
  };
  errors?: Array<{ message: string }>;
};

type Props = {
  trigger: React.ReactNode;
  trustCenterId: string;
  organizationName: string;
};

export function TrustCenterAccessRequestDialog({
  trigger,
  trustCenterId,
  organizationName
}: Props) {
  const { __ } = useTranslate();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const dialogRef = useDialogRef();

  const schema = z.object({
    name: z.string().min(1, __("Name is required")).min(2, __("Name must be at least 2 characters long")),
    email: z.string().min(1, __("Email is required")).email(__("Please enter a valid email address")),
  });

  const { register, handleSubmit, formState, reset } = useFormWithSchema(schema, {
    defaultValues: { name: "", email: "" },
  });

  const onSubmit = handleSubmit(async (data) => {
    setIsSubmitting(true);

    try {
      const response = await fetch(buildEndpoint("/api/trust/v1/graphql"), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          operationName: createTrustCenterAccessMutation.params.name,
          query: createTrustCenterAccessMutation.params.text,
          variables: {
            input: {
              trustCenterId,
              email: data.email,
              name: data.name
            }
          },
        }),
      });

      const result: CreateTrustCenterAccessResponse = await response.json();

      if (result.errors) {
        throw new Error(result.errors[0].message);
      }

      if (result.data?.createTrustCenterAccess) {
        toast({
          title: __("Request Submitted"),
          description: __("Your access request has been submitted. You will receive an email if your request is approved."),
          variant: "success",
        });

        reset();
        dialogRef.current?.close();
      }
    } catch (error) {
      const errorMessage = error instanceof Error
        ? error.message
        : __("An error occurred while submitting your request.");

      toast({
        title: __("Request Failed"),
        description: errorMessage,
        variant: "error",
      });
    } finally {
      setIsSubmitting(false);
    }
  });

  return (
    <Dialog
      ref={dialogRef}
      trigger={trigger}
      title={__("Request Access")}
    >
      <form onSubmit={onSubmit}>
        <DialogContent padded className="space-y-4">
          <div className="text-sm text-txt-secondary">
            {sprintf(__("Request access to %s's Trust Center. Your request will be reviewed and you will receive an email notification with access instructions if approved."), organizationName)}
          </div>

          <Field
            label={__("Your Name")}
            required
            error={formState.errors.name?.message}
            {...register("name")}
            placeholder={__("Enter your full name")}
            disabled={isSubmitting}
          />

          <Field
            label={__("Email Address")}
            required
            type="email"
            error={formState.errors.email?.message}
            {...register("email")}
            placeholder={__("Enter your email address")}
            disabled={isSubmitting}
          />
        </DialogContent>

        <DialogFooter>
          <Button
            type="submit"
            disabled={isSubmitting}
          >
            {isSubmitting ? __("Submitting...") : __("Submit Request")}
          </Button>
        </DialogFooter>
      </form>
    </Dialog>
  );
}
