export function getName(userLogin: string): Promise<string | Error> {
  return fetch(`https://api.github.com/users/${userLogin}`)
    .then(async (response) => {
      if (!response.ok) {
        throw new Error(`Erro: ${response.status} ${response.statusText}`);
      }
      const data = await response.json();
      return data.name;
    })
    .catch((error) => {
      return error;
    });
}
