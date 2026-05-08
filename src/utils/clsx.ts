type ClassDictionary = Record<string, boolean | null | undefined>;

type ClassPrimitive = string | false | null | undefined;

type ClassList = ClassInput[];

type ClassInput = ClassPrimitive | ClassDictionary | ClassList;

function toClassName(value: ClassInput): string {
  if (!value) {
    return "";
  }

  if (typeof value === "string") {
    return value;
  }

  if (Array.isArray(value)) {
    return value.map(toClassName).filter(Boolean).join(" ");
  }

  return Object.entries(value)
    .filter(([, isEnabled]) => Boolean(isEnabled))
    .map(([className]) => className)
    .join(" ");
}

export function clsx(...values: ClassInput[]) {
  return values.map(toClassName).filter(Boolean).join(" ");
}
