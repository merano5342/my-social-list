const BASE_URL = "https://lighthouse-user-api.herokuapp.com/api/v1/users"
const userPanel = document.querySelector("#user-panel")
const resultsTextBox = document.querySelector("#results-text")
const paginator = document.querySelector("#pagination")
const USER_PER_PAGE = 15

const searchInput = document.querySelector('#search-input')
const searchForm = document.querySelector('#search-form')

const UserList = [];

/////////////////////////////////////////////////

// render card
function renderUserList(UserList) {
  // const list = JSON.parse(localStorage.getItem('likedUser')) || []
  let rawHTML = ""

  UserList.forEach((user) => {
    // let heartStatus = "regular"
    // if (list.find((listUser) => listUser.id === user.id)) {
    //   heartStatus = "solid"

    // }
    rawHTML += `
      <div class="card col-3 col-sm-2 m-1" id="user-card" data-bs-toggle="modal" data-bs-target="#modal" data-id="${user.id}">
        <img src="${user.avatar}" class="img-fluid mt-2" id="user-img" alt="user-img">
        <div class="card-body" id="card-body" data-id="${user.id}">
          <h5 class="card-text" id="user-name">${user.name} ${user.surname}  <i class="fa-regular  fa-heart""></i></h5>
        </div>
      </div>
      `
  })
  userPanel.innerHTML = rawHTML
}




function HeartIcon(LikedBooleans) {
  if (LikedBooleans) {
    document.querySelector(".fa-heart").class = "fa-regular";
  } else if (!LikedBooleans) {
    document.querySelector(".fa-heart").class = "fa-solid";
  }
}





function genderIcon(gender) {
  if (gender === "male") {
    document.querySelector(".fa-circle").id = "male-icon";
  } else if (gender === "female") {
    document.querySelector(".fa-circle").id = "female-icon";
  }
}

function showUserModal(id) {
  // const userModal = document.querySelector("#modal");
  const modalName = document.querySelector("#modal-name");
  const modalImg = document.querySelector("#modal-img");
  const modalAgeRegion = document.querySelector("#modal-age-region");
  const modalBirthday = document.querySelector("#modal-birthday");
  const modalEmail = document.querySelector("#modal-email");

  axios.get(BASE_URL + "/" + id).then((response) => {
    const userIdData = response.data;
    modalImg.innerHTML = `<img src="${userIdData.avatar}" class="card-img-top" id="modal-img" alt="modal-img">`;
    modalName.innerText = userIdData.name + " " + userIdData.surname;
    modalAgeRegion.innerText = ` / ${userIdData.age}Y / ${userIdData.region}`;
    modalBirthday.innerText = userIdData.birthday;
    modalEmail.innerText = userIdData.email
    genderIcon(userIdData.gender);
  });
}







//pages

function getUsersByPage(UserList, page) {
  const startIndex = (page - 1) * USER_PER_PAGE
  return UserList.slice(startIndex, startIndex + USER_PER_PAGE)
}


function renderPaginator(userAmount) {
  if (userAmount <= 15) {
    paginator.innerHTML = ''
    return
  } else {
    //計算總頁數
    const numberOfPages = Math.ceil(userAmount / USER_PER_PAGE)

    let rawHTML = ''
    for (let page = 1; page <= numberOfPages; page++) {
      rawHTML += `<li class="page-item"><a class="page-link" href="#" data-page="${page}">${page}</a></li>`
    }
    paginator.innerHTML = rawHTML
  }
}



////////////////////



//search
searchForm.addEventListener('submit', function onSearch(event) {
  event.preventDefault()
  //取得搜尋關鍵字
  const keyword = searchInput.value.trim().toLowerCase()

  //錯誤處理：輸入無效字串
  if (!keyword.length) {
    return alert('請輸入有效字串！')
  }

  //搜尋項目與條件(項目:姓、名、生日)
  const filteredUsers = UserList.filter((user) =>
    user.surname.toLowerCase().includes(keyword) || user.name.toLowerCase().includes(keyword) || user.birthday.toLowerCase().includes(keyword) || (user.name.toLowerCase() + ' ' + user.surname.toLowerCase()).includes(keyword)
  )


  //搜尋結果，若無符合項目產生‘no results’
  function noMatchedResults(keyword) {
    let rawHTML = `<h3 class="font-monospace text-center mt-5">QAQ</h3>
    <h4 class="font-monospace text-center lh-lg mt-3">Can't find anything with<br>keyword:<p class="text-decoration-line-through m-3">${keyword}</p></h4>
    `
    userPanel.innerHTML = rawHTML
  }
  //搜尋結果，有符合項目，產生 Here's results for...
  function resultsText(keyword) {
    let rawHTML = `<h5 class="font-monospace text-center lh-lg mt-3">Here's results for "${keyword}" :</h5>`
    resultsTextBox.innerHTML = rawHTML
  }

  //無符合項目
  if (filteredUsers.length === 0) {
    noMatchedResults(searchInput.value)
    renderPaginator(0)

    //有符合項目
  } else {
    resultsText(searchInput.value)
    renderPaginator(filteredUsers.length)
    renderUserList(getUsersByPage(filteredUsers, 1))
  }

  //消除input裡的文字
  searchInput.value = ''
})






//add to Favorite
function addToFavorite(id) {
  const list = JSON.parse(localStorage.getItem('likedUser')) || []
  const user = UserList.find((user) => user.id === id)
  if (list.find((user) => user.id === id)) {
    return alert('此電影已經在收藏清單中！')
    // renderHeart(user)
  } else {
    list.push(user)
    localStorage.setItem('likedUser', JSON.stringify(list))
  }

}

// function renderHeart(userArr) {
//   const list = JSON.parse(localStorage.getItem('likedUser')) || []
//   if (list.find((likedUser) => likedUser.id === userArr.id)) {
//     const cardBody = document.querySelector('#card-body')
//     let rawHTML = `<h5 class="card-text" id="user-name">${userArr.name} ${userArr.surname}  <i class="fa-solid fa-heart" data-id="${userArr.id}"></i></h5>`
//     cardBody.innerHTML = rawHTML
//     console.log('liked')
//   }
// }


//////////


//監聽器

//card on click
userPanel.addEventListener("click", function onPanelClick(event) {
  const eventTarget = event.target

  if (event.target.matches('.fa-heart')) {
    let userId = eventTarget.dataset.id
    console.log(userId)
    showUserModal(userId)
    // renderHeart(userId)
    addToFavorite(parseInt(userId))

  } else if (eventTarget.parentElement.matches("#user-card")) {
    let userId = eventTarget.parentElement.dataset.id;
    showUserModal(userId)
  }
})

//page on click
paginator.addEventListener("click", function onPanelClick(event) {
  const page = event.target.dataset.page
  renderUserList(getUsersByPage(UserList, page))
})





axios.get(BASE_URL).then((response) => {
  console.log(response.data.results)
  UserList.push(...response.data.results)
  console.log(UserList)
  renderPaginator(UserList.length)
  renderUserList(getUsersByPage(UserList, 1))
})
  .catch(err => console.log(err))