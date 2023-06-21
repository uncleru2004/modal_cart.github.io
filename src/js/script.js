import { displayModal } from "./modal-cart.js";

// центральная зона окна для отрисовки выбранного из слайдера товара
const ITEMS_WRAPPER = document.querySelector(".items-wrapper");
// иконка тележки навигационной панели
const CART = document.querySelector("#open-basket");
//общее количество товаров в иконке тележки навигационной панели
const NUMBER_OF_ITEMS = document.querySelector(".number_of_items");
//общее количество товаров в заголовке модального окна корзины
const QUANTITY = document.querySelector(".quantity");
//общая цена товаров в корзине
const TOTAL_PRICE = document.querySelector(".summary_price");
//скидка на товары в корзине
const DISCOUNT = document.querySelector(".summary_discount");
//итоговая цена товаров в корзине с учетом скидки
const SUMMARY_TOTAL = document.querySelector(".summary_total");


// Отрисовка начальной страницы **НАЧАЛО** //

// функция отрисовки количества товаров в иконке тележки при начальной загрузке
function displayAmountOfMerch() {
  // Получаем данные из хранилища
  let items = getItemsFromStorage();
  
  // Подсчитываем общее количество экземпляров товаров
  let number = items.reduce((a, b) => a + +b.number, 0);
  // Подсчитываем общую цену товаров
  let price = items.reduce((a, b) => a + (+b.number * +b.price), 0);
  
  // Если товары в хранилище есть, то показываем их количество в иконке корзины
  if (number > 0) {
    NUMBER_OF_ITEMS.textContent = number;
    NUMBER_OF_ITEMS.hidden = false;
  }

  // Передаем значения количества товаров и общей стоимости в заголовок модального окна корзины
  TOTAL_PRICE.textContent = price.toFixed(2);
  QUANTITY.textContent = number;
  DISCOUNT.textContent = (price * 0.1).toFixed(2);
  SUMMARY_TOTAL.textContent = (+TOTAL_PRICE.textContent - +DISCOUNT.textContent).toFixed(2);
}


let NUMBER = 0;
// Функция получения списка товаров из json-файла, добавления каждому товару своего id
function fetchData() {
  let info = [];
  fetch("../data.json")
  .then((response) => response.json())
  .then((data) => {
    data.forEach((item) => info.push(item)); // заполняем массив объектами из json-файла

    info.forEach((item) => (item.id = NUMBER++)); // вставляем id для каждого товара

    displaySlider(info); //рисуем карточки с данными в слайдере

    displayItemClicked(info[0]); // рисуем в центральной зоне окна первый товар из списка
  });
};



// Отображение слайдера с товарами ** НАЧАЛО **

// рисуем карточки с данными, полученными из файла data.json, для последующего отображения их в слайдере
function displaySlider(info) {
  info.forEach((item) => {
    const div = document.createElement("div");
    div.classList.add("swiper-slide");

    div.innerHTML = `
        <div data-id="${item.id}" class="main-card">
          <div class="card-image skeleton">
            <img src="${item.imgSrc}" alt="${item.name}">

            <div class="card-wishlist">
              <div class="wishlist-rating">

                <div class="rating-img">
                  <svg width="16" height="16" viewBox="0 0 16 16"    fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path
                    d="M16 6.12414H9.89333L8 0L6.10667 6.12414H0L4.93333 9.90345L3.06667 16L8 12.2207L12.9333 16L11.04 9.87586L16 6.12414Z"
                    fill="#FFCE31"/>
                  </svg>
                </div>

                <span class="rating-amount">4.9</span>
              </div>

              <svg class="whishlist-heart" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
                <path
                  d="m16 28c7-4.733 14-10 14-17 0-1.792-.683-3.583-2.05-4.95-1.367-1.366-3.158-2.05-4.95-2.05-1.791 0-3.583.684-4.949 2.05l-2.051 2.051-2.05-2.051c-1.367-1.366-3.158-2.05-4.95-2.05-1.791 0-3.583.684-4.949 2.05-1.367 1.367-2.051 3.158-2.051 4.95 0 7 7 12.267 14 17z">
                </path>
              </svg>
            </div>
          </div>

          <h3 class="card-title skeleton">${item.name}</h3>

          <p class="card-subtitle skeleton">${item.category}</p>
                
          <p class="price-current skeleton">${item.price}</p>

          <button class="add-btn skeleton">Add to Cart</button>
        </div>
      `;

    document.querySelector(".swiper-wrapper").append(div);
  });

  const allSkeletons = document.querySelectorAll(".skeleton");
  allSkeletons.forEach((element) => {
    element.classList.remove("skeleton");
  });

  eventListenerForSlider(); // обработка "клика" на карточке слайдера

  initSwiper(); // запуск слайдера

  /* skeleton 
  const allSkeletons = document.querySelectorAll(".skeleton");
  console.log(allSkeletons)
  window.addEventListener("load", () => {
    allSkeletons.forEach((element) => {
      element.classList.remove("skeleton");
    });
  });*/
}

/* запускаем слайдер Swiper */
function initSwiper() {
  const swiper = new Swiper(".swiper", {
    slidesPerView: 5,
    spaceBetween: 30,
    scrollbar: {
      el: ".swiper-scrollbar",
      draggable: true,
    },
    navigation: {
      nextEl: ".swiper-button-next",
      prevEl: ".swiper-button-prev",
    },
    // autoplay: {
    //   delay: 2000,
    // }
  });
}

// Добавляем прослушиватель событий для клика на карточке слайдера
// с последующей отрисовкой слайда в центральной зоне окна или добавлением в корзину
function eventListenerForSlider() {
  const slides = document.querySelectorAll(".swiper-slide");
  // добавляем обработчик событий "клика" на каждый конкретный слайд
  slides.forEach((slide) => {
    slide.addEventListener("click", (e) => {
      // получаем все необходимые данные для отрисовки "кликнутого" товара из слайда
      let info = {
        id: e.currentTarget.querySelector(".main-card").getAttribute("data-id"),
        name: e.currentTarget.querySelector(".card-title").textContent,
        category: e.currentTarget.querySelector(".card-subtitle").textContent,
        price: e.currentTarget.querySelector(".price-current").textContent,
        imgSrc:
          e.currentTarget.querySelector(".card-image img").getAttribute(
            "src"
          ),
      };

      // если "клик" по слайду вне кнопки
      if (!e.target.classList.contains("add-btn")) {
        ITEMS_WRAPPER.innerHTML = "";
        displayItemClicked(info); // Отрисовка слайда в центральной зоне окна
      }

      // если клик по кнопке на слайде
      else {
        changeInfo(info); // Изменяем данные в иконке и модальном окне корзины
        addItemsToStorage(info, 1); // Добавление новых данных в хранилище     
      }
    });
  });
}
// Отображение слайдера с товарами ** КОНЕЦ **




// Функция отрисовки слайда в центральной зоне окна
function displayItemClicked(info) {
  info.id = `${info.id}`; // странная проблема: при изначальной отрисовке страницы id первого слайда в центральной зоне окна является цифрой, а не строкой!!! Почему, не ясно. В слайдере он - строка.

  const div = document.createElement("div");
  div.classList.add("item-card");

  div.innerHTML = `
    <div class="item-card-info">
      <h2 class="card-info-title">${info.name}</h2>
      <p class="card-info-price">$ ${info.price}</p>
      <p class="card-info-description">
        The gently curved lines accentuated by sewn details are kind to
        your body and pleasant to look at. Also, there’s a tilt and
        height-adjusting mechanism that’s built to outlast years of ups
        and downs.
      </p>
      <div class="item-card-colors">
        <button class="colors-btn bnt--gray"></button>
        <button class="colors-btn bnt--green"></button>
        <button class="colors-btn bnt--brown"></button>
        <button class="colors-btn bnt--pink"></button>
      </div>
      <div class="card-info-add">
        <button class="add-btn">Add to Cart</button>
      </div>
    </div>

    <div class="item-card-img">
      <img src="${info.imgSrc}" alt="${info.name}"/>
    </div>
      
  `;  
  ITEMS_WRAPPER.append(div); // добавляем каhточку товара в DOM
  
  // обрабатываем нажатие на кнопку "Add to Cart"
  // и передаем карточку товара в модальное окно корзины
  const addButton = document.querySelector(".add-btn");  
  addButton.addEventListener("click", () => {    
    changeInfo(info); // Изменяем данные в иконке и модальном окне корзины
    addItemsToStorage(info, 1); // Добавление новых данных в хранилище
  });  
}
// Отрисовка начальной страницы **КОНЕЦ** //



// Функция изменения данных в иконке и модальном окне корзины
function changeInfo(info) {
// рисуем общее количество товаров в иконке тележки
NUMBER_OF_ITEMS.textContent = +NUMBER_OF_ITEMS.textContent + 1;
NUMBER_OF_ITEMS.hidden = false;

// передаем общее количество товаров в модальное окно
QUANTITY.textContent = NUMBER_OF_ITEMS.textContent;
// передаем общую стоимость товаров в модальное окно
TOTAL_PRICE.textContent = (+TOTAL_PRICE.textContent + +info.price).toFixed(2);
// передаем сумму скидки на товары в модальное окно
DISCOUNT.textContent = (+TOTAL_PRICE.textContent * 0.1).toFixed(2);
// передаем итоговую стоимость товаров с учетом скидки в модальное окно
SUMMARY_TOTAL.textContent = (+TOTAL_PRICE.textContent - +DISCOUNT.textContent).toFixed(2);
};



// Обработка данных в localStorage *НАЧАЛО* //

// Получение уже имеющихся данных из хранилища
export function getItemsFromStorage() {
  let items;
  if (window.localStorage.getItem("items") === null) {
    items = [];
  } else {
    items = JSON.parse(window.localStorage.getItem("items"));
  }
  return items;
}

// Добавление новых данных в хранилище
function addItemsToStorage(info, value) {
  let items = getItemsFromStorage();

  info.number = value; // Записываем в ключ "number" значение количества добавленных товаров, т.е. 1

  // Если такой товар в корзине уже есть, увеличиваем только его количество
  if (items.some((item) => item.id === info.id)) {
    items.forEach((item) => {
      if (item.id === info.id) {
        item.number = +item.number + +info.number;
      }
    });
  } else { // Если товара в корзине еще нет, записываем его данные в объект
    items.push(info);
  }
  // Записываем данные в хранилище
  window.localStorage.setItem("items", JSON.stringify(items));

  console.log(window.localStorage.getItem("items"));
}

// Удаление данных из хранилища
export function removeItemFromStorage(id) {
  let items = getItemsFromStorage();

  // Удаляем данные товара по id из хранилища
  items.forEach((item, index) => {
    if (item.id === id) {
      items.splice(index, 1);
    }
  });

  localStorage.setItem("items", JSON.stringify(items));

  console.log(window.localStorage.getItem("items"));
}

// Обновление данных в хранилище
function saveDataToStorage(data) {
  let items = []; // объявляем пустой массив
  
  // Записываем в пустой массив объекты с данными товаров
  data.forEach(d => {
    let info = {};
    info.id = d.getAttribute("data-id");
    info.imgSrc = d.querySelector("img").getAttribute("src");
    info.name = d.querySelector(".item-descr-name").textContent;
    info.price = d.querySelector("span.price").textContent;
    info.number = d.querySelector("#counter__input").value;

    items.push(info);
  });
  
  window.localStorage.setItem("items", JSON.stringify(items));

  console.log(window.localStorage.getItem("items"));
}
// Обработка данных в localStorage  *КОНЕЦ* //




// Обработка закрытия модального окна корзины и обновление данных в localStorage *НАЧАЛО* //

const modal = document.querySelector("#modal-window");
const cross = document.querySelector(".cross-btn");

// Обработка клика по крестику или вне модального окна для его закрытия
modal.addEventListener("click", (e) => {
  
  if (e.target === e.currentTarget || cross.contains(e.target)) {
    modal.close();
    
    // Убираем у тега <body> класс .scroll-lock для появления скролла в основном окне
    document.body.classList.remove("scroll-lock");
  
    const data = document.querySelectorAll(".list-item");
    saveDataToStorage(data); //обновление данных в localStorage
  }
});
// Обработка закрытия модального окна корзины и обновление данных в localStorage *КОНЕЦ* //




// Обработка нажатия на иконку корзины в панели навигации и вызов модального окна корзины товаров
CART.addEventListener("click", displayModal);

// Запуск получения данных из json-файла с товарами для слайдера при полной загрузке страницы
document.addEventListener("DOMContentLoaded", () => {
  fetchData();
  displayAmountOfMerch();
});
