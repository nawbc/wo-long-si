const eleInputColor = document.querySelector('.font-color') as HTMLElement;
const eleInputRange = document.querySelector('.bg-opacity') as HTMLElement;


eleInputColor.addEventListener('input', (e) => { 
  console.log(e)
})

eleInputRange.addEventListener('change', (e) => { 
  console.log(e);
})
