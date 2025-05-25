function closemenu(){
    const checkbox = document.getElementById('check');
    if (checkbox.checked) 
    {
        // Checkbox is checked
        console.log('Checked!');
        const menu = document.querySelector('div.nav-mobile');
        if (menu.innerHTML.length > 0){
            checkbox.checked = false;
        }
    } 
}