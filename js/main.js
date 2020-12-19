// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAISvX4LC51fDS1liVt7a61DzXLcKtkuOg",
  authDomain: "no-name-7526f.firebaseapp.com",
  projectId: "no-name-7526f",
  storageBucket: "no-name-7526f.appspot.com",
  messagingSenderId: "4761611710",
  appId: "1:4761611710:web:0c0a636e3cf7f21cfdddef"
};
// Initialize Firebase
firebase.initializeApp(firebaseConfig);
console.log('firebase: ', firebase);

//создвем переменную в которую ложим кнопку меню
let menuToggle= document.querySelector('#menu-toggle');
//создвем переменную в которую ложим меню
let menu = document.querySelector('.sidebar');


const regExpValidEmail = /^\w+@\w+\.\w{2,}$/;

const loginElem = document.querySelector('.login');
const loginForm = document.querySelector('.login-form');
const emailInput = document.querySelector('.login-email');
const passwordInput = document.querySelector('.login-password');
const loginSignup = document.querySelector('.login-signup');
const userElem = document.querySelector('.user');
const userNameElem = document.querySelector('.user-name');

const exitElem = document.querySelector('.exit');
const editElem = document.querySelector('.edit');
const editContainer = document.querySelector('.edit-container');

const editUsername = document.querySelector('.edit-username');
const editPhotoURL = document.querySelector('.edit-photo');
const userAvatarElem =  document.querySelector('.user-avatar');

const postsWrapper = document.querySelector('.posts');
const buttonNewPost = document.querySelector('.button-new-post');
const addPostElem = document.querySelector('.add-post');
const default_photo = userAvatarElem.src;

const setUsers = {
  user: null,
  initUser(handler){
    firebase.auth().onAuthStateChanged( user => {
      if (user){
        this.user = user;
      } else {
        this.user = null;
      }
      if (handler) handler();
    })
  },
  logIn(email, password, handler){
    if (!regExpValidEmail.test(email)) {
      alert('email не валиден');
      return ;
    }

    firebase.auth().signInWithEmailAndPassword(email, password)
    .catch( err => {
      const errCode = err.code;
      const errMessage = err.message;
      if (errCode === 'auth/wrong-password'){
        console.log(errMessage);
        alert('Неверный пароль')
      } else if (errCode === 'auth/user-not-found'){
        console.log(errMessage);
        alert('Пользователь не найден')
      } else{
        alert(errMessage)
      }
      console.log(err);
    })

    // const user = this.getUser(email);
    // if(user && user.password === password){
    //   this.authorizedUser(user)
    //   handler();
    // } else{
    //   alert('Пользователь с такими данными не найден')
    // } 
  },
  logOut(){
    firebase.auth().signOut();
    
  },
  signUp(email, password, handler){
    if (!regExpValidEmail.test(email)) {
      alert('email не валиден');
      return ;
    }
    
    if (!email.trim() || !password.trim()){
      alert('Введите данные')
      return;
    }

    firebase.auth()
    .createUserWithEmailAndPassword(email, password)
    .then(data => {
      this.editUser(email.substring(0, email.indexOf('@')), null, handler)
    })
    .catch(err => {
      const errCode = err.code;
      const errMessage = err.message;
      if (errCode === 'auth/weak-password'){
        console.log(errMessage);
        alert('Слабый пароль')
      } else if (errCode === 'auth/email-already-in-use'){
        console.log(errMessage);
        alert('Этот email уже используется')
      } else{
        alert(errMessage)
      }

      console.log(err);
    });

   // if (!this.getUser(email)){
   //   const user = {email, password, displayName: email.substring(0, email.indexOf('@'))};
   //   listUsers.push(user);
   //   this.authorizedUser(user)
   //   handler();
   // } else {
   //   alert('Пользователь с таким email уже зарегистрирован')
   // }
  },
  editUser(displayName, photoURL, handler){
    const user = firebase.auth().currentUser;
   
    if (displayName){
      if (photoURL){
        user.updateProfile({
          displayName,
          photoURL
        }).then(handler)
      } else {
        user.updateProfile({
          displayName
        }).then(handler)
      }
    }
    handler();
  },
  // getUser(email){
  //   return listUsers.find(item => item.email === email)
  // },
  // authorizedUser(user){
  //   this.user = user;
  // }
  sendForget(email){
    firebase.auth().sendPasswordResetEmail(email) 
      .then(() => {
        alert('Gисьмо отправлено')
      })
      .catch(err => {
        console.log(err);
      })
  }
};

const loginForget = document.querySelector('.login-forget');

loginForget.addEventListener('click', event => {
  event.preventDefault();
  setUsers.sendForget(emailInput.value);
  emailInput.value = '';
})

const setPosts = {
  allPosts: [],
  addPost(title, text, tags, handler){
    const user = firebase.auth().currentUser;

    this.allPosts.unshift({
      id:`postID${(+new Date()).toString(16)}-${user.uid}`,
      title,
      text,
      tags: tags.split(',').map(item => item.trim()),
      author:{
        displayName: setUsers.user.displayName,
        photo: setUsers.user.photoURL,
      },
      date:new Date().toLocaleString(),
      like: 0,
      comments: 0,
    })
    firebase.database().ref('post').set(this.allPosts)
      .then(() => this.getPosts(handler)) 
 
    },
    getPosts(handler){
      firebase.database().ref('post').on('value', snapshot =>{
        this.allPosts = snapshot.val() || [];
        handler();
      })
    }
  };

const toggleAuthDom = () => {
  const user = setUsers.user;
  console.log('user: ', user);

  if (user){
    loginElem.style.display = 'none';
    userElem.style.display = '';
    userNameElem.textContent = user.displayName;
    userAvatarElem.src = user.photoURL || default_photo;
    buttonNewPost.classList.add('visible');
  }else{
    loginElem.style.display = '';
    userElem.style.display = 'none';
    buttonNewPost.classList.remove('visible');
    addPostElem.classList.remove('visible');
    postsWrapper.classList.add('visible');
  }
};

const showAddPost = () => {
  addPostElem.classList.add('visible');
  postsWrapper.classList.remove('visible');
}

const showAllPosts = () =>{
  let postsHTML = '';

  setPosts.allPosts.forEach(({title, text, date, tags, like, comments, author}) => {

    postsHTML += `
    <section class="post">
    <div class="post-body">
      <h2 class="post-title">${title}</h2>
      <p class="post-text">${text}</p>
      <div class="tags">
        ${tags.map(tag => `<a href="#${tag}" class="tag">#${tag}</a>`)}
      </div>
    </div>
    <!-- /.post-body -->
    <div class="post-footer">
      <div class="post-buttons">
        <button class="post-button likes">
          <svg class="icon icon-like" width="19" height="20" viewBox="0 0 19 20" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M18.1383 10.5094C18.532 9.98909 18.75 9.35159 18.75 8.6883C18.75 7.63596 18.1617 6.63987 17.2148 6.0844C16.9711 5.94142 16.6935 5.86617 16.4109 5.86643H10.7906L10.9313 2.98596C10.9641 2.28987 10.718 1.62893 10.2398 1.12502C10.0052 0.876652 9.72212 0.679038 9.40808 0.544395C9.09405 0.409752 8.75574 0.34094 8.41406 0.342211C7.19531 0.342211 6.11719 1.16252 5.79375 2.33674L3.78047 9.62581H0.75C0.335156 9.62581 0 9.96096 0 10.3758V18.9071C0 19.3219 0.335156 19.6571 0.75 19.6571H14.843C15.0586 19.6571 15.2695 19.6149 15.4641 19.5305C16.5797 19.0547 17.2992 17.9649 17.2992 16.7555C17.2992 16.4602 17.257 16.1696 17.1727 15.8883C17.5664 15.368 17.7844 14.7305 17.7844 14.0672C17.7844 13.7719 17.7422 13.4813 17.6578 13.2C18.0516 12.6797 18.2695 12.0422 18.2695 11.3789C18.2648 11.0836 18.2227 10.7906 18.1383 10.5094V10.5094ZM1.6875 17.9696V11.3133H3.58594V17.9696H1.6875ZM16.6031 9.69612L16.0898 10.1414L16.4156 10.7367C16.523 10.9328 16.5786 11.153 16.5773 11.3766C16.5773 11.7633 16.4086 12.1313 16.118 12.3844L15.6047 12.8297L15.9305 13.425C16.0378 13.6211 16.0935 13.8413 16.0922 14.0649C16.0922 14.4516 15.9234 14.8196 15.6328 15.0727L15.1195 15.518L15.4453 16.1133C15.5526 16.3094 15.6083 16.5296 15.607 16.7531C15.607 17.2781 15.2977 17.7516 14.8195 17.9672H5.08594V11.2383L7.41797 2.78909C7.4781 2.57252 7.60719 2.38147 7.78566 2.24486C7.96414 2.10825 8.18228 2.03354 8.40703 2.03205C8.58516 2.03205 8.76094 2.08362 8.90156 2.18909C9.13359 2.36252 9.25781 2.62502 9.24375 2.90393L9.01875 7.55393H16.3875C16.8047 7.8094 17.0625 8.24065 17.0625 8.6883C17.0625 9.07502 16.8938 9.44065 16.6031 9.69612Z" />
            </svg>
            
        <span class="likes-counter">${like}</span>
        </button>
        <button class="post-button comments">
          <svg class="icon icon-comment" width="22" height="22" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M9.75013 11C9.75013 11.2984 9.86866 11.5845 10.0796 11.7955C10.2906 12.0065 10.5768 12.125 10.8751 12.125C11.1735 12.125 11.4596 12.0065 11.6706 11.7955C11.8816 11.5845 12.0001 11.2984 12.0001 11C12.0001 10.7016 11.8816 10.4155 11.6706 10.2045C11.4596 9.99353 11.1735 9.875 10.8751 9.875C10.5768 9.875 10.2906 9.99353 10.0796 10.2045C9.86866 10.4155 9.75013 10.7016 9.75013 11ZM14.4376 11C14.4376 11.2984 14.5562 11.5845 14.7671 11.7955C14.9781 12.0065 15.2643 12.125 15.5626 12.125C15.861 12.125 16.1471 12.0065 16.3581 11.7955C16.5691 11.5845 16.6876 11.2984 16.6876 11C16.6876 10.7016 16.5691 10.4155 16.3581 10.2045C16.1471 9.99353 15.861 9.875 15.5626 9.875C15.2643 9.875 14.9781 9.99353 14.7671 10.2045C14.5562 10.4155 14.4376 10.7016 14.4376 11ZM5.06263 11C5.06263 11.2984 5.18116 11.5845 5.39214 11.7955C5.60312 12.0065 5.88926 12.125 6.18763 12.125C6.486 12.125 6.77215 12.0065 6.98313 11.7955C7.19411 11.5845 7.31263 11.2984 7.31263 11C7.31263 10.7016 7.19411 10.4155 6.98313 10.2045C6.77215 9.99353 6.486 9.875 6.18763 9.875C5.88926 9.875 5.60312 9.99353 5.39214 10.2045C5.18116 10.4155 5.06263 10.7016 5.06263 11ZM20.5595 6.93125C20.0298 5.67266 19.2704 4.54297 18.3025 3.57266C17.3413 2.60796 16.2002 1.84114 14.9439 1.31563C13.6548 0.774219 12.2861 0.5 10.8751 0.5H10.8283C9.40795 0.507031 8.03216 0.788281 6.73841 1.34141C5.49285 1.87232 4.36247 2.64049 3.41029 3.60312C2.4517 4.57109 1.69935 5.69609 1.17904 6.95C0.639977 8.24844 0.368102 9.62891 0.375133 11.0492C0.383086 12.6769 0.768161 14.2806 1.50013 15.7344V19.2969C1.50013 19.5828 1.61372 19.857 1.81591 20.0592C2.0181 20.2614 2.29232 20.375 2.57826 20.375H6.1431C7.59692 21.107 9.20059 21.492 10.8283 21.5H10.8775C12.2814 21.5 13.6431 21.2281 14.9251 20.6961C16.1751 20.1768 17.3119 19.419 18.272 18.4648C19.24 17.5063 20.0017 16.3859 20.5337 15.1367C21.0869 13.843 21.3681 12.4672 21.3751 11.0469C21.3822 9.61953 21.1056 8.23438 20.5595 6.93125ZM17.0181 17.1969C15.3751 18.8234 13.1954 19.7188 10.8751 19.7188H10.8353C9.42201 19.7117 8.0181 19.3602 6.77826 18.6992L6.58138 18.5938H3.28138V15.2938L3.17591 15.0969C2.51498 13.857 2.16341 12.4531 2.15638 11.0398C2.14701 8.70312 3.03998 6.50937 4.67826 4.85703C6.3142 3.20469 8.50091 2.29062 10.8376 2.28125H10.8775C12.0494 2.28125 13.1861 2.50859 14.2572 2.95859C15.3025 3.39687 16.24 4.02734 17.0462 4.83359C17.8501 5.6375 18.4829 6.57734 18.9212 7.62266C19.3759 8.70547 19.6033 9.85391 19.5986 11.0398C19.5845 13.3742 18.6681 15.5609 17.0181 17.1969Z"/>
            </svg>                
        <span class="comment-counter">${comments}</span>
        </button>
        <button class="post-button save">
          <svg class="icon icon-save" width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M19.1867 4.87422L15.3757 1.06328C15.1999 0.8875 14.9843 0.758594 14.7499 0.688281V0.625H1.62494C1.2101 0.625 0.874939 0.960156 0.874939 1.375V18.625C0.874939 19.0398 1.2101 19.375 1.62494 19.375H18.8749C19.2898 19.375 19.6249 19.0398 19.6249 18.625V5.93359C19.6249 5.53516 19.4679 5.15547 19.1867 4.87422ZM7.24994 2.3125H13.2499V4.75H7.24994V2.3125ZM17.9374 17.6875H2.56244V2.3125H5.74994V5.5C5.74994 5.91484 6.0851 6.25 6.49994 6.25H13.9999C14.4148 6.25 14.7499 5.91484 14.7499 5.5V2.82344L17.9374 6.01094V17.6875ZM10.2499 8.35938C8.38666 8.35938 6.87494 9.87109 6.87494 11.7344C6.87494 13.5977 8.38666 15.1094 10.2499 15.1094C12.1132 15.1094 13.6249 13.5977 13.6249 11.7344C13.6249 9.87109 12.1132 8.35938 10.2499 8.35938ZM10.2499 13.6094C9.214 13.6094 8.37494 12.7703 8.37494 11.7344C8.37494 10.6984 9.214 9.85938 10.2499 9.85938C11.2859 9.85938 12.1249 10.6984 12.1249 11.7344C12.1249 12.7703 11.2859 13.6094 10.2499 13.6094Z"/>
            </svg>
            
        </button>
        <button class="post-button share">
          <svg class="icon icon-share" width="18" height="19" viewBox="0 0 18 19" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M14.6874 12.75C14.0195 12.75 13.4031 12.9844 12.9203 13.3758L8.064 9.8625C8.14532 9.41617 8.14532 8.95883 8.064 8.5125L12.9203 4.99922C13.4031 5.39062 14.0195 5.625 14.6874 5.625C16.239 5.625 17.4999 4.36406 17.4999 2.8125C17.4999 1.26094 16.239 0 14.6874 0C13.1359 0 11.8749 1.26094 11.8749 2.8125C11.8749 3.08437 11.9124 3.34453 11.9851 3.59297L7.37259 6.93281C6.68822 6.02578 5.60072 5.4375 4.37494 5.4375C2.30306 5.4375 0.624939 7.11562 0.624939 9.1875C0.624939 11.2594 2.30306 12.9375 4.37494 12.9375C5.60072 12.9375 6.68822 12.3492 7.37259 11.4422L11.9851 14.782C11.9124 15.0305 11.8749 15.293 11.8749 15.5625C11.8749 17.1141 13.1359 18.375 14.6874 18.375C16.239 18.375 17.4999 17.1141 17.4999 15.5625C17.4999 14.0109 16.239 12.75 14.6874 12.75ZM14.6874 1.59375C15.3601 1.59375 15.9062 2.13984 15.9062 2.8125C15.9062 3.48516 15.3601 4.03125 14.6874 4.03125C14.0148 4.03125 13.4687 3.48516 13.4687 2.8125C13.4687 2.13984 14.0148 1.59375 14.6874 1.59375ZM4.37494 11.25C3.23822 11.25 2.31244 10.3242 2.31244 9.1875C2.31244 8.05078 3.23822 7.125 4.37494 7.125C5.51166 7.125 6.43744 8.05078 6.43744 9.1875C6.43744 10.3242 5.51166 11.25 4.37494 11.25ZM14.6874 16.7812C14.0148 16.7812 13.4687 16.2352 13.4687 15.5625C13.4687 14.8898 14.0148 14.3438 14.6874 14.3438C15.3601 14.3438 15.9062 14.8898 15.9062 15.5625C15.9062 16.2352 15.3601 16.7812 14.6874 16.7812Z"/>
            </svg>
            
        </button>
      </div>
      <div class="post-author">
        <div class="author-about">
          <a href="#" class="author-username">
            ${author.displayName}
          </a>
          <span class="post-time">${date}</span>
        </div>
        <a href="" class="author-link">
          <img src = ${author.photo || "img/avatar.jpg"}  alt="avatar" class="author-avatar">
        </a>
      </div>
    </div>
  </section>
    `;
  })
  postsWrapper.innerHTML = postsHTML;

  addPostElem.classList.remove('visible');
  postsWrapper.classList.add('visible');
} ;

const init = () => {
  loginForm.addEventListener('submit', event => {
    event.preventDefault();
  
    const emailValue  = emailInput.value;
    const passwordValue = passwordInput.value;
    
    setUsers.logIn(emailValue, passwordValue, toggleAuthDom);
    loginForm.reset();
  });
  
  loginSignup.addEventListener('click', event => {
    event.preventDefault();
  
    const emailValue  = emailInput.value;
    const passwordValue = passwordInput.value;
    
    setUsers.signUp(emailValue, passwordValue, toggleAuthDom);
    loginForm.reset();
  });
  
  exitElem.addEventListener('click', event => {
    event.preventDefault();
    setUsers.logOut();
  
  })
  editElem.addEventListener('click', event => {
    event.preventDefault();
    editContainer.classList.toggle('visible');
    editUsername.value = setUsers.user.displayName;
  });
  editContainer.addEventListener('submit', event => {
    event.preventDefault();
    setUsers.editUser(editUsername.value, editPhotoURL.value, toggleAuthDom);
    editContainer.classList.remove('visible');
  });

    //отслеживаем клик по кнопке меню и запускаем функцию 
  menuToggle.addEventListener('click', function(event){
    //отменяем стандартное поведение ссылки
    event.preventDefault();
    //вешаем класс на меню, когда кликнули на кнопку меню
    menu.classList.toggle('visible');
})

  buttonNewPost.addEventListener('click', event =>{
    event.preventDefault();
    showAddPost();
  });

  addPostElem.addEventListener('submit', event => {
    event.preventDefault();
    const {title, text, tags} = addPostElem.elements;

    if(title.value.length < 6){
      alert('Слишком короткий заголовок');
      return;
    }
    if(text.value.length < 50){
      alert('Слишком короткий пост');
      return;
    }

    setPosts.addPost(title.value, text.value, tags.value, showAllPosts);

    addPostElem.classList.remove('visible');
    addPostElem.reset();

  });
  setUsers.initUser(toggleAuthDom)
  setPosts.getPosts(showAllPosts)

}
document.addEventListener('DOMContentLoaded', init)



