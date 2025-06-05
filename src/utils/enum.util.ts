// This file contains utility functions related to enums.
export type EnumObject = { [key: string]: string | number };

// Extracts the type of enum values from the given enum object.
export type EnumTypeFromObject<E extends EnumObject> = E extends {
  [key: string]: infer ET | string;
}
  ? ET
  : never;

export class EnumUtils {
  /**
   * Validates that value belongs to the provided enum.
   * If it doesn't belong to the enum, throws an error.
   *
   * @param enumObject - The enum object to validate against.
   * @param value - The value to validate.
   */
  public static validateValue<TEnum extends EnumObject>(
    enumObject: TEnum,
    value: string,
  ): EnumTypeFromObject<TEnum> {
    if (!this.isValueFromEnum(enumObject, value)) {
      throw new Error(
        `Invalid '${JSON.stringify(enumObject).slice(0, 20)}' value specified: ${value}`,
      );
    }
    return value as EnumTypeFromObject<TEnum>;
  }
  /**
   * Checks if the given string value exists within the keys of the enum object.
   *
   * @param enumObject - The enum object to check against.
   * @param value - The value to search for within the enum object.
   * @returns True if the key exists in the enum object, otherwise false.
   */
  public static isValueFromEnum(enumObject: EnumObject, value: string) {
    return EnumUtils.getEnumValues(enumObject)
      .map((level) => level.toString())
      .includes(value);
  }

  private static getEnumValues<TEnum extends EnumObject>(
    enumObject: TEnum,
  ): EnumTypeFromObject<TEnum>[] {
    return Object.keys(enumObject).map(
      (key) => enumObject[key] as EnumTypeFromObject<TEnum>,
    );
  }
}
