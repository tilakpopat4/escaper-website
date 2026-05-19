export function verifyAdmin(request: Request): boolean {
  const password = request.headers.get('x-admin-password');
  const correctPassword = process.env.ADMIN_PASSWORD || "escaperadmin";
  return password === correctPassword;
}
