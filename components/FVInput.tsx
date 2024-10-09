import React, { FC } from "react";
import { HelperText, TextInput, TextInputProps } from "react-native-paper";
import { Control, Controller, FieldErrors, FieldValues } from "react-hook-form";
interface FormInputControllerProps {
  control: Control<FieldValues>;
  errors?: FieldErrors<FieldValues>;
  name: string;
  props?: TextInputProps;
}

const FVInput: FC<FormInputControllerProps> = ({
  control,
  errors,
  name,
  ...props
}) => {
  return (
    <>
      <Controller
        control={control}
        name={name}
        render={({ field: { value, onChange, onBlur } }) => (
          <TextInput
            value={value}
            onChangeText={onChange}
            onBlur={onBlur}
            {...props.props}
          />
        )}
      />

    {errors && errors[name] && <HelperText type="error">{String(errors[name]?.message)}</HelperText>}
    </>
  );
};

export default FVInput;
