"use strict";

window.addEventListener('DOMContentLoaded', () => {

    //tabs

    const tabContent = document.querySelectorAll('.tabcontent'),
        tabheaderItem = document.querySelectorAll('.tabheader__item'),
        tabheaderItemParent = document.querySelector('.tabheader__items');


    tabheaderItemParent.addEventListener('click', (ev) => {
        const target = ev.target;

        tabheaderItem.forEach((item, i) => {
            if (target && target == item) {

                hideTabContent(i);
                showTabItemActive(i);
            }
        });
    });



    hideTabContent();
    showTabItemActive();


    function hideTabContent(i = 0) {
        tabContent.forEach((el) => {
            el.classList.add('hide');
            el.classList.remove('show');
            el.classList.remove('anim');

        });

        tabContent[i].classList.add('show');
        tabContent[i].classList.add('anim');
        tabContent[i].classList.remove('hide');

    }

    function showTabItemActive(i = 0) {
        tabheaderItem.forEach(el => {
            el.classList.remove('tabheader__item_active');
        });
        tabheaderItem[i].classList.add('tabheader__item_active');
    }

    //Timer

    const deadline = '2020-11-27';

    setTime('.timer', deadline);


    function getRemainingTime(endtime) {
        const t = Date.parse(endtime) - Date.parse(new Date()),
            days = Math.floor(t / (24 * 60 * 60 * 1000)),
            hrs = Math.floor(t / (60 * 60 * 1000) % 24),
            mins = Math.floor(t / (60 * 1000) % 60),
            secs = Math.floor(t / (1000) % 60);

        return {
            t,
            days,
            hrs,
            mins,
            secs,
        };
    }

    function getZero(arg) {
        return (arg < 10) ? `0${arg}` : arg;
    }

    function setTime(select, deadline) {



        const timer = document.querySelector(select),
            days = timer.querySelector('#days'),
            hours = timer.querySelector('#hours'),
            mins = timer.querySelector('#minutes'),
            secs = timer.querySelector('#seconds'),
            refresher = setInterval(updateTime, 1000);
        updateTime();

        function updateTime() {
            const time = getRemainingTime(deadline);

            days.textContent = getZero(time.days);
            hours.textContent = getZero(time.hrs);
            mins.textContent = getZero(time.mins);
            secs.textContent = getZero(time.secs);

            if (time.t <= 0) {

                days.textContent = 0;
                hours.textContent = 0;
                mins.textContent = 0;
                secs.textContent = 0;

                clearInterval(refresher);
            }
        }

    }

    //  modal

    const btnConnect = document.querySelectorAll('[data-modal]'),
        modal = document.querySelector('.modal');

    btnConnect.forEach(el => {
        el.addEventListener('click', openModal);
    });


    modal.addEventListener('click', ev => {
        if (ev.target.classList.contains('modal') || ev.target.getAttribute('data-close') == '') { 
            // ev.target === modal is better
            closeModal();
        }
    });

    document.addEventListener('keydown', ev => {
        if (ev.code === 'Escape' && modal.classList.contains('show')) { // ev.code === "Escape" better
            closeModal();
        }
    });

    const modalTimer = setTimeout(openModal, 5000000);

    function openModal() {
        modal.classList.add('show');
        modal.classList.remove('hide');
        document.body.style.overflow = 'hidden';
        clearInterval(modalTimer);
        window.removeEventListener('scroll', showModalOnScroll);

    }

    function closeModal() {
        modal.classList.remove('show');
        modal.classList.add('hide');
        document.body.style.overflow = '';
    }

    function showModalOnScroll() {
        if (window.pageYOffset + document.documentElement.clientHeight >= document.body.scrollHeight) {
            openModal();
            window.removeEventListener('scroll', showModalOnScroll);
        }
    }

    window.addEventListener('scroll', showModalOnScroll);

    // menu class

    class MenuItem {
        constructor(imgSrc, alt, headMenu, text, cost, parentSelector) {
            this.imgSrc = imgSrc;
            this.alt = alt;
            this.headMenu = headMenu;
            this.text = text;
            this.cost = cost;
            this.parentElement = document.querySelector(parentSelector);

        }

        render() {
            const elem = document.createElement('div');

            elem.innerHTML =
                `<div class="menu__item">
                <img src=${this.imgSrc} alt=${this.alt}>
                <h3 class="menu__item-subtitle">${this.headMenu}</h3>
                    <div class="menu__item-descr">
                        ${this.text}
                    </div>
                    <div class="menu__item-divider"></div>
                    <div class="menu__item-price">
                    <div class="menu__item-cost">Цена:</div>
                    <div class="menu__item-total"><span>${this.cost}</span> грн/день</div>
                </div>
            </div>`;

            this.parentElement.append(elem);
        }

    }

    // menu 

    fetch('http://localhost:3000/menu')
        .then(data => data.json())
        .then(data => {

            for (let i = 0; i < data.length; i++) {
                const {
                    img,
                    altimg,
                    title,
                    descr,
                    price
                } = data[i];

                new MenuItem(img, altimg, title, descr, changeToUA(price), '.menu__field .container').render();
            }

        });



    //form


    const formAll = document.querySelectorAll('form'),
        message = {
            loading: '/icons/spinner.svg',
            success: 'Спасибо! Скоро мы с вами свяжемся',
            failure: 'Что-то пошло не так...',
        };


    formAll.forEach(e => {
        bindPostData(e);
    });

    const postData = async (url, data) => {
        const res = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-type': 'application/json',
            },
            body: data,
        });

        return await res.json();
    };


    function bindPostData(form) {


        form.addEventListener('submit', (ev) => {
            ev.preventDefault();

            const statusMessage = document.createElement('img');
            statusMessage.src = message.loading;
            statusMessage.style.cssText = `
                display: block;
                margin: 0 auto;
            `;

            form.insertAdjacentElement('afterend', statusMessage);

            const dataForm = new FormData(form);

            const obj = {};

            dataForm.forEach(function (el, key) {
                obj[key] = el;
            });


            postData('http://localhost:3000/requests', JSON.stringify(obj))
                .then(data => data.text())
                .then(data => {
                    console.log(data);

                    showThanksModal(message.success);

                    statusMessage.remove();
                })
                .catch(() => {
                    showThanksModal(message.failure);
                })
                .finally(() => {
                    form.reset();
                });

        });
    }

    function showThanksModal(message) {
        const prevModalDialog = document.querySelector('.modal__dialog');

        prevModalDialog.classList.add('hide');

        openModal();

        const thanksModal = document.createElement('div');
        thanksModal.classList.add('.modal__dialog');
        thanksModal.innerHTML = `
        <div class="modal__content">
            <div class="modal__close" data-close>×</div>
            <div class="modal__title">${message}</div>
        </div>
        `;

        document.querySelector('.modal').append(thanksModal);

        setTimeout(() => {

            thanksModal.remove();

            prevModalDialog.classList.add('show');
            prevModalDialog.classList.remove('hide');

            closeModal();

        }, 4000);
    }


    // slider


    const slideImgs = document.querySelectorAll('.offer__slide'),
        slideBtnPrev = document.querySelector('.offer__slider-prev'),
        slideBtnNext = document.querySelector('.offer__slider-next'),
        slidesWrapper = document.querySelector('.offer__slider-wrapper'),
        slidesField = document.querySelector('.offer__slider-inner'),
        width = window.getComputedStyle(slidesWrapper).width,
        total = document.querySelector('#total');

    total.textContent = getZero(slideImgs.length);

    let currentSlideIndex = 1;
    let offset = 0;
    let current = document.querySelector('#current');
    current.textContent = getZero(currentSlideIndex);


    slidesField.style.width= 100 * slideImgs.length + '%';
    slidesField.style.display = 'flex';
    slidesField.style.transition = '0.5s';

    slidesWrapper.style.overflow = 'hidden';

    slideImgs.forEach(slide =>{
        slide.style.width = width;
    });

    slideBtnNext.addEventListener('click',()=>{

        if (offset == +width.slice(0,width.length-2) * (slideImgs.length - 1)) {
            offset = 0;

            currentSlideIndex = 1;

            current.textContent = getZero(currentSlideIndex);

        } else {
            ++currentSlideIndex;
            
            current.textContent = getZero(currentSlideIndex);

            offset += +width.slice(0,width.length-2);
        }

        slidesField.style.transform = `translateX(-${offset}px)`;

    });

    slideBtnPrev.addEventListener('click',()=>{

        if (offset == 0) {
            
            offset = +width.slice(0,width.length-2) * (slideImgs.length - 1);
        
            currentSlideIndex = slideImgs.length;

            current.textContent = getZero(currentSlideIndex);

        } else {
            --currentSlideIndex;

            current.textContent = getZero(currentSlideIndex);

            offset -= +width.slice(0,width.length-2);
        }

        slidesField.style.transform = `translateX(-${offset}px)`;

    });


    function changeToUA(price) {
        return Math.floor(price * 28.19);
    }


});