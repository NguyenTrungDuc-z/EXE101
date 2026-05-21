export function generateCode(prefix: string) {
  const timestamp = Date.now().toString().slice(-6);
  const random = Math.floor(Math.random() * 900 + 100);
  return `${prefix}-${timestamp}${random}`;
}
