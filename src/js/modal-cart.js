import { getItemsFromStorage } from "./script.js";
import { removeItemFromStorage } from "./script.js";

// получаем доступ к значениям общего количества товаров в корзине и на иконке основной страницы
const NUMBER_OF_ITEMS = document.querySelector(".number_of_items");
const QUANTITY = document.querySelector(".quantity");
const TOTAL_PRICE = document.querySelector(".summary_price");
const DISCOUNT = document.querySelector(".summary_discount");
//итоговая цена товаров в корзине с учетом скидки
const SUMMARY_TOTAL = document.querySelector(".summary_total");


// функция отображения модального окна и отрисовки корзины товаров
export function displayModal() {
  //const overlay = document.querySelector("#overlay-modal");
  const modal = document.querySelector("#modal-window");
  modal.showModal();
  
  // Добавляем тегу <body> класс .scroll-lock для скрытия переполнения и скролла в основном окне
  document.body.classList.add("scroll-lock");

  renderItem(); //рисуем карточку товара в модальном окне корзины

  // Получаем доступ ко всем счетчикам в корзине. Активируем кнопку "Уменьшить" в счетчиках товаров
  const basketModalList = document.querySelector(".basket-modal-list");
  const counters = basketModalList.querySelectorAll(".counter");
  counters.forEach(counter => {
    if (counter.querySelector("#counter__input").value > 1) {
      counter.querySelector(".counter__btn--down").disabled = false;
    }
  });
}



// Функция отрисовки карточки товара в модальном окне корзины
function renderItem() {
  const basketModalList = document.querySelector(".basket-modal-list");
  basketModalList.innerHTML = "";
  
  // Получаем данные из localStorage
  const items = getItemsFromStorage();

  // Отрисовываем карточки товаров
  items.forEach((itemInfo) => {
    const div = document.createElement("div");
    div.classList.add("cart__card");

    div.innerHTML = `
    <li class="list-item" data-id="${itemInfo.id}">
      <img src="${itemInfo.imgSrc}" alt="${itemInfo.name}" class="list-item-img"/>
      <div class="list-item-descr">
        <div class="item-descr-info__info">
          <span class="item-descr-name">${itemInfo.name}</span>
          
        </div>
        <p class="item-descr-color"><span>Color</span>Gunnared biege</p>
        <div class="card-wrapper card-info-add">
          
          <div class="counter">
            <label class="counter__field">
              <input id="counter__input" type="text" value="1" maxlength="3" readonly>
              <span class="counter__text">шт</span>
            </label>
            <div class="counter__btns">
              <button class="counter__btn counter__btn--up"   aria-label="Увеличить количество">
                <svg xmlns="http://www.w3.org/2000/svg" width="8" height="5" viewBox="0 0 8 5">
                  <g>
                    <g>
                      <path d="M3.904-.035L-.003 3.151 1.02 5.03l2.988-2.387 2.988 2.387 1.022-1.88-3.89-3.186z"></path>
                    </g>
                  </g>
                </svg>
              </button>
              <button disabled class="counter__btn  counter__btn--down" aria-label="Уменьшить количество">
                <svg xmlns="http://www.w3.org/2000/svg" width="8" height="5" viewBox="0 0 8 5">
                  <g>
                    <g>
                      <path d="M3.904 5.003L-.003 1.818 1.02-.062l2.988 2.386L6.995-.063l1.022 1.88-3.89 3.186z"></path>
                    </g>
                  </g>
                </svg>
              </button>
            </div>
          </div>        
          <button class="item-descr-delete">Remove
            <svg class="modal__cross" xmlns="http://www.w3.org/2000/svg"  viewBox="0 0 24 24">
              <path
              d="M23.954 21.03l-9.184-9.095 9.092-9.174-2.832-2.807-9.09 9.179-9.176-9.088-2.81 2.81 9.186 9.105-9.095 9.184 2.81 2.81 9.112-9.192 9.18 9.1z" />
            </svg>
          </button>     
        </div>  
      </div>

      <span class="price">${itemInfo.price}</span>
    </li>
    `;

    basketModalList.append(div);

    // Получаем доступ к элементам каждой конкретной карточки по ее id и добавляем прослушивание событий для работы с товарами    
    const itemCart = basketModalList.querySelector(
      `[data-id="${itemInfo.id}"]`
    );    
    addEventListenersForCartItems(itemCart, itemInfo.number);
  });
}



// Функция прослушивания событий для изменения количества товаров, удаления товаров
function addEventListenersForCartItems(itemInCart, number) {
  
  const COUNTER_CART = itemInCart.querySelector("#counter__input");
  const minus = itemInCart.querySelector(".counter__btn--down");
  const plus = itemInCart.querySelector(".counter__btn--up");
  const remove = itemInCart.querySelector(".item-descr-delete");
  
  // Передаем в счетчик каждого товара их количество из localStorage
  COUNTER_CART.value = number;

  // Добавляем прослушивание событий уменьшения/увеличения количества товаров в корзине по клику на "+ / -"
  minus.addEventListener("click", () => {    

    if (COUNTER_CART.value > 2) {
      COUNTER_CART.value--;

      // Изменяем общее количество товаров в заголовке корзины и иконке, полную и итоговую стоимости
      changeValues();
    
    } else if (COUNTER_CART.value == 2) {
      COUNTER_CART.value--;
      minus.disabled = true; // деактивируем кнопку "Уменьшить" на счетчике
      
      // Изменяем общее количество товаров в заголовке корзины и иконке, полную и итоговую стоимости
      changeValues();
    }
  });

  plus.addEventListener("click", () => {
        
    COUNTER_CART.value++;
    minus.disabled = false;// активируем кнопку "Уменьшить" на счетчике
    
    // Изменяем общее количество товаров в заголовке корзины и иконке, полную и итоговую стоимости
    changeValues();
  });

  /* добавляем прослушивание событий уменьшения/увеличения количества товаров при изменении вручную с клавиатуры
  COUNTER_CART.addEventListener("input", () => {
    let regex = "0123456789";
    let inputValue = COUNTER_CART.value
      .split("")
      .map((item) => (!regex.includes(item) ? "" : item))
      .join("");

    COUNTER_CART.value = inputValue;

    /*if (COUNTER_CART.value >= 1) {
      QUANTITY.textContent = changeValues();
      NUMBER_OF_ITEMS.textContent = changeValues();
    } else {
      
    }
  });*/

  // удаление товаров из корзины при нажатии на кнопку удаления
  remove.addEventListener("click", (event) => {
        
    let parentEl = event.target.closest("li");

    // Удаляем из DOM узловой элемент карточки товара
    parentEl.remove();
    
    // Изменяем общее количество товаров в заголовке корзины и иконке, полную и итоговую стоимости
    changeValues();

    // Если в корзине ничего нет, нуль в иконке не отображается
    if (NUMBER_OF_ITEMS.textContent === "0") {
      NUMBER_OF_ITEMS.hidden = true;
    }

    // Удаляем товар из localStorage
    const id = event.target.closest("li").getAttribute("data-id");
    removeItemFromStorage(id);
  });
}



// функция подсчета общего количества товаров в корзине и общей стоимости и изменения этих значений в модальном окне корзины
function changeValues() {
  const basketModalList = document.querySelector(".basket-modal-list");
  const quantities = basketModalList.querySelectorAll("#counter__input");
  const cartItems = basketModalList.querySelectorAll(".list-item");

  // Подсчет общей стоимости
  let cost = [];
  cartItems.forEach((item) => {
    const price = item.querySelector(".price");
    const amount = item.querySelector("#counter__input");

    cost.push(+price.textContent * +amount.value);    
  });
  cost = cost.reduce((a, b) => a + +b, 0).toFixed(2);

  // Подсчет общего количества товаров в корзине
  let amount = [];
  quantities.forEach((quantity) => amount.push(quantity.value));
  amount = amount.reduce((a, b) => a + +b, 0);
  
  // Изменяем общее количество товаров в заголовке корзины и иконке, полную и итоговую стоимости
  QUANTITY.textContent = NUMBER_OF_ITEMS.textContent = amount;
  TOTAL_PRICE.textContent = cost;
  DISCOUNT.textContent = (cost * 0.1).toFixed(2);
  SUMMARY_TOTAL.textContent = (cost - +DISCOUNT.textContent).toFixed(2);  
}
