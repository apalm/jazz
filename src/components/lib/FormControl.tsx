import { FormControlLayout } from "./FormControlLayout";
import { FormControlLayoutColumns } from "./FormControlLayoutColumns";

export type TSharedProps = {
  variant?: "filled" | "outline";
  // `size` exists on React.ComponentProps<"input">
  siz?: "sm" | "xs";
};

export type TLayoutKind = "column" | undefined;

// TODO - when layoutkind=column, id, label are supposed to
// be required, but TS currently doesn't error if not provided
export type TFormControlProps = TSharedProps &
  (
    | ({ layoutKind: "column"; id: string; label: string } & Omit<
        React.ComponentProps<typeof FormControlLayoutColumns>,
        "formControl"
      >)
    | ({ layoutKind?: void } & Omit<
        React.ComponentProps<typeof FormControlLayout>,
        "formControl"
      >)
  );

export const defaultVariant: TSharedProps["variant"] = "outline";
