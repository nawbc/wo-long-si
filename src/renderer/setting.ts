const eleInputColor = document.querySelector('.font-color') as any;
const eleInputRange = document.querySelector('.bg-opacity') as any;
const eleInputRefresh = document.querySelector('.refresh-interval') as any;
const eleOpacityValue = document.querySelector('.opacity-value') as any;

eleInputRefresh.value = localStorage.getItem('refreshInterval') ?? 10;
eleInputRange.value = localStorage.getItem('bgOpacity') ?? 0.4;
eleInputColor.value = localStorage.getItem('fontColor') ?? '#ffffff';
eleOpacityValue.innerHTML = eleInputRange.value;

eleInputColor.addEventListener('input', (e: any) => { 
  localStorage.setItem('fontColor', e.target.value);
})

eleInputRange.addEventListener('input', (e: any) => { 
  eleOpacityValue.innerHTML = e.target.value;
    localStorage.setItem('bgOpacity', e.target.value);
})

eleInputRefresh.addEventListener('input', (e: any) => { 
  localStorage.setItem('refreshInterval', e.target.value);
})




