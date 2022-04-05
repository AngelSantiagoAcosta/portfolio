//this will handle the tabbing logic.

const tabs = document.querySelectorAll(".tabs li")
const tabcontent = document.querySelectorAll("#tab-content > div")

tabs.forEach((tab) =>{
    console.log(tab)
    tab.addEventListener('click', () =>{
        tabs.forEach((item)=> item.classList.remove('is-active'));
        tab.classList.add('is-active');

        const target= tab.dataset.target;
        // console.log(target)
        tabcontent.forEach(box=>{
            if (box.getAttribute('id') === target){
                box.classList.remove('is-hidden');

            } else{
                box.classList.add('is-hidden')
            }
        })

    })
})

