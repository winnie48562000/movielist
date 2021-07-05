const BASE_URL = "https://movie-list.alphacamp.io";
const INDEX_URL = BASE_URL + "/api/v1/movies/";
const POSTER_URL = BASE_URL + "/posters/";
const MOVIES_PER_PAGE = 12;

const movies = [];
let filteredMovies = [];
let mode = "card";

const dataPanel = document.querySelector("#data-panel");
const searchForm = document.querySelector("#search-form");
const searchInput = document.querySelector("#search-input");
const paginator = document.querySelector("#paginator");
const changeMode = document.querySelector("#change-mode");

// 判別電影清單模式
function displayMovieList() {
  const movieList = getMoviesByPage(1);
  mode === "card"
    ? renderMovieListCard(movieList)
    : renderMovieListList(movieList);
}

// 卡片式電影清單
function renderMovieListCard(data) {
  let rawHTML = "";

  data.forEach((item) => {
    // console.log(item)
    rawHTML += `
      <div class="col-sm-3">
        <div class="mb-2">
          <div class="card">
            <img class="card-img-top"
              src="${POSTER_URL + item.image}"
              alt="Movie Poster">
            <div class="card-body">
              <h5 class="movie-title">${item.title}</h5>
            </div>
            <div class="card-footer">
              <button class="btn btn-primary btn-show-movie" data-toggle="modal"
                data-target="#movie-modal" data-id="${item.id}">More</button>
              <button class="btn btn-info btn-add-favorite" data-id="${
                item.id
              }">+</button>
            </div>
          </div>
        </div>
      </div>
    `;
  });
  dataPanel.innerHTML = rawHTML;
}

// 列表式電影清單
function renderMovieListList(data) {
  let rawHTML = "";
  rawHTML += '<table class="table"><tbody>';

  data.forEach((item) => {
    rawHTML += `
      <tr>
        <td>
          <h5 class="card-title">${item.title}</h5>
        </td>
        <td>
          <button class="btn btn-primary btn-show-movie" data-toggle="modal" data-target="#movie-modal" data-id="${item.id}">More</button>
          <button class="btn btn-info btn-add-favorite" data-id="${item.id}">+</button>
        </td>
      </tr>
    `;
  });

  rawHTML += "</tbody></table>";
  dataPanel.innerHTML = rawHTML;
}

// 分頁器清單
function renderPaginator(amount) {
  const numberOfPages = Math.ceil(amount / MOVIES_PER_PAGE);
  let rawHTML = "";

  for (let page = 1; page <= numberOfPages; page++) {
    rawHTML += `
    <li class="page-item"><a class="page-link" href="#" data-page='${page}'>${page}</a></li>
    `;
  }
  paginator.innerHTML = rawHTML;
}

// 電影分頁
function getMoviesByPage(page) {
  const data = filteredMovies.length ? filteredMovies : movies; // 條件 ? A : B
  // 若 條件 為true，回傳 A，false則回傳 B。
  const startIndex = (page - 1) * MOVIES_PER_PAGE;
  return data.slice(startIndex, startIndex + MOVIES_PER_PAGE);
}

// 彈跳式視窗(Modal)顯示電影資訊
function showMovieModal(id) {
  const modalTitle = document.querySelector("#movie-modal-title");
  const modalImage = document.querySelector("#movie-modal-image");
  const modalDate = document.querySelector("#movie-modal-date");
  const modalDescription = document.querySelector("#movie-modal-description");

  axios.get(INDEX_URL + id).then((response) => {
    const data = response.data.results;
    modalTitle.innerText = data.title;
    modalImage.innerHTML = `
      <img src="${
        POSTER_URL + data.image
      }" alt="movie-poster" class="image-fluid">
      `;
    modalDate.innerText = `Release date: ${data.release_date}`;
    modalDescription.innerText = data.description;
  });
}

// localStorage
function addToFavorite(id) {
  const list = JSON.parse(localStorage.getItem("favoriteMovies")) || [];
  const movie = movies.find((movie) => movie.id === id);

  if (list.some((movie) => movie.id === id)) {
    return alert("電影已收藏!");
  }

  list.push(movie);

  localStorage.setItem("favoriteMovies", JSON.stringify(list));
}

// 綁定監聽器
// 詳細資訊 & 加到最愛
dataPanel.addEventListener("click", function onPanelClick(event) {
  if (event.target.matches(".btn-show-movie")) {
    // console.log(event.target.dataset)
    showMovieModal(Number(event.target.dataset.id));
  } else if (event.target.matches(".btn-add-favorite")) {
    addToFavorite(Number(event.target.dataset.id));
  }
});

// 分頁
paginator.addEventListener("click", function onPaginatorClicked(event) {
  if (event.target.tagName !== "A") return;
  const page = Number(event.target.dataset.page);

  renderMovieListCard(getMoviesByPage(page));
});

// 搜尋
searchForm.addEventListener("submit", function onSearchFormSubmitted(event) {
  event.preventDefault();
  const keyword = searchInput.value.trim().toLowerCase();

  // if (!keyword.length) {
  //   return alert('Please enter a valid string')
  // }

  filteredMovies = movies.filter((movie) =>
    movie.title.toLowerCase().includes(keyword)
  );

  if (filteredMovies.length === 0) {
    return alert(`Cannot find movies with keyword: ${keyword}`);
  }

  // for (const movie of movies) {
  //   if (movie.title.toLowerCase().includes(keyword)) {
  //     filteredMovies.push(movie)
  //   }
  // }

  renderPaginator(filteredMovies.length);
  renderMovieListCard(getMoviesByPage(1));
});

// 模式切換
changeMode.addEventListener("click", function onChangeModeClicked(event) {
  // console.log(event.target)
  if (event.target.matches("#card")) {
    mode = "card";
  } else if (event.target.matches("#list")) {
    mode = "list";
  }
  displayMovieList();
});

axios.get(INDEX_URL).then((response) => {
  // console.log(response.data.results) --> 印出來確認內容
  movies.push(...response.data.results); // --> "..." 可連續呼叫並用 push 推入陣列
  renderPaginator(movies.length);
  displayMovieList();
});
