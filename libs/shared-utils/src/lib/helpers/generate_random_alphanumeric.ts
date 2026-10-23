 
async function generateRandomAlphanumeric(max_digits: number) {
  console.log('Generating random alphanumeric string1111111111');
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
  
    for (let i = 0; i < max_digits; i++) {
      const randomIndex = Math.floor(Math.random() * characters.length);
      result += characters.charAt(randomIndex);
    }
  
    return result;
}

export {
    generateRandomAlphanumeric
}