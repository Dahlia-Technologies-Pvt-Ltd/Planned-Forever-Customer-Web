export const getPermissionNames = (permissions) => {
  if (!Array.isArray(permissions)) return [];

  return permissions
    .map((permission) => {
      if (typeof permission === "string") return permission;
      return permission?.name;
    })
    .filter(Boolean);
};

export const hasPermission = (userData, permissionName) => {
  if (userData?.role === "superAdmin") return true;
  if (["super_admin", "admin", "web_admin"].includes(userData?.role?.name)) return true;
  if (userData?.role?.display_name === "web_admin") return true;

  const userPermissions = getPermissionNames(userData?.role?.permissions);
  if (userPermissions.includes(permissionName)) return true;

  const writePermission = permissionName.match(/^(.*)-(create|delete)$/);
  if (writePermission) {
    return userPermissions.includes(`${writePermission[1]}-edit`);
  }

  return false;
};

export const hasAnyPermission = (userData, permissionNames = []) => {
  if (userData?.role === "superAdmin") return true;
  if (["super_admin", "admin", "web_admin"].includes(userData?.role?.name)) return true;
  if (userData?.role?.display_name === "web_admin") return true;

  const userPermissions = getPermissionNames(userData?.role?.permissions);
  return permissionNames.some((permissionName) => userPermissions.includes(permissionName));
};
