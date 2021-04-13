import * as React from "react";
import {
  AlertDialogOverlay,
  AlertDialogContent,
  AlertDialogHeading,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogBody,
  AlertDialogActions,
} from "./AlertDialog";
import { Button } from "./Button";

export function AlertDialogDelete(props: {
  heading: string;
  text: string;
  buttonProps: React.ComponentProps<typeof Button>;
  toggleDialog: () => void;
}) {
  const { toggleDialog, buttonProps, heading, text } = props;
  const leastDestructiveRef = React.useRef<HTMLButtonElement>(null);
  return (
    <AlertDialogOverlay
      onDismiss={toggleDialog}
      leastDestructiveRef={leastDestructiveRef}
    >
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogHeading>{heading}</AlertDialogHeading>
        </AlertDialogHeader>
        <AlertDialogBody>
          <AlertDialogDescription>{text}</AlertDialogDescription>
        </AlertDialogBody>
        <AlertDialogActions>
          <Button
            ref={leastDestructiveRef}
            type="button"
            onClick={toggleDialog}
            variant="transparentNeutral"
          >
            Cancel
          </Button>
          <Button type="button" variant="danger" {...buttonProps}></Button>
        </AlertDialogActions>
      </AlertDialogContent>
    </AlertDialogOverlay>
  );
}
