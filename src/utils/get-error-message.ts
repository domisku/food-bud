function getErrorMessage(code: string): string {
  const errorMessages = {
    23505: "Įrašas su tokiu pavadinimu jau egzistuoja",
  };

  return errorMessages[code] || "Įvyko klaida";
}

export default getErrorMessage;
