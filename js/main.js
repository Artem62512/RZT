// Данные альбомов — структура с информацией об альбомах, треках и обложках
const albumsData = {
    zlyden: {
        name: 'Злыдень',
        artist: 'A.TiC',
        cover: 'images/album/Злыдень.jpg',
        tracks: [
            "В рамках жанра", "Бронсон", "Дикий козёл", "Бездельник", "В клетках",
            "Тофу", "Вся моя", "Коррида", "Злыдень", "Она", "Как все", "Разум и тело",
            "Дерьмо для улиц", "Грув", "Рики-Тики-Тави", "Среди своих", "Странно так",
            "Сыр-бор", "Салют"
        ]
    },
    album2: {
        name: 'Дождя не будет',
        artist: 'A.TiC, VIZLO',
        cover: 'images/album/Дождя.jpg',
        tracks: ["Трек 1", "Трек 2", "Трек 3"]
    },
    album3: {
        name: 'Самобыт',
        artist: 'VIZLO',
        cover: 'images/album/Самобыт.jpg',
        tracks: ["Песня А", "Песня Б", "Песня В"]
    },
    album4: {
        name: 'Реквием Бродяге',
        artist: 'A.TiC',
        cover: 'images/album/Реквием.jpg',
        tracks: ["Трек A", "Трек B"]
    },
    album5: {
        name: 'Viz-Fi-Vibe Vol.1',
        artist: 'VIZLO',
        cover: 'images/album/Визфай.jpg',
        tracks: ["Трек X", "Трек Y", "Трек Z"]
    },
    album6: {
        name: 'Pills And Lies',
        artist: 'BubbaTheAlchemist, A.TiC',
        cover: 'images/album/Пилюли.jpg',
        tracks: ["Трек M", "Трек N"]
    }
};

let currentAlbum = 'zlyden';  // Текущий выбранный альбом

// Элементы DOM — для управления интерфейсом
const albumCoversContainer = document.getElementById('album-covers-container');
const albumCover = document.getElementById('album-cover');
const albumName = document.getElementById('album-name');
const artistName = document.getElementById('artist-name');
const trackSelect = document.getElementById('track-select');
const saveStatus = document.getElementById('save-status');
const totalDisplay = document.getElementById('total');
const saveBtn = document.getElementById('save-btn');
const showResultsBtn = document.getElementById('show-results-btn');
const resultsContainer = document.getElementById('results-container');
const albumAverageDiv = document.getElementById('album-average');
const trackListUl = document.getElementById('track-list');

const dropZone = document.getElementById('drop-zone');
const fileInput = document.getElementById('album-cover-file');
const coverPreview = document.getElementById('cover-preview');
const coverImg = coverPreview.querySelector('img');
const removeBtn = document.getElementById('remove-cover-btn');

const sliders = [
    document.getElementById('s1'),
    document.getElementById('s2'),
    document.getElementById('s3'),
    document.getElementById('s4'),
    document.getElementById('s5')
];
const values = [
    document.getElementById('val1'),
    document.getElementById('val2'),
    document.getElementById('val3'),
    document.getElementById('val4'),
    document.getElementById('val5')
];

// =========================
// Функции для управления треками и оценками
// =========================

// Заполняет список треков выбранного альбома в селекте
function populateTracks(albumId) {
    const album = albumsData[albumId];
    trackSelect.innerHTML = '';
    album.tracks.forEach(track => {
        const opt = document.createElement('option');
        opt.value = track;
        opt.textContent = track;
        trackSelect.appendChild(opt);
    });
}

// Сбрасывает все слайдеры оценки на значение 5 и обновляет их отображение
function resetSliders() {
    sliders.forEach((slider, i) => {
        slider.value = 5;
        values[i].textContent = '5';
    });
    updateTotal();
}

// Обновляет отображение информации об альбоме (обложка, имя, артист, треки)
function updateAlbumDisplay(albumId) {
    const album = albumsData[albumId];
    albumCover.src = album.cover;
    albumName.textContent = album.name;
    artistName.textContent = album.artist;

    populateTracks(albumId);
    resetSliders();

    totalDisplay.textContent = "--- / ---";  // Сбрасываем общий рейтинг
    saveStatus.textContent = "";            // Сбрасываем статус сохранения
    resultsContainer.style.display = 'none'; // Скрываем результаты
}

// Вычисляет и обновляет итоговый рейтинг на основе значений слайдеров
function updateTotal() {
    // Сумма первых 4 слайдеров
    const baseSum = Number(sliders[0].value) + Number(sliders[1].value) + Number(sliders[2].value) + Number(sliders[3].value);
    const afterFirstMultiplier = baseSum * 1.4;

    // Пятый слайдер (атмосфера) с коррекцией
    const atmosphereVal = Number(sliders[4].value);
    const multiplierAtmosphere = 1 + (atmosphereVal - 1) * 0.06747;

    // Итоговый скор
    const finalScore = afterFirstMultiplier * multiplierAtmosphere;

    const displayScore = finalScore.toFixed(1);
    const scoreNum = Number(displayScore);

    totalDisplay.textContent = `${Math.round(scoreNum)} / 90`;

    return finalScore;
}

// Сохраняет рейтинг текущего трека в localStorage и переключается на следующий трек
function saveRating() {
    const track = trackSelect.value;
    if (!track) return;

    const rating = updateTotal();

    const storageKey = `ratings_${currentAlbum}`;
    let ratings = JSON.parse(localStorage.getItem(storageKey)) || {};

    ratings[track] = rating;
    localStorage.setItem(storageKey, JSON.stringify(ratings));

    saveStatus.textContent = "Сохранено";

    // Переходим к следующему треку
    const tracks = albumsData[currentAlbum].tracks;
    const currentIndex = tracks.indexOf(track);
    const nextIndex = (currentIndex + 1) % tracks.length;
    trackSelect.value = tracks[nextIndex];

    resetSliders();
    updateTotal();
    updateShowResultsButton();
}

// Показывает или скрывает кнопку отображения результатов, если есть оценки
function updateShowResultsButton() {
    const storageKey = `ratings_${currentAlbum}`;
    let ratings = JSON.parse(localStorage.getItem(storageKey)) || {};
    if (Object.keys(ratings).length > 0) {
        showResultsBtn.style.display = 'block';
    } else {
        showResultsBtn.style.display = 'none';
    }
}

// Отображает результаты — список треков с их рейтингами и средний рейтинг альбома
function showResults() {
    const storageKey = `ratings_${currentAlbum}`;
    let ratings = JSON.parse(localStorage.getItem(storageKey)) || {};

    if (Object.keys(ratings).length === 0) {
        resultsContainer.style.display = 'none';
        return;
    }

    const albumTracks = albumsData[currentAlbum].tracks;
    const ratedTracks = albumTracks.filter(t => ratings[t] !== undefined);

    // Вычисляем средний рейтинг
    let sumRatings = 0;
    ratedTracks.forEach(t => sumRatings += ratings[t]);
    const avgRating = ratedTracks.length > 0 ? Math.round(sumRatings / ratedTracks.length) : 0;

    albumAverageDiv.textContent = `Рейтинг альбома "${albumsData[currentAlbum].name}" — ${avgRating}`;

    // Создаем список треков с рейтингами
    trackListUl.innerHTML = '';
    albumTracks.forEach(track => {
        const rating = ratings[track] !== undefined ? Math.round(ratings[track]) : '-';
        const li = document.createElement('li');
        li.textContent = track;

        const span = document.createElement('span');
        span.textContent = rating;
        li.appendChild(span);

        trackListUl.appendChild(li);
    });

    resultsContainer.style.display = 'block';
}

// =========================
// Обработчики событий слайдеров и кнопок
// =========================

// Обновляем значения рядом со слайдерами и общий рейтинг при движении слайдера
sliders.forEach((slider, i) => {
    slider.addEventListener('input', () => {
        values[i].textContent = slider.value;
        updateTotal();
    });
});

// Кнопка сохранить оценку
saveBtn.addEventListener('click', saveRating);

// Кнопка показать результаты
showResultsBtn.addEventListener('click', showResults);

// При смене трека — сбрасываем статус и скрываем результаты
trackSelect.addEventListener('change', () => {
    saveStatus.textContent = '';
    resultsContainer.style.display = 'none';
    resetSliders();
});

// =========================
// Управление списком обложек альбомов и добавлением новых
// =========================

// Модальные элементы для добавления альбома
const modalOverlay = document.getElementById('modal-overlay');
const addAlbumForm = document.getElementById('add-album-form');
const cancelAddBtn = document.getElementById('cancel-add-album');

// Создаем и отображаем обложки всех альбомов + кнопку добавления
function createAlbumCovers() {
    albumCoversContainer.innerHTML = '';

    Object.entries(albumsData).forEach(([id, album]) => {
        const img = document.createElement('img');
        img.src = album.cover;
        img.alt = album.name;
        img.classList.add('album-cover-item');
        if (id === currentAlbum) img.classList.add('selected');
        img.tabIndex = 0;
        img.setAttribute('role', 'listitem');

        // Клик по обложке — переключение альбома
        img.addEventListener('click', () => {
            if (currentAlbum !== id) {
                currentAlbum = id;
                updateAlbumDisplay(currentAlbum);
                updateShowResultsButton();
                saveStatus.textContent = '';
                createAlbumCovers();  // обновляем выделение
            }
        });

        // Обработка нажатия Enter/Space на обложке для доступности
        img.addEventListener('keydown', e => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                img.click();
            }
        });

        albumCoversContainer.appendChild(img);
    });

    // Кнопка добавления нового альбома
    const addBtn = document.createElement('div');
    addBtn.textContent = '➕';
    addBtn.title = 'Добавить новый альбом';
    addBtn.classList.add('album-cover-item', 'add-album-button');

    addBtn.addEventListener('click', () => {
        modalOverlay.classList.add('active');
        document.getElementById('new-album-name').focus();
    });

    albumCoversContainer.appendChild(addBtn);
}

// Закрытие модального окна добавления альбома
cancelAddBtn.addEventListener('click', () => {
    addAlbumForm.reset();
    modalOverlay.classList.remove('active');
    document.getElementById('new-album-name').focus();
});

// Закрытие модалки при клике вне формы
modalOverlay.addEventListener('click', (e) => {
    if (e.target === modalOverlay) {
        addAlbumForm.reset();
        modalOverlay.classList.remove('active');
    }
});

// Обработка отправки формы добавления нового альбома
addAlbumForm.addEventListener('submit', e => {
    e.preventDefault();

    const name = document.getElementById('new-album-name').value.trim();
    const artist = document.getElementById('new-album-artist').value.trim();
    const cover = document.getElementById('new-album-cover').value.trim();
    const tracksRaw = document.getElementById('new-album-tracks').value.trim();

    if (!name || !artist || !cover || !tracksRaw) {
        alert('Пожалуйста, заполните все поля.');
        return;
    }

    const tracks = tracksRaw.split(',').map(t => t.trim()).filter(t => t);

    // Генерируем уникальный ID альбома
    let id = name.toLowerCase().replace(/\s+/g, '_');
    let suffix = 1;
    while (albumsData[id]) {
        id = `${name.toLowerCase().replace(/\s+/g, '_')}_${suffix}`;
        suffix++;
    }

    // Добавляем новый альбом в данные
    albumsData[id] = { name, artist, cover, tracks };

    // Обновляем UI
    currentAlbum = id;
    createAlbumCovers();
    updateAlbumDisplay(currentAlbum);
    updateShowResultsButton();
    saveStatus.textContent = '';
    addAlbumForm.reset();
    modalOverlay.classList.remove('active');
});

// Скролл списка обложек альбомов горизонтально колесиком мыши
albumCoversContainer.addEventListener('wheel', (e) => {
  e.preventDefault();
  albumCoversContainer.scrollLeft += e.deltaY;
});

// =========================
// Работа с загрузкой и предпросмотром обложек
// =========================

// Показывает предпросмотр загруженной обложки из файла
function showCoverPreview(file) {
  const reader = new FileReader();
  reader.onload = e => {
    coverImg.src = e.target.result;
    coverPreview.style.display = 'inline-block';
  };
  reader.readAsDataURL(file);
}

// Обработка выбора файла через input type="file"
fileInput.addEventListener('change', () => {
  if (fileInput.files.length > 0) {
    showCoverPreview(fileInput.files[0]);
  }
});

// Клик по зоне дропа открывает диалог выбора файла
dropZone.addEventListener('click', () => {
  fileInput.click();
});

// Подсветка зоны дропа при наведении файла
dropZone.addEventListener('dragover', e => {
  e.preventDefault();
  dropZone.style.backgroundColor = 'rgba(0, 204, 255, 0.1)';
  dropZone.style.borderColor = '#00ccff';
});
dropZone.addEventListener('dragleave', e => {
  e.preventDefault();
  dropZone.style.backgroundColor = 'transparent';
  dropZone.style.borderColor = '#00ccff';
});

// Обработка дропа файла в зону, синхронизация input и предпросмотр
dropZone.addEventListener('drop', e => {
  e.preventDefault();
  dropZone.style.backgroundColor = 'transparent';
  dropZone.style.borderColor = '#00ccff';

  if (e.dataTransfer.files.length > 0) {
    fileInput.files = e.dataTransfer.files;
    showCoverPreview(e.dataTransfer.files[0]);
  }
});

// Удаление загруженной обложки (сброс)
removeBtn.addEventListener('click', () => {
  coverPreview.style.display = 'none';
  coverImg.src = '';
  fileInput.value = '';
});

// =========================
// Инициализация страницы
// =========================

createAlbumCovers();
updateAlbumDisplay(currentAlbum);
updateShowResultsButton();
resetSliders();
updateTotal();
