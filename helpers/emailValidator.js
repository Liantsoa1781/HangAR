export function emailValidator(email) {
  const re = /\S+@\S+\.\S+/
  if (!email) return "Email ne peut pas etre vide."
  if (!re.test(email)) return 'Ooops! Votre email n est pas valide.'
  return ''
}
