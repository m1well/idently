export type User = {
  code: string;
  systemRole: string;
  claims: {
    firstName?: string;
    lastName?: string;
    // deno-lint-ignore no-explicit-any
    [key: string]: any; // allows additional properties
  };
};
