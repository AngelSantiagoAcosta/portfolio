//this will handle the tabbing logic.

const tabs = document.querySelectorAll(".tabs li")
const tabcontent = document.querySelectorAll("#tab-content > div")
var swiper = new Swiper(".mySwiper", {
    navigation: {
      nextEl: ".swiper-button-next",
      prevEl: ".swiper-button-prev",
    },
  });
tabs.forEach((tab) =>{
    console.log(tab)
    tab.addEventListener('click', () =>{
        tabs.forEach((item) =>{
            item.classList.remove('is-active');
            var spans = item.querySelectorAll("span")
            spans.forEach((item)=> item.classList.remove('custom_bright_blue'));
        });

        var spans = tab.querySelectorAll("span")
        spans.forEach((item)=> item.classList.add('custom_bright_blue'));
        tab.classList.add('is-active','custom_bright_blue');

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

