<?php require __DIR__ . '/state.php'; ?>

<!DOCTYPE html>
<html lang="en">
<head>
   <meta charset="UTF-8">
   <meta http-equiv="X-UA-Compatible" content="IE=edge">
   <meta name="viewport" content="width=device-width, initial-scale=1.0">
   <title>jQuery Reactive</title>
   <link rel="stylesheet" href="index.css">
   <link rel="stylesheet" href="prism.css">
</head>
<body>
   <div class="indicators">
      <?php foreach ($state->indicators as $indicator) : ?>
         <div class="indicator">
            <div class="indicator__title"><?= $indicator->title ?></div>
            <div class="indicator__value"><?= $indicator->value ?></div>
            <div>
               <div class="indicator__last-refresh"><?= $indicator->last_refresh ?></div>
               <div class="indicator__refresh-rate"><?= $indicator->refresh_rate ?>s</div>
            </div>
         </div>
      <?php endforeach; ?>
   </div>
   <div class="ranges">
      <label>
         <input type="range" id="rangeHELRefreshRate" min="0.01" max="2" step="0.01">
         HEL refresh rate
      </label>
   </div>
   <div class="use-case">
<pre>











<big>Библиотека: <strong>79 строк</strong> кода без сжатия.</big>
<big>Использует последние фичи JS (старые браузеры плачут, но это поправимо)</big>

Основные понятия:
1. <strong>Конфиг</strong> - объект настроек, который задает какие поля есть в стейте.
2. <strong>Стейт</strong> - объект который отдает библиотека. Отслеживает изменения переменных.

3. <strong><em>Значение по умолчанию</em></strong> - библиотека отслеживает только изменения переменных,
   без присвоения получим undefined при первом обращении. Можно задавать и после создания стейта - 
   вручную.
4. <strong><em>Обработчик</em></strong> - функция, которая вызывается при изменении значения переменной.
   Обычно отвечает за отрисовку изменений на странице (render).

Как пользоваться?
   <pre><code class="language-javascript">const config = {
   rate_default: 10, // Начальное значение, постфикс _default зарезервирован
   rate(value) { // Setter, вызывается при изменении свойства. Value - новое значение
      $('.rate').text(value); // jQuery friendly
   },
};

const state = new State(config);

state.rate++; // При изменении вызывается setter этого свойства</code></pre>

Множественное присваивания для быстрого изменения состояния.
   <pre><code class="language-javascript">// Индикаторы конфига заполним циклом
const config = {
   indicators: {},
   helloMessage(value) {
      alert('Hello, ' + value);
   }
};

// Для всех индикаторов страницы
$('.indicator').each((i, indicator) => {
   // Берем имя (оно же заголовок)
   const name = indicator.querySelector('.indicator__title').textContent;

   // И создаем новый конфиг для этого индикатора
   config.indicators[name] = {
      // Сеттер для значения
      value_default: $('.indicator__value', indicator).text(),
      value(value) {
         $('.indicator__value', indicator).text(value);
      },
      
      // Сеттер для последнего обновления
      lastRefresh_default: '13:12:01',
      lastRefresh(value) {
         $('.indicator__last-refresh', indicator).text(value);
      },
      
      // Сеттер для частоты обновлений
      refreshRate_default: parseFloat($('.indicator__refresh-rate', indicator).text()),
      refreshRate(value) {
         $('.indicator__refresh-rate', indicator).text(value + 's');
      },
   };
});

// Создаем стейт по нашему конфигу
const state = new State(config);

// Теперь можно менять значения переменных индикатора следующим образом
state.indicators = {
   DDS: {
      title: 'DDS1',
      value: 10,
   },
   HEL: {
      lastRefresh: '11:18:30',
   }
};

// Код выше меняет значения только тех переменных, которые были получены в присваиваемом объекте.
// Что не было указано - не затирается.
// Если указано то, что не существует - какает в консоль варнинг.</code></pre>
</pre>
   </div>
   
   <script src="prism.js"></script>
   <script src="https://code.jquery.com/jquery-3.6.0.js" integrity="sha256-H+K7U5CnXl1h5ywQfKtSj8PCmoN9aaq30gDh27Xc0jk=" crossorigin="anonymous"></script>
   <script src="state.js"></script>
   <script src="index.js"></script>
</body>
</html>