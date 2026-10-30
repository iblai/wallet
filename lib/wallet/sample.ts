/**
 * Whether the signed-in user sees the bundled sample wallet instead of their
 * own: `main`, the community organization, is their only organization and they
 * do not administer it. What they saved on `main` stays in their record.
 */
export function isSampleWallet(
  org: string,
  tenants: ReadonlyArray<{ key: string; is_admin?: boolean | null }>,
  main: string,
): boolean {
  return (
    !!main &&
    org === main &&
    tenants.length === 1 &&
    tenants[0].key === main &&
    !tenants[0].is_admin
  );
}
